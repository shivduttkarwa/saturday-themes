import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    num: '01',
    name: 'Discover',
    glyph: '✳',
    copy: 'We interrogate the brief — brand, audience, ambition — until the story your site must tell becomes obvious.',
    tags: 'Workshops / Strategy / Moodboards',
  },
  {
    num: '02',
    name: 'Design',
    glyph: '✦',
    copy: 'Art direction first, wireframes second. Every screen is composed like an editorial spread, not assembled from blocks.',
    tags: 'Art direction / UI / Prototypes',
  },
  {
    num: '03',
    name: 'Build',
    glyph: '⚡',
    copy: 'Hand-written code, obsessive performance budgets, motion choreographed to the pixel. No page builders. No shortcuts.',
    tags: 'React / GSAP / Webflow / Shopify',
  },
  {
    num: '04',
    name: 'Launch',
    glyph: '✺',
    copy: 'QA on real devices, analytics wired, SEO tuned — then we stay on for the first month of Saturdays after launch.',
    tags: 'QA / SEO / Analytics / Support',
  },
]

// lazy resting angles for the stacked sheets
const REST = [-2.5, 2, -1.5, 2.8]

export default function Process() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const sheets = gsap.utils.toArray<HTMLElement>('.gp-sheet')

      // resting stack pose — top sheet straight-ish, the rest peeking out
      sheets.forEach((s, i) => {
        gsap.set(s, { rotation: REST[i], y: i * 7, scale: i === 0 ? 1 : 0.965 })
      })

      // ---- approach: the desk sets itself while the section scrolls in
      const enter = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 45%', once: true },
      })
      enter.from('.gp-side > *', {
        y: 40,
        autoAlpha: 0,
        stagger: 0.09,
        duration: 0.8,
        ease: 'power3.out',
      })
      enter.from(
        [...sheets].reverse(),
        {
          y: '+=140',
          autoAlpha: 0,
          rotation: () => gsap.utils.random(-16, 16),
          stagger: 0.11,
          duration: 0.9,
          ease: 'power3.out',
        },
        0.15
      )
      enter.to('.gp-seg:first-child .gp-seg-fill', { scaleX: 1, duration: 0.5 }, 0.7)

      // ---- pinned: toss sheets off the deck, one per step
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=320%',
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      })

      STEPS.forEach((_, i) => {
        if (i === STEPS.length - 1) return
        const dir = i % 2 ? -1 : 1

        // the top sheet gets flicked away
        tl.to(
          sheets[i],
          {
            x: () => dir * (window.innerWidth * 0.75 + 320),
            y: -90,
            rotation: dir * 34,
            duration: 0.6,
            ease: 'power2.in',
          },
          i
        )

        // the next sheet straightens up and takes the top
        tl.to(sheets[i + 1], { rotation: 0, y: 0, scale: 1, duration: 0.45, ease: 'power2.out' }, i + 0.3)

        // giant odometer digit + step name roll together
        tl.to('.gp-digits', { yPercent: -25 * (i + 1), duration: 0.5, ease: 'power3.inOut' }, i + 0.15)
        tl.to('.gp-names', { yPercent: -25 * (i + 1), duration: 0.5, ease: 'power3.inOut' }, i + 0.15)

        // progress segment fills
        tl.to(
          `.gp-seg:nth-child(${i + 2}) .gp-seg-fill`,
          { scaleX: 1, duration: 0.35, ease: 'none' },
          i + 0.35
        )
      })

      // hold the final sheet for a beat before the pin releases
      tl.to({}, { duration: 0.6 })
    },
    { scope: root }
  )

  return (
    <section className="g-process" id="approach" ref={root}>
      <div className="gp-pin">
        <div className="gp-side">
          <p className="g-label">( 02 — The approach )</p>

          <div className="gp-counter" aria-hidden="true">
            <span className="gp-zero">0</span>
            <span className="gp-digit-window">
              <span className="gp-digits">
                {STEPS.map((s) => (
                  <span key={s.num}>{Number(s.num)}</span>
                ))}
              </span>
            </span>
            <span className="gp-of">/ 04</span>
          </div>

          <div className="gp-name-window" aria-hidden="true">
            <span className="gp-names">
              {STEPS.map((s) => (
                <span key={s.name}>{s.name}</span>
              ))}
            </span>
          </div>

          <div className="gp-progress">
            {STEPS.map((s) => (
              <span className="gp-seg" key={s.num}>
                <span className="gp-seg-fill" />
              </span>
            ))}
          </div>

          <p className="gp-hint">Keep scrolling — sheets fly</p>
        </div>

        <div className="gp-deck">
          {STEPS.map((s, i) => (
            <article className="gp-sheet" key={s.num} style={{ zIndex: STEPS.length - i }}>
              <header className="gp-sheet-head">
                <span className="gp-sheet-index">Step {s.num} — 04</span>
                <span className="gp-sheet-glyph">{s.glyph}</span>
              </header>
              <h3 className="gp-sheet-title">{s.name}</h3>
              <p className="gp-sheet-copy">{s.copy}</p>
              <footer className="gp-sheet-foot">
                <span className="gp-sheet-tags">{s.tags}</span>
              </footer>
              <span className="gp-watermark" aria-hidden="true">
                {s.num}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
