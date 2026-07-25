import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FooterV2 from '../FooterV2'
import FloatPreview from './FloatPreview'
import { requestPage } from '../router'

gsap.registerPlugin(ScrollTrigger)

const REEL = [
  {
    name: 'Aurora Hotels',
    field: 'Hospitality',
    year: '2026',
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000&auto=format&fit=crop',
  },
  {
    name: 'Forma',
    field: 'Furniture',
    year: '2025',
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2000&auto=format&fit=crop',
  },
  {
    name: 'Núma Arquitectura',
    field: 'Architecture',
    year: '2025',
    img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2000&auto=format&fit=crop',
  },
  {
    name: 'Velvet Noir',
    field: 'Fashion',
    year: '2024',
    img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2000&auto=format&fit=crop',
  },
  {
    name: 'Atlas & Co',
    field: 'Finance',
    year: '2024',
    img: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=2000&auto=format&fit=crop',
  },
  {
    name: 'Casa Verde',
    field: 'Real estate',
    year: '2026',
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000&auto=format&fit=crop',
  },
]

const FEATURES = [
  {
    name: 'Loop Records',
    field: 'Music label',
    year: '2023',
    note: 'A record sleeve you can scroll.',
    wide: true,
    img: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=2000&auto=format&fit=crop',
  },
  {
    name: 'Field & Flour',
    field: 'Bakery — e-commerce',
    year: '2023',
    note: 'Sourdough, shot like sculpture.',
    wide: false,
    img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1400&auto=format&fit=crop',
  },
  {
    name: 'Meridian Studio',
    field: 'Photography',
    year: '2022',
    note: 'A portfolio that gets out of the way.',
    wide: false,
    img: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=1400&auto=format&fit=crop',
  },
  {
    name: 'North Peak',
    field: 'Outdoor apparel',
    year: '2022',
    note: 'Altitude, translated to scroll depth.',
    wide: true,
    img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop',
  },
]

