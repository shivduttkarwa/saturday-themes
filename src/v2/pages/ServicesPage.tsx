import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FooterV2 from '../FooterV2'
import Ticker from '../Ticker'
import FloatPreview from './FloatPreview'
import { requestPage } from '../router'

gsap.registerPlugin(ScrollTrigger)

const PANELS = [
  {
    num: '01',
    theme: 'is-paper',
    title: 'Art Direction & Design',
    copy: 'Editorial layouts with a point of view. We start from your story — not a component library — and design every screen like a magazine spread that happens to be interactive.',
    tags: ['Brand identity', 'UI–UX', 'Design systems', 'Prototypes'],
    img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1600&auto=format&fit=crop',
  },
  {
    num: '02',
    theme: 'is-ink',
    title: 'Creative Development',
    copy: 'React, Webflow, WordPress, Shopify — hand-written to feel instant, score green on every audit, and never break character between the design file and the browser.',
    tags: ['React', 'Webflow', 'WordPress', 'TypeScript'],
    img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1600&auto=format&fit=crop',
  },
  {
    num: '03',
    theme: 'is-blue',
    title: 'Motion & Interaction',
    copy: 'GSAP scroll stories, WebGL set-pieces and micro-interactions choreographed to the pixel — the difference between a website people use and one they remember.',
    tags: ['GSAP', 'ScrollTrigger', 'WebGL', '3D'],
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
  },
  {
    num: '04',
    theme: 'is-paper',
    title: 'E-Commerce',
    copy: 'Cinematic storefronts that turn browsers into buyers. Custom Shopify builds where the product photography, the motion and the checkout all tell the same story.',
    tags: ['Shopify', 'Checkout UX', 'Conversion', 'Storytelling'],
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop',
  },
]

