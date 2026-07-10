import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STICKERS = [
  { label: '✦ GSAP®', left: '5%', bottom: '4%', rot: -8, variant: 'blue' },
  { label: '⚡ React', left: '19%', bottom: '2%', rot: 6, variant: 'ink' },
  { label: '✳ Webflow', left: '35%', bottom: '5%', rot: -4, variant: 'paper' },
  { label: '● Shopify', left: '51%', bottom: '2.5%', rot: 9, variant: 'ink' },
  { label: '✺ Motion', left: '66%', bottom: '4.5%', rot: -10, variant: 'blue' },
  { label: '◍ 3D / WebGL', left: '80%', bottom: '3%', rot: 5, variant: 'paper' },
]

const STATS = [
  { value: 120, suffix: '+', label: 'Projects shipped' },
  { value: 9, suffix: 'yrs', label: 'Of weekend craft' },
  { value: 0, suffix: '', label: 'Templates used' },
]

export default function Intro() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const circle = root.current!.querySelector<SVGPathElement>('.gi-circle path')
      const circleLen = circle ? circle.getTotalLength() : 0
      if (circle) gsap.set(circle, { strokeDasharray: circleLen, strokeDashoffset: circleLen })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=190%',
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      })

      tl.from('.gi-label', { autoAlpha: 0, y: 26, duration: 0.25 }, 0.05)

      gsap.utils.toArray<HTMLElement>('.gi-line').forEach((line, i) => {
        tl.from(
          line.querySelector('.gi-line-in'),
          { yPercent: 115, duration: 0.45, ease: 'power3.out' },
          0.15 + i * 0.22
        )
      })

      // marker strikes through "agency"
      tl.to('.gi-strike', { scaleX: 1, duration: 0.22, ease: 'power2.inOut' }, 0.85)
      tl.to('.gi-struck', { color: '#a39d90', duration: 0.15 }, 0.95)

      // hand-drawn circle around "handmade"
      if (circle) tl.to(circle, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.inOut' }, 1.05)

      // stickers tumble in from random directions and bounce-land in a pile
      gsap.utils.toArray<HTMLElement>('.gi-sticker').forEach((s, i) => {
        const dir = i % 2 ? 1 : -1
        tl.from(
          s,
          {
            // they land at the very bottom, so the drop must exceed a full
            // viewport for reverse-scroll to carry them fully off-screen
            y: () => -window.innerHeight * gsap.utils.random(1.2, 1.6),
            x: () => dir * gsap.utils.random(80, 340),
            rotation: () => dir * gsap.utils.random(70, 220),
            duration: 1.0,
            ease: 'bounce.out',
          },
          1.0 + i * 0.09
        )
      })

      // stats rise and count with the scroll
      tl.from('.gi-stat', { y: 56, autoAlpha: 0, stagger: 0.09, duration: 0.35 }, 1.75)
      gsap.utils.toArray<HTMLElement>('.gi-num').forEach((el) => {
        const target = Number(el.dataset.v)
        const o = { v: 0 }
        tl.to(
          o,
          {
            v: target,
            duration: 0.5,
            ease: 'power1.out',
            onUpdate: () => {
              el.textContent = String(Math.round(o.v))
            },
          },
          1.8
        )
      })
    },
    { scope: root }
  )

  return (
    <section className="g-intro" id="studio" ref={root}>
      <div className="gi-pin">
        <p className="g-label gi-label">( 01 — The studio )</p>

        <div className="gi-main">
          <h2 className="gi-statement">
          <span className="gi-line">
            <span className="gi-line-in">
              Not your typical{' '}
              <span className="gi-struck">
                agency<span className="gi-strike" aria-hidden="true" />
              </span>
              .
            </span>
          </span>
          <span className="gi-line">
            <span className="gi-line-in">A compact crew of designers &amp; engineers</span>
          </span>
          <span className="gi-line">
            <span className="gi-line-in">
              making the web feel{' '}
              <span className="gi-circled">
                handmade
                <svg
                  className="gi-circle"
                  viewBox="0 0 200 64"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M14 32 C 12 12, 58 5, 102 6 C 152 7, 190 13, 189 31 C 188 51, 142 59, 96 58 C 52 57, 16 50, 14 32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              again.
            </span>
          </span>
        </h2>

        {STICKERS.map((s) => (
          <span
            key={s.label}
            className={`gi-sticker is-${s.variant}`}
            style={{ bottom: s.bottom, left: s.left, rotate: `${s.rot}deg` }}
          >
            {s.label}
          </span>
        ))}

        <div className="gi-stats">
          {STATS.map((s) => (
            <div className="gi-stat" key={s.label}>
              <span className="gi-stat-value">
                <span className="gi-num" data-v={s.value}>
                  0
                </span>
                <span className="gi-suffix">{s.suffix}</span>
              </span>
              <span className="gi-stat-label">{s.label}</span>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}