const ARCHIVE = [
  { year: '2021', name: 'Hearth & Co', field: 'Interior design', img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=900&auto=format&fit=crop' },
  { year: '2021', name: 'Bloom Botanica', field: 'Florist e-comm', img: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?q=80&w=900&auto=format&fit=crop' },
  { year: '2020', name: 'Ledger & Vine', field: 'Winery', img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=900&auto=format&fit=crop' },
  { year: '2020', name: 'Kite Coffee', field: 'Roastery', img: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=900&auto=format&fit=crop' },
  { year: '2019', name: 'Harbor Line', field: 'Marine charter', img: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=900&auto=format&fit=crop' },
  { year: '2019', name: 'Studio Anders', field: 'Architecture', img: 'https://images.unsplash.com/photo-1481253127861-534498168948?q=80&w=900&auto=format&fit=crop' },
  { year: '2018', name: 'Paper Plane Co', field: 'Stationery', img: 'https://images.unsplash.com/photo-1519222970733-f546218fa6d7?q=80&w=900&auto=format&fit=crop' },
  { year: '2017', name: 'First & Main', field: 'The first one', img: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=900&auto=format&fit=crop' },
]

export default function WorkPage({ ready }: { ready: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const reelSec = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const archSec = useRef<HTMLElement>(null)

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

      /* ---- pinned horizontal reel with velocity skew ---- */
      const trackEl = track.current!
      const cards = gsap.utils.toArray<HTMLElement>('.wk-card')
      const dist = () => trackEl.scrollWidth - window.innerWidth

      const proxy = { skew: 0 }
      const setSkew = gsap.quickSetter(cards, 'skewX', 'deg')

      const move = gsap.to(trackEl, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: reelSec.current,
          start: 'top top',
          end: () => '+=' + dist() * 1.15,
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // cards bank into the scroll like film being pulled
            const v = gsap.utils.clamp(-9, 9, self.getVelocity() / -350)
            if (Math.abs(v) > Math.abs(proxy.skew)) {
              proxy.skew = v
              gsap.to(proxy, {
                skew: 0,
                duration: 0.9,
                ease: 'power3.out',
                overwrite: true,
                onUpdate: () => setSkew(proxy.skew),
              })
            }
            // live counter
            if (counter.current) {
              const i = Math.min(REEL.length, Math.max(1, Math.round(self.progress * (REEL.length - 1)) + 1))
              counter.current.textContent = String(i).padStart(2, '0')
            }
          },
        },
      })

      gsap.fromTo(
        '.wk-reel-fill',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: reelSec.current,
            start: 'top top',
            end: () => '+=' + dist() * 1.15,
            scrub: true,
          },
        }
      )

      // each card peels open as it enters from the right
      cards.forEach((card) => {
        gsap.from(card.querySelector('.wk-card-img'), {
          clipPath: 'inset(0% 0% 0% 100%)',
          duration: 0.9,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: card, containerAnimation: move, start: 'left 90%', once: true },
        })
        gsap.fromTo(
          card.querySelector('img'),
          { xPercent: -12 },
          {
            xPercent: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: move,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          }
        )
      })

      /* ---- feature grid: blocks un-clip, images settle ---- */
      gsap.utils.toArray<HTMLElement>('.wk-item').forEach((item) => {
        gsap.from(item.querySelector('.wk-item-media'), {
          clipPath: 'inset(100% 0% 0% 0%)',
          duration: 1.1,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: item, start: 'top 80%', once: true },
        })
        gsap.fromTo(
          item.querySelector('.wk-item-media img'),
          { scale: 1.35, yPercent: -6 },
          {
            scale: 1,
            yPercent: 6,
            ease: 'none',
            scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        )
        gsap.from(item.querySelectorAll('.wk-item-meta, .wk-item-title'), {
          y: 34,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 65%', once: true },
        })
      })

      /* ---- archive rows ---- */
      gsap.from('.wk-arch-row', {
        y: 44,
        autoAlpha: 0,
        stagger: 0.06,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.wk-arch-rows', start: 'top 85%', once: true },
      })

      /* ---- closing CTA ---- */
      gsap.from('.wk-cta > *', {
        y: 60,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.wk-cta', start: 'top 78%', once: true },
      })
    },
    { scope: root, dependencies: [ready] }
  )

  return (
    <div className="pg wk" ref={root}>
      {/* ---------- hero ---------- */}
      <section className="p-hero wk-hero">
        <div className="p-kicker p-fade">
          <span className="g-label">( Recent work )</span>
          <span className="g-label">2017 → 2026 — a selection</span>
        </div>

        <h1 className="p-title">
          <span className="p-mask">
            <span className="p-rise">Work worth</span>
          </span>
          <span className="p-mask">
            <span className="p-rise">
              the <em>weekend.</em>
            </span>
          </span>
        </h1>

        <div className="p-hero-foot p-fade">
          <p className="p-note">
            Eighteen of the hundred-and-twenty. Chosen not for the logos, but for the nights we
            didn&apos;t want to stop working on them.
          </p>
          <span className="g-label">Scroll — the reel goes sideways ↓</span>
        </div>
      </section>

      {/* ---------- horizontal reel ---------- */}
      <section className="wk-reel" ref={reelSec}>
        <div className="wk-reel-head">
          <span className="g-label">( 01 — The reel )</span>
          <span className="g-label wk-reel-count">
            <span ref={counter}>01</span> — {String(REEL.length).padStart(2, '0')}
          </span>
        </div>
        <div className="wk-track" ref={track}>
          {REEL.map((p, i) => (
            <article className="wk-card" key={p.name} data-cursor>
              <div className="wk-card-img">
                <img src={p.img} alt={p.name} loading={i < 2 ? 'eager' : 'lazy'} />
              </div>
              <div className="wk-card-info">
                <h3>{p.name}</h3>
                <span className="g-label">
                  {p.field} — {p.year}
                </span>
              </div>
            </article>
          ))}
        </div>
        <div className="wk-reel-bar" aria-hidden="true">
          <span className="wk-reel-fill" />
        </div>
      </section>

      {/* ---------- feature grid ---------- */}
      <section className="wk-grid-sec">
        <div className="wk-grid-head">
          <h2 className="p-h2">
            Deeper <em>cuts</em>
          </h2>
          <span className="g-label">( 02 — Features )</span>
        </div>
        <div className="wk-grid">
          {FEATURES.map((f) => (
            <article className={`wk-item${f.wide ? ' is-wide' : ''}`} key={f.name} data-cursor>
              <div className="wk-item-media">
                <img src={f.img} alt={f.name} loading="lazy" />
              </div>
              <div className="wk-item-meta">
                <span className="g-label">
                  {f.field} — {f.year}
                </span>
                <span className="g-label">{f.note}</span>
              </div>
              <h3 className="wk-item-title">{f.name}</h3>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- archive ---------- */}
      <section className="wk-arch" ref={archSec}>
        <div className="wk-arch-head">
          <h2 className="p-h2">
            The <em>archive</em>
          </h2>
          <span className="g-label">( 2017 — 2021 · hover the rows )</span>
        </div>
        <div className="wk-arch-rows">
          {ARCHIVE.map((a) => (
            <div className="wk-arch-row" key={a.name} data-preview={a.img} data-cursor>
              <span className="g-label">{a.year}</span>
              <span className="wk-arch-name">{a.name}</span>
              <span className="g-label">{a.field}</span>
              <span className="wk-arch-arrow" aria-hidden="true">
                ↗
              </span>
            </div>
          ))}
        </div>
        <FloatPreview scope={archSec} />
      </section>

      {/* ---------- CTA ---------- */}
      <section className="wk-cta">
        <p className="g-label">( The next slot has your name on it )</p>
        <button className="wk-cta-line" type="button" onClick={() => requestPage('contact')}>
          Yours could be <em>next.</em> →
        </button>
      </section>

      <FooterV2 />
    </div>
  )
}
