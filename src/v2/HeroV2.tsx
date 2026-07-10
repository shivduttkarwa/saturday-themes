import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createFlyMedia } from './flyMedia'

gsap.registerPlugin(ScrollTrigger)

const PILLS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=400&auto=format&fit=crop',
]

const REEL_IMG =
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2400&auto=format&fit=crop'

/* masked word — slides up out of its own clip on entrance */
function W({ children }: { children: ReactNode }) {
  return (
    <span className="g-wmask">
      <span className="g-w">{children}</span>
    </span>
  )
}

export default function HeroV2({ ready }: { ready: boolean }) {
  const wrap = useRef<HTMLDivElement>(null)
  const slot = useRef<HTMLSpanElement>(null)
  const slotImg = useRef<HTMLImageElement>(null)
  const reel = useRef<HTMLElement>(null)
  const fix = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intro = useRef({ s: 1 })

  /* ---- the liquid flight: WebGL cloth plane morphs from slot to full-bleed ---- */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !wrap.current) return

    const showStatic = () => {
      canvas.style.opacity = '0'
      if (fix.current) fix.current.style.opacity = '1'
    }

    const fly = createFlyMedia(canvas, REEL_IMG)
    if (!fly) {
      // no WebGL — the pill stays as a plain image in the headline
      showStatic()
      return
    }
    // GL owns the pill now; hide the in-text fallback image
    const slotImgEl = slotImg.current
    if (slotImgEl) slotImgEl.style.visibility = 'hidden'

    let target = 0
    const st = ScrollTrigger.create({
      trigger: reel.current!,
      start: 'top bottom',
      end: 'top top',
      onUpdate: (self) => {
        target = self.progress
      },
    })

    const easePos = gsap.parseEase('power2.inOut')
    let p = 0

    const tick = (time: number) => {
      if (!wrap.current || !slot.current || !reel.current) return

      p += (target - p) * 0.14
      if (Math.abs(target - p) < 0.001) p = target

      // hand off to the static full-bleed panel once landed
      const done = p > 0.992
      canvas.style.opacity = done ? '0' : '1'
      if (fix.current) fix.current.style.opacity = done ? '1' : '0'
      if (done) return

      const wr = wrap.current.getBoundingClientRect()
      if (wr.bottom < -100 || wr.top > window.innerHeight + 100) {
        canvas.style.opacity = '0'
        return
      }

      const sr = slot.current.getBoundingClientRect()
      const rr = reel.current.getBoundingClientRect()
      const pe = easePos(p)

      let w = sr.width + (rr.width - sr.width) * pe
      let h = sr.height + (rr.height - sr.height) * pe
      let x = sr.left + (rr.left - sr.left) * pe
      let y = sr.top + (rr.top - sr.top) * pe

      // entrance pop
      const s = intro.current.s
      x += (w * (1 - s)) / 2
      y += (h * (1 - s)) / 2
      w *= s
      h *= s

      // idle float while parked in the sentence
      y += Math.sin(time * 1.9) * h * 0.05 * (1 - p)

      // the cloth wave — silent at rest, wild mid-flight, flat on landing
      const amp = Math.sin(Math.PI * p) * Math.min(150, 30 + h * 0.28) + (1 - p) * 1.5
      const radius = (Math.min(w, h) / 2) * (1 - pe)
      const shade = Math.min(Math.max((p - 0.6) / 0.4, 0), 1) * 0.45

      fly.draw({ x, y, w, h, amp, time, radius, shade })
    }

    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      st.kill()
      fly.destroy()
      if (slotImgEl) slotImgEl.style.visibility = ''
    }
  }, [])

  /* ---- statement fades up as the panel locks in ---- */
  useGSAP(
    () => {
      gsap.fromTo(
        '.g-reel-statement',
        { autoAlpha: 0, y: 70 },
        {
          autoAlpha: 1,
          y: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: reel.current,
            start: 'top 18%',
            end: 'top top',
            scrub: 0.4,
          },
        }
      )
    },
    { scope: wrap }
  )

  /* ---- entrance, once the loader lifts ---- */
  useGSAP(
    () => {
      if (!ready) return

      gsap.from('.g-w', {
        yPercent: 120,
        duration: 1,
        stagger: 0.06,
        ease: 'power4.out',
        delay: 0.1,
      })

      gsap.from('.g-pill', {
        scale: 0,
        rotation: -14,
        duration: 0.9,
        stagger: 0.09,
        ease: 'back.out(1.8)',
        delay: 0.55,
      })

      // the GL pill pops in via the intro scale factor
      intro.current.s = 0
      gsap.to(intro.current, { s: 1, duration: 0.9, ease: 'back.out(1.6)', delay: 0.7 })

      // pills bob gently once they've landed
      gsap.to('.g-pill', {
        yPercent: -7,
        duration: 1.7,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        stagger: 0.25,
        delay: 1.5,
      })

      // hand-drawn arrow sketches itself on
      const path = wrap.current!.querySelector<SVGPathElement>('.g-arrow-stroke')
      if (path) {
        const len = path.getTotalLength()
        gsap.fromTo(
          path,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', delay: 0.85 }
        )
      }
      gsap.from('.g-arrow-head', { autoAlpha: 0, duration: 0.3, delay: 1.8 })

      gsap.from('.g-meta-row > *, .g-hero-bottom > *', {
        y: 24,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.07,
        ease: 'power3.out',
        delay: 0.7,
      })
    },
    { scope: wrap, dependencies: [ready] }
  )

  return (
    <div className="g-heroWrap" id="top" ref={wrap}>
      <section className="g-hero">
        <div className="g-meta-row">
          <span className="g-label">Saturday Themes®</span>
          <span className="g-label">Premium web studio</span>
          <span className="g-label">Est. 2017</span>
          <span className="g-label">
            <span className="dot">◉</span> Booking Q3 — 2026
          </span>
        </div>

        <h1 className="g-h2" aria-label="We turn bold ideas into websites people remember">
          <span className="g-hline">
            <W>We</W>
            <span className="g-pillstrip" aria-hidden="true">
              {PILLS.map((src) => (
                <span className="g-pill" key={src}>
                  <img src={src} alt="" loading="eager" />
                </span>
              ))}
            </span>
            <W>turn</W>
            <W>bold</W>
          </span>

          <span className="g-hline">
            <W>ideas</W>
            <W>into</W>
            <svg
              className="g-arrow"
              viewBox="0 0 200 80"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <path
                className="g-arrow-stroke"
                d="M6 62 C 30 26, 62 10, 92 18 C 118 25, 122 52, 104 56 C 90 59, 84 42, 100 34 C 124 22, 156 30, 186 52"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                className="g-arrow-head"
                d="M186 52 l-21 -3 M186 52 l-4 -20"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <W>websites</W>
          </span>

          <span className="g-hline">
            <W>people</W>
            <span className="g-reelslot" ref={slot} aria-hidden="true">
              <img className="g-slotimg" src={REEL_IMG} alt="" ref={slotImg} />
            </span>
            <W>remember</W>
          </span>
        </h1>

        <div className="g-hero-bottom">
          <p className="g-hero-note">
            We craft immersive, art-directed websites for brands that refuse to blend in —
            designed, animated and engineered under one roof.
          </p>
          <span className="g-label">Scroll ↓</span>
        </div>
      </section>

      {/* the flying plane lands here as a full-bleed panel */}
      <section className="g-reel" ref={reel}>
        <div className="g-reelfix" ref={fix}>
          <img src={REEL_IMG} alt="" />
          <div className="g-reelshade" />
        </div>
        <div className="g-reel-statement">
          <h2>We build websites that feel like films.</h2>
          <p>Art-directed — Engineered — Unforgettable</p>
        </div>
      </section>

      {/* fixed WebGL canvas — must live outside the smooth-scroll transform */}
      {createPortal(
        <canvas className="g-flycanvas" ref={canvasRef} aria-hidden="true" />,
        document.body
      )}
    </div>
  )
}
