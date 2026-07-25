import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import FooterV2 from '../FooterV2'
import { requestPage } from '../router'

gsap.registerPlugin(ScrollTrigger, SplitText)

const FAN = [
  {
    src: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=900&auto=format&fit=crop',
    cap: 'The studio, 09:12',
  },
  {
    src: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?q=80&w=900&auto=format&fit=crop',
    cap: 'Sketch first, always',
  },
  {
    src: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=900&auto=format&fit=crop',
    cap: 'Saturday, 23:40',
  },
]

const YEARS = [
  {
    year: '2017',
    title: 'A kitchen table',
    copy: 'Two laptops, one borrowed monitor, and a promise: never ship anything that looks like a template.',
    img: 'https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?q=80&w=1200&auto=format&fit=crop',
    tag: 'Founded',
  },
  {
    year: '2019',
    title: 'First trophies',
    copy: 'The first honors roll in — and with them, clients who ask for weird on purpose.',
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop',
    tag: 'Recognition',
  },
  {
    year: '2021',
    title: 'Fully independent',
    copy: 'We stop subcontracting, go direct, and start turning down more work than we take.',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
    tag: 'Independence',
  },
  {
    year: '2023',
    title: 'Ten countries deep',
    copy: 'Hospitality in Lisbon, fashion in Seoul, architecture in Mexico City. The weekend goes global.',
    img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop',
    tag: 'Worldwide',
  },
  {
    year: '2025',
    title: 'The craft compounds',
    copy: 'A hundred-plus launches in, the process is sharp enough to cut: discover, design, build, obsess.',
    img: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200&auto=format&fit=crop',
    tag: '120+ shipped',
  },
  {
    year: '2026',
    title: 'Your turn',
    copy: 'The calendar opens for Q3. Bring us something bold enough to deserve a Saturday.',
    img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop',
    tag: 'Booking Q3',
  },
]

const TEAM = [
  {
    name: 'Kai Mercer',
    role: 'Founder — Art direction',
    glyph: '✦',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=900&auto=format&fit=crop',
  },
  {
    name: 'Mara Voss',
    role: 'Creative development',
    glyph: '⚡',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=900&auto=format&fit=crop',
  },
  {
    name: 'Jonah Reyes',
    role: 'Motion & WebGL',
    glyph: '✺',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=900&auto=format&fit=crop',
  },
  {
    name: 'Ivy Tanaka',
    role: 'Production & strategy',
    glyph: '✳',
    img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=900&auto=format&fit=crop',
  },
]

const STATS = [
  { v: 120, suffix: '+', label: 'Projects shipped' },
  { v: 26, suffix: '', label: 'Industries served' },
  { v: 9, suffix: 'yrs', label: 'Of weekend craft' },
  { v: 4, suffix: '', label: 'Humans, no more' },
]

