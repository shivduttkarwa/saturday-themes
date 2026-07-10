import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!ready) return

      SplitText.create('.hero-title .line', {
        type: 'chars,lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.chars, {
            yPercent: 120,
            rotate: 4,
            duration: 1.15,
            stagger: 0.024,
            ease: 'power4.out',
            delay: 0.15,
          }),
      })

      gsap.from('.hero-eyebrow, .hero-sub, .hero-meta > *', {
        y: 28,
        opacity: 0,
        duration: 1,
        stagger: 0.09,
        ease: 'power3.out',
        delay: 0.7,
      })

      gsap.from('.hero-sun', {
        yPercent: 55,
        opacity: 0,
        duration: 1.8,
        ease: 'power3.out',
        delay: 0.25,
      })

      gsap.from('.hero-badge', { scale: 0, duration: 1, ease: 'back.out(1.6)', delay: 1.1 })

      gsap.to('.hero-badge svg', { rotation: 360, duration: 18, repeat: -1, ease: 'none' })

      // scroll parallax — title and sun drift apart as you leave
      gsap.to('.hero-title', {
        yPercent: -14,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.hero-sun', {
        yPercent: -36,
        scale: 1.12,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope: root, dependencies: [ready] }
  )

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero-sun" aria-hidden="true" />

      <p className="hero-eyebrow">
        <strong>Saturday Themes</strong> — premium web studio
      </p>

      <h1 className="hero-title">
        <span className="line">Websites</span>
        <span className="line">
          <em>worth</em> the
        </span>
        <span className="line line-accent">Weekend</span>
      </h1>

      <div className="hero-foot">
        <p className="hero-sub">
          Immersive, story-driven websites for brands that refuse to blend in.{' '}
          <strong>Designed with obsession. Built to be remembered.</strong>
        </p>

        <div className="hero-badge" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <defs>
              <path
                id="badge-circle"
                d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
                fill="none"
              />
            </defs>
            <text>
              <textPath href="#badge-circle">
                premium web experiences • est. on a saturday •
              </textPath>
            </text>
          </svg>
          <span className="badge-core">↓</span>
        </div>

        <div className="hero-meta">
          <span>Scroll to begin the story</span>
          <span>Design ✕ Code ✕ Motion</span>
        </div>
      </div>
    </section>
  )
}
