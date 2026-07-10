import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createFlyMedia } from './flyMedia'
import { createHeroInk } from './heroInk'

gsap.registerPlugin(ScrollTrigger)

const PILLS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=400&auto=format&fit=crop',
]

const REEL_VIDEO = '/vids/pill_video.mp4'

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
  const hero = useRef<HTMLElement>(null)
  const inkCanvas = useRef<HTMLCanvasElement>(null)
  const slot = useRef<HTMLSpanElement>(null)
  const slotVid = useRef<HTMLVideoElement>(null)
  const reel = useRef<HTMLElement>(null)
  const fix = useRef<HTMLDivElement>(null)
  const vid = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intro = useRef({ s: 1 })

  /* ---- the liquid flight: WebGL cloth plane morphs from slot to full-bleed ---- */
  useEffect(() => {
    const canvas = canvasRef.current
    const video = vid.current
    if (!canvas || !video || !wrap.current) return

    video.play().catch(() => {})

    const showStatic = () => {
      canvas.style.opacity = '0'
      if (fix.current) fix.current.style.opacity = '1'
    }

    const fly = createFlyMedia(canvas, video)
    if (!fly) {
      // no WebGL — a plain video pill stays in the headline
      showStatic()
      return
    }
    // GL owns the pill now; hide + rest the in-text fallback video
    const slotVidEl = slotVid.current
    if (slotVidEl) {
      slotVidEl.style.visibility = 'hidden'
      slotVidEl.pause()
    }

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
    let landed = false

    const tick = (time: number) => {
      if (!wrap.current || !slot.current || !reel.current) return

      p += (target - p) * 0.14
      if (Math.abs(target - p) < 0.001) p = target

      // hand off to the static full-bleed panel once landed — hysteresis so
      // the swap can't flap at the boundary, no crossfade so it can't flicker
      if (!landed && p > 0.996) landed = true
      else if (landed && p < 0.988) landed = false
      canvas.style.opacity = landed ? '0' : '1'
      if (fix.current) fix.current.style.opacity = landed ? '1' : '0'
      if (landed) return

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

      // the cloth wave — silent at rest, wild mid-flight, fully settled
      // before the handoff so the final frame matches the static panel
      const arc = Math.sin(Math.PI * p)
      const settle = Math.min(1, (1 - p) * 14)
      const amp = (arc * Math.min(150, 30 + h * 0.28) + (1 - p) * 1.5) * settle

      // banking: rolls into the flight, wobbles with the wind, levels out
      const rot = arc * -0.22 + Math.sin(time * 1.4) * 0.03 * arc

      const radius = (Math.min(w, h) / 2) * (1 - pe)

      fly.draw({ x, y, w, h, amp, time, radius, rot })
    }

    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      st.kill()
      fly.destroy()
      if (slotVidEl) slotVidEl.style.visibility = ''
    }
  }, [])

  /* ---- cursor ink-reveal: fluid mask exposes the video beneath the paper ---- */
  useEffect(() => {
    const canvas = inkCanvas.current
    const heroEl = hero.current
    const video = vid.current
    if (!canvas || !heroEl || !video) return

    const ink = createHeroInk(canvas, video)
    if (!ink) return

    const onMove = (e: MouseEvent) => {
      const r = heroEl.getBoundingClientRect()
      const u = (e.clientX - r.left) / r.width
      const v = 1 - (e.clientY - r.top) / r.height
      ink.setMouse(u, v, true)
    }
    const onLeave = () => ink.setMouse(0.5, 0.5, false)
    heroEl.addEventListener('mousemove', onMove)
    heroEl.addEventListener('mouseleave', onLeave)

    const ro = new ResizeObserver(() => ink.resize())
    ro.observe(canvas)

    const tick = (time: number) => {
      // idle when the hero has scrolled away
      const r = heroEl.getBoundingClientRect()
      if (r.bottom < 0 || r.top > window.innerHeight) return
      ink.step(time)
    }
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      ro.disconnect()
      heroEl.removeEventListener('mousemove', onMove)
      heroEl.removeEventListener('mouseleave', onLeave)
      ink.destroy()
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
      <section className="g-hero" ref={hero}>
        <canvas className="g-heroFx" ref={inkCanvas} aria-hidden="true" />
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
              <video
                className="g-slotimg"
                src={REEL_VIDEO}
                muted
                loop
                autoPlay
                playsInline
                ref={slotVid}
              />
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
          {/* this same element feeds the WebGL texture — one continuous
              stream, so the landing handoff is frame-exact */}
          <video src={REEL_VIDEO} muted loop autoPlay playsInline ref={vid} />
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
