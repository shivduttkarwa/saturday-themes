import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HERO_IMG =
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2400&auto=format&fit=crop'

export default function HeroV2({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const frame = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      // clip the takeover layer to exactly the pill window inside the headline
      const clipFromFrame = () => {
        const s = root.current!.getBoundingClientRect()
        const f = frame.current!.getBoundingClientRect()
        const top = f.top - s.top
        const left = f.left - s.left
        const right = s.width - (left + f.width)
        const bottom = s.height - (top + f.height)
        return `inset(${top}px ${right}px ${bottom}px ${left}px round 200px)`
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=260%',
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      tl.to('.g-meta-row, .g-hero-bottom', { autoAlpha: 0, y: -24, duration: 0.35 }, 0)
      tl.to('.g-lin-up', { yPercent: -115, duration: 0.85, ease: 'power2.in' }, 0)
      tl.to('.g-lin-down', { yPercent: 115, duration: 0.85, ease: 'power2.in' }, 0.05)

      tl.fromTo(
        '.g-takeover',
        { clipPath: clipFromFrame },
        {
          clipPath: 'inset(0px 0px 0px 0px round 0px)',
          duration: 1.5,
          ease: 'power2.inOut',
        },
        0.2
      )
      tl.fromTo(
        '.g-takeover img',
        { scale: 1.35 },
        { scale: 1, duration: 1.5, ease: 'power2.inOut' },
        0.2
      )

      tl.to('.g-shade', { opacity: 1, duration: 0.7 }, 1.1)
      tl.fromTo(
        '.g-statement',
        { autoAlpha: 0, y: 90 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        1.4
      )
      tl.to({}, { duration: 0.5 }) // hold the statement
    },
    { scope: root }
  )

  // entrance — plays once the loader lifts
  useGSAP(
    () => {
      if (!ready) return
      gsap.from('.g-lin-up, .g-lin-down', {
        yPercent: 115,
        duration: 1.2,
        stagger: 0.09,
        ease: 'power4.out',
        delay: 0.1,
      })
      gsap.from('.g-meta-row > *, .g-hero-bottom > *', {
        y: 24,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.07,
        ease: 'power3.out',
        delay: 0.55,
      })
    },
    { scope: root, dependencies: [ready] }
  )

  return (
    <section className="g-hero" id="top" ref={root}>
      <div className="g-meta-row">
        <span className="g-label">Saturday Themes®</span>
        <span className="g-label">Premium web studio</span>
        <span className="g-label">Est. 2017</span>
        <span className="g-label">
          <span className="dot">◉</span> Booking Q3 — 2026
        </span>
      </div>

      <h1 className="g-h1">
        <span className="g-l g-l1">
          <span className="g-lin g-lin-up">Digital</span>
        </span>
        <span className="g-l g-l2">
          <span className="g-frame" ref={frame} aria-hidden="true" />
          <span className="g-lin g-lin-up">Design</span>
        </span>
        <span className="g-l g-l3">
          <span className="g-lin g-lin-down">
            <em>House</em>®
          </span>
        </span>
      </h1>

      <div className="g-hero-bottom">
        <p className="g-hero-note">
          We craft immersive, art-directed websites for brands that refuse to blend in — designed,
          animated and engineered under one roof.
        </p>
        <span className="g-label">Scroll ↓</span>
      </div>

      <div className="g-takeover">
        <img src={HERO_IMG} alt="Abstract color study" />
        <div className="g-shade" />
        <div className="g-statement">
          <h2>We build websites that feel like films.</h2>
          <p>Art-directed — Engineered — Unforgettable</p>
        </div>
      </div>
    </section>
  )
}