const INDEX = [
  { name: 'Brand identity', tag: 'Design', img: 'https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=900&auto=format&fit=crop' },
  { name: 'Design systems', tag: 'Design', img: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=900&auto=format&fit=crop' },
  { name: 'Webflow builds', tag: 'Development', img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=900&auto=format&fit=crop' },
  { name: 'Shopify builds', tag: 'Development', img: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=900&auto=format&fit=crop' },
  { name: 'React applications', tag: 'Development', img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=900&auto=format&fit=crop' },
  { name: 'WebGL & 3D', tag: 'Motion', img: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?q=80&w=900&auto=format&fit=crop' },
  { name: 'SEO & performance', tag: 'Engineering', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=900&auto=format&fit=crop' },
  { name: 'Care plans', tag: 'Support', img: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?q=80&w=900&auto=format&fit=crop' },
]

const PLANS = [
  {
    name: 'The Sprint',
    length: '2–3 weeks',
    glyph: '⚡',
    copy: 'A landing page or campaign site, art-directed and animated. One concept, executed hard.',
    list: ['One flagship page', 'Motion included', 'Launch-ready in weeks'],
  },
  {
    name: 'The Flagship',
    length: '6–10 weeks',
    glyph: '✦',
    copy: 'The full weekend treatment — strategy, design, development and motion for your entire site.',
    list: ['Full site, 5–15 pages', 'Custom CMS', 'WebGL set-pieces', 'A month of Saturdays after launch'],
  },
  {
    name: 'The Retainer',
    length: 'Ongoing',
    glyph: '✺',
    copy: 'Your unfair advantage on a monthly cadence — new pages, experiments and A/B-tested motion.',
    list: ['Reserved studio days', 'Continuous evolution', 'First in the queue'],
  },
]

export default function ServicesPage({ ready }: { ready: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const indexSec = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!ready) {
        gsap.set('.p-rise', { yPercent: 120 })
        gsap.set('.p-fade', { autoAlpha: 0, y: 26 })
        return
      }

      /* ---- hero entrance ---- */
      const enter = gsap.timeline()
      enter.fromTo(
        '.p-rise',
        { yPercent: 120 },
        { yPercent: 0, duration: 1.05, stagger: 0.09, ease: 'power4.out' },
        0.05
      )
      enter.fromTo(
        '.p-fade',
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.06, ease: 'power3.out' },
        0.4
      )

      /* ---- layered discipline panels — each holds while the next slides over ---- */
      const panels = gsap.utils.toArray<HTMLElement>('.sv-panel')
      panels.forEach((p, i) => {
        ScrollTrigger.create({
          trigger: p,
          start: 'top top',
          end: () => `+=${(panels.length - 1 - i) * window.innerHeight}`,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })

        // content drifts up faster than the panel slides in — cheap depth
        gsap.from(p.querySelector('.sv-panel-grid'), {
          yPercent: 22,
          ease: 'none',
          scrollTrigger: { trigger: p, start: 'top bottom', end: 'top top', scrub: true },
        })

        // the covered panel sinks back
        const next = panels[i + 1]
        if (next) {
          gsap.to(p.querySelector('.sv-panel-card'), {
            scale: 0.94,
            ease: 'none',
            scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true },
          })
        }

        // image un-clips + title rises when the panel takes the stage
        gsap.from(p.querySelector('.sv-panel-media'), {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 1,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: p, start: 'top 55%', once: true },
        })
        gsap.from(p.querySelectorAll('.sv-rise'), {
          yPercent: 120,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power4.out',
          scrollTrigger: { trigger: p, start: 'top 55%', once: true },
        })
        gsap.from(p.querySelectorAll('.sv-panel-copy, .sv-panel-tags span'), {
          y: 30,
          autoAlpha: 0,
          duration: 0.7,
          stagger: 0.05,
          ease: 'power3.out',
          scrollTrigger: { trigger: p, start: 'top 45%', once: true },
        })
      })

      /* ---- capability index rows ---- */
      gsap.utils.toArray<HTMLElement>('.sv-row').forEach((row, i) => {
        gsap.from(row, {
          y: 60,
          autoAlpha: 0,
          duration: 0.8,
          delay: (i % 4) * 0.06,
          ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 88%', once: true },
        })
      })

      /* ---- engagement sheets get dealt onto the table ---- */
      gsap.from('.sv-plan', {
        y: 160,
        autoAlpha: 0,
        rotation: () => gsap.utils.random(-10, 10),
        stagger: 0.12,
        duration: 0.95,
        ease: 'back.out(1.2)',
        scrollTrigger: { trigger: '.sv-plans-grid', start: 'top 75%', once: true },
      })

      /* ---- closing line ---- */
      gsap.from('.sv-cta > *', {
        y: 50,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.sv-cta', start: 'top 80%', once: true },
      })
    },
    { scope: root, dependencies: [ready] }
  )

  return (
    <div className="pg sv" ref={root}>
      {/* ---------- hero ---------- */}
      <section className="p-hero sv-hero">
        <div className="p-kicker p-fade">
          <span className="g-label">( What we do )</span>
          <span className="g-label">Four disciplines — one roof</span>
        </div>

        <h1 className="p-title">
          <span className="p-mask">
            <span className="p-rise">Design,</span>
          </span>
          <span className="p-mask">
            <span className="p-rise">
              <em>motion</em> &amp; code —
            </span>
          </span>
          <span className="p-mask">
            <span className="p-rise">no hand-offs.</span>
          </span>
        </h1>

        <div className="p-hero-foot p-fade">
          <p className="p-note">
            Most studios design in one building and build in another. We do both at the same desk,
            which is why nothing gets lost between the concept and the launch.
          </p>
          <span className="g-label">Scroll ↓</span>
        </div>
      </section>

      {/* ---------- layered panels ---------- */}
      <section className="sv-stack">
        {PANELS.map((p) => (
          <article className={`sv-panel ${p.theme}`} key={p.num}>
            <div className="sv-panel-card">
              <span className="sv-watermark" aria-hidden="true">
                {p.num}
              </span>
              <div className="sv-panel-grid">
                <div className="sv-panel-text">
                  <span className="sv-num g-label">/ {p.num}</span>
                  <h2 className="sv-panel-title">
                    {p.title.split(' ').map((w) => (
                      <span className="p-mask" key={w}>
                        <span className="sv-rise">{w}</span>
                      </span>
                    ))}
                  </h2>
                  <p className="sv-panel-copy">{p.copy}</p>
                  <div className="sv-panel-tags">
                    {p.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="sv-panel-media">
                  <img src={p.img} alt={p.title} loading="lazy" />
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* ---------- capability index ---------- */}
      <section className="sv-index" ref={indexSec}>
        <div className="sv-index-head">
          <h2 className="p-h2">
            The full <em>menu</em>
          </h2>
          <span className="g-label">( Hover for a taste )</span>
        </div>
        <div className="sv-rows">
          {INDEX.map((item, i) => (
            <button
              className="sv-row"
              key={item.name}
              type="button"
              data-preview={item.img}
              onClick={() => requestPage('contact')}
            >
              <span className="sv-row-num g-label">{String(i + 1).padStart(2, '0')}</span>
              <span className="sv-row-name">{item.name}</span>
              <span className="sv-row-tag g-label">{item.tag}</span>
              <span className="sv-row-arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          ))}
        </div>
        <FloatPreview scope={indexSec} />
      </section>

      <Ticker />

      {/* ---------- engagements ---------- */}
      <section className="sv-plans">
        <div className="sv-plans-head">
          <h2 className="p-h2">
            Three ways to <em>hire us</em>
          </h2>
          <span className="g-label">( Pick your weekend )</span>
        </div>
        <div className="sv-plans-grid">
          {PLANS.map((p, i) => (
            <article
              className="sv-plan"
              key={p.name}
              style={{ '--rest': `${[-2.4, 1.6, 2.8][i]}deg` } as React.CSSProperties}
            >
              <header>
                <span className="g-label">{p.length}</span>
                <span className="sv-plan-glyph">{p.glyph}</span>
              </header>
              <h3>{p.name}</h3>
              <p>{p.copy}</p>
              <ul>
                {p.list.map((li) => (
                  <li key={li}>✦ {li}</li>
                ))}
              </ul>
              <button className="p-cta" type="button" onClick={() => requestPage('contact')}>
                Talk it through ↗
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- closing ---------- */}
      <section className="sv-cta">
        <p className="g-label">( Unsure which? )</p>
        <button className="sv-cta-line" type="button" onClick={() => requestPage('contact')}>
          Tell us the ambition — <em>we&apos;ll shape the engagement.</em> →
        </button>
      </section>

      <FooterV2 />
    </div>
  )
}