export default function AboutPage({ ready }: { ready: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const tlSec = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!ready) {
        gsap.set('.p-rise', { yPercent: 120 })
        gsap.set('.p-fade', { autoAlpha: 0, y: 26 })
        gsap.set('.ab-polaroid', { autoAlpha: 0 })
        return
      }

      /* ---- hero entrance: lines rise, polaroids deal out into a fan ---- */
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
      gsap.utils.toArray<HTMLElement>('.ab-polaroid').forEach((card, i) => {
        const rot = Number(card.dataset.rot)
        enter.fromTo(
          card,
          { autoAlpha: 0, y: 120, rotation: rot * 3, scale: 0.7 },
          { autoAlpha: 1, y: 0, rotation: rot, scale: 1, duration: 0.9, ease: 'back.out(1.5)' },
          0.55 + i * 0.12
        )
      })
      // then hold a lazy float so the pile feels alive
      gsap.to('.ab-polaroid', {
        y: '-=10',
        duration: 2.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        stagger: 0.35,
        delay: 1.8,
      })

      /* ---- full-bleed band: frame un-clips while the photo settles ---- */
      gsap.fromTo(
        '.ab-band-clip',
        { clipPath: 'inset(18% 10% 18% 10%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: { trigger: '.ab-band', start: 'top 85%', end: 'top 15%', scrub: 0.5 },
        }
      )
      gsap.fromTo(
        '.ab-band-clip img',
        { scale: 1.3 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.ab-band', start: 'top bottom', end: 'bottom top', scrub: true },
        }
      )
      gsap.from('.ab-band-cap > *', {
        y: 30,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.ab-band', start: 'top 40%', once: true },
      })

      /* ---- manifesto: words develop from ghost to ink as you scroll ---- */
      SplitText.create('.ab-manifesto-text', {
        type: 'words',
        autoSplit: true,
        onSplit: (self) =>
          gsap.fromTo(
            self.words,
            { opacity: 0.12 },
            {
              opacity: 1,
              ease: 'none',
              stagger: 0.05,
              scrollTrigger: {
                trigger: '.ab-manifesto',
                start: 'top 70%',
                end: 'bottom 55%',
                scrub: true,
              },
            }
          ),
      })

      /* ---- the years go sideways: pinned horizontal drag ---- */
      const trackEl = track.current!
      const dist = () => trackEl.scrollWidth - window.innerWidth
      const move = gsap.to(trackEl, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: tlSec.current,
          start: 'top top',
          end: () => '+=' + dist(),
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      gsap.fromTo(
        '.ab-tl-fill',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: tlSec.current,
            start: 'top top',
            end: () => '+=' + dist(),
            scrub: true,
          },
        }
      )
      // each year wakes up as it enters from the right of the moving track
      gsap.utils.toArray<HTMLElement>('.ab-year').forEach((card) => {
        gsap.from(card.querySelector('.ab-year-big'), {
          yPercent: 40,
          autoAlpha: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, containerAnimation: move, start: 'left 85%', once: true },
        })
        gsap.from(card.querySelector('.ab-year-media'), {
          clipPath: 'inset(0% 100% 0% 0%)',
          duration: 0.9,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: card, containerAnimation: move, start: 'left 75%', once: true },
        })
      })

      /* ---- team: portraits un-clip in a stagger ---- */
      gsap.from('.ab-member', {
        y: 80,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.ab-team-grid', start: 'top 75%', once: true },
      })
      gsap.utils.toArray<HTMLElement>('.ab-member-img').forEach((el, i) => {
        gsap.from(el.querySelector('img'), {
          scale: 1.35,
          duration: 1.2,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.ab-team-grid', start: 'top 75%', once: true },
        })
      })

      /* ---- stats: odometers spin up when the ink band arrives ---- */
      gsap.utils.toArray<HTMLElement>('.ab-num').forEach((el) => {
        const target = Number(el.dataset.v)
        const o = { v: 0 }
        gsap.to(o, {
          v: target,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = String(Math.round(o.v))
          },
          scrollTrigger: { trigger: '.ab-stats', start: 'top 75%', once: true },
        })
      })
      gsap.from('.ab-stat', {
        y: 50,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.ab-stats', start: 'top 78%', once: true },
      })
    },
    { scope: root, dependencies: [ready] }
  )

  return (
    <div className="pg ab" ref={root}>
      {/* ---------- hero ---------- */}
      <section className="p-hero ab-hero">
        <div className="p-kicker p-fade">
          <span className="g-label">( The studio )</span>
          <span className="g-label">Est. 2017 — four humans, zero templates</span>
        </div>

        <h1 className="p-title">
          <span className="p-mask">
            <span className="p-rise">A small</span>
          </span>
          <span className="p-mask">
            <span className="p-rise">
              studio with <em>oversized</em>
            </span>
          </span>
          <span className="p-mask">
            <span className="p-rise">standards.</span>
          </span>
        </h1>

        <div className="ab-fan" aria-hidden="true">
          {FAN.map((f, i) => (
            <figure className="ab-polaroid" key={f.src} data-rot={[-8, 3, 10][i]}>
              <img src={f.src} alt="" loading="eager" />
              <figcaption>{f.cap}</figcaption>
            </figure>
          ))}
        </div>

        <div className="p-hero-foot p-fade">
          <p className="p-note">
            Saturday Themes is what happens when designers and engineers refuse to pick a lane —
            every site is directed, animated and built by the same four pairs of hands.
          </p>
          <span className="g-label">Scroll ↓</span>
        </div>
      </section>

      {/* ---------- full-bleed band ---------- */}
      <section className="ab-band">
        <div className="ab-band-clip">
          <img
            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2400&auto=format&fit=crop"
            alt="The Saturday Themes studio"
          />
        </div>
        <div className="ab-band-cap">
          <span className="g-label">The desk — somewhere past midnight</span>
          <span className="g-label">( Fig. 01 )</span>
        </div>
      </section>

      {/* ---------- manifesto ---------- */}
      <section className="ab-manifesto">
        <p className="g-label p-fade">( 01 — What we believe )</p>
        <p className="ab-manifesto-text">
          The web lost its soul somewhere between the fold and the framework. We exist to put it
          back — one obsessive, hand-made website at a time. No page builders. No borrowed
          layouts. No Mondays. Just small teams, long attention spans, and the stubborn belief
          that a website can make you <span className="hl">feel</span> something.
        </p>
      </section>

      {/* ---------- horizontal timeline ---------- */}
      <section className="ab-timeline" ref={tlSec}>
        <div className="ab-tl-head">
          <span className="g-label">( 02 — The road so far )</span>
          <span className="g-label ab-tl-hint">Keep scrolling — the years go sideways →</span>
        </div>
        <div className="ab-track" ref={track}>
          {YEARS.map((y) => (
            <article className="ab-year" key={y.year}>
              <span className="ab-year-big" aria-hidden="true">
                {y.year}
              </span>
              <div className="ab-year-media">
                <img src={y.img} alt="" loading="lazy" />
              </div>
              <div className="ab-year-body">
                <span className="ab-year-tag">✦ {y.tag}</span>
                <h3>{y.title}</h3>
                <p>{y.copy}</p>
              </div>
            </article>
          ))}
          <div className="ab-year ab-year-end">
            <span className="ab-year-big">→</span>
            <div className="ab-year-body">
              <h3>Chapter eight is unwritten.</h3>
              <button className="p-cta" type="button" onClick={() => requestPage('contact')}>
                Start a project ↗
              </button>
            </div>
          </div>
        </div>
        <div className="ab-tl-bar" aria-hidden="true">
          <span className="ab-tl-fill" />
        </div>
      </section>

      {/* ---------- team ---------- */}
      <section className="ab-team">
        <div className="ab-team-head">
          <h2 className="p-h2">
            The <em>weekend</em> crew
          </h2>
          <span className="g-label">( 03 — Four of us, on purpose )</span>
        </div>
        <div className="ab-team-grid">
          {TEAM.map((m) => (
            <article className="ab-member" key={m.name} data-cursor>
              <div className="ab-member-img">
                <img src={m.img} alt={m.name} loading="lazy" />
                <span className="ab-member-glyph" aria-hidden="true">
                  {m.glyph}
                </span>
              </div>
              <h3>{m.name}</h3>
              <span className="g-label">{m.role}</span>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- stats ---------- */}
      <section className="ab-stats">
        {STATS.map((s) => (
          <div className="ab-stat" key={s.label}>
            <span className="ab-stat-value">
              <span className="ab-num" data-v={s.v}>
                0
              </span>
              <span className="ab-suffix">{s.suffix}</span>
            </span>
            <span className="g-label">{s.label}</span>
          </div>
        ))}
      </section>

      <FooterV2 />
    </div>
  )
}
