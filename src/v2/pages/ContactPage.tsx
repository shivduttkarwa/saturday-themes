import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FooterV2 from '../FooterV2'
import { createHeroInk } from '../heroInk'

gsap.registerPlugin(ScrollTrigger)

const TYPES = ['New website', 'E-commerce', 'Rebrand', 'Motion & 3D', 'Something else']
const BUDGETS = ['$5–10k', '$10–25k', '$25–50k', "Let's talk"]

const FAQ = [
  {
    q: 'How long does a site take?',
    a: 'A sprint lands in 2–3 weeks, a flagship in 6–10. We give you a real date in the first call and we have never missed one — Saturdays are surprisingly reliable.',
  },
  {
    q: 'Do you do just design, or just dev?',
    a: 'Rarely, and only when the other half is in truly good hands. The magic of the studio is that the person animating your hero also argued about its typeface.',
  },
  {
    q: 'What do you need from us to start?',
    a: 'An ambition and a point of contact who can make decisions. Brand assets help; if they don’t exist yet, that becomes chapter one of the project.',
  },
  {
    q: 'Do you work with agencies?',
    a: 'Yes — white-label or credited, we slot into bigger teams for the craft-heavy chapters: creative direction, motion systems, WebGL set-pieces.',
  },
  {
    q: 'Where are you based?',
    a: 'The internet, mostly. The desks are scattered across three time zones, which means someone is always awake when your site isn’t working. (It will be.)',
  },
]

export default function ContactPage({ ready }: { ready: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const hero = useRef<HTMLElement>(null)
  const inkCanvas = useRef<HTMLCanvasElement>(null)
  const send = useRef<HTMLButtonElement>(null)
  const sendWrap = useRef<HTMLDivElement>(null)
  const answers = useRef<(HTMLDivElement | null)[]>([])

  const [type, setType] = useState<string | null>(null)
  const [budget, setBudget] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [gist, setGist] = useState('')
  const [open, setOpen] = useState(-1)

  /* ---- cursor ink drops invert the hero, same shader as home ---- */
  useEffect(() => {
    const canvas = inkCanvas.current
    const heroEl = hero.current
    if (!canvas || !heroEl) return

    const ink = createHeroInk(canvas)
    if (!ink) return

    const onMove = (e: MouseEvent) => {
      const r = heroEl.getBoundingClientRect()
      ink.setMouse((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height, true)
    }
    const onLeave = () => ink.setMouse(0.5, 0.5, false)
    heroEl.addEventListener('mousemove', onMove)
    heroEl.addEventListener('mouseleave', onLeave)

    const ro = new ResizeObserver(() => ink.resize())
    ro.observe(canvas)

    const tick = (time: number) => {
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

  /* ---- magnetic send button ---- */
  useEffect(() => {
    const wrap = sendWrap.current
    const btn = send.current
    if (!wrap || !btn) return
    if (window.matchMedia('(hover: none)').matches) return

    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' })

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * 0.35)
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35)
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
    }
    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseleave', onLeave)
    return () => {
      wrap.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
    }
  }, [])

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

      /* ---- mad-libs lines rise, underlines draw themselves ---- */
      gsap.utils.toArray<HTMLElement>('.ct-line').forEach((line, i) => {
        gsap.from(line, {
          y: 60,
          autoAlpha: 0,
          duration: 0.85,
          delay: i * 0.04,
          ease: 'power3.out',
          scrollTrigger: { trigger: line, start: 'top 88%', once: true },
        })
      })
      gsap.utils.toArray<HTMLElement>('.ct-blank').forEach((b) => {
        gsap.from(b, {
          '--underline': 0,
          duration: 0.9,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: b, start: 'top 85%', once: true },
        })
      })
      gsap.from('.ct-sendwrap', {
        scale: 0,
        rotation: -20,
        duration: 0.9,
        ease: 'back.out(1.6)',
        scrollTrigger: { trigger: '.ct-sendwrap', start: 'top 88%', once: true },
      })

      /* ---- belt + info ---- */
      gsap.to('.ct-belt-inner', { xPercent: -50, repeat: -1, duration: 16, ease: 'none' })
      gsap.from('.ct-col', {
        y: 46,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.ct-info', start: 'top 82%', once: true },
      })

      /* ---- FAQ rows ---- */
      gsap.from('.ct-faq-item', {
        y: 40,
        autoAlpha: 0,
        stagger: 0.07,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.ct-faq', start: 'top 80%', once: true },
      })
    },
    { scope: root, dependencies: [ready] }
  )

  /* ---- accordion ---- */
  const toggle = (i: number) => {
    const next = open === i ? -1 : i
    setOpen(next)
    answers.current.forEach((el, j) => {
      if (!el) return
      gsap.to(el, {
        height: j === next ? 'auto' : 0,
        duration: 0.55,
        ease: 'power3.inOut',
        overwrite: true,
      })
    })
  }

  const submit = () => {
    const btn = send.current
    if (btn) {
      gsap.fromTo(btn, { scale: 0.85 }, { scale: 1, duration: 0.5, ease: 'back.out(2.5)' })
    }
    const subject = encodeURIComponent(`New project — ${name || 'someone interesting'}`)
    const body = encodeURIComponent(
      `Hi Saturday,\n\nMy name is ${name || '…'} and I work with ${company || '…'}.\n` +
        `We need: ${type || '…'}\nBudget: ${budget || '…'}\n\nThe gist: ${gist || '…'}\n\nReach me at ${email || '…'}.`
    )
    window.location.href = `mailto:hello@saturdaythemes.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="pg ct" ref={root}>
      {/* ---------- hero ---------- */}
      <section className="p-hero ct-hero" ref={hero}>
        <canvas className="g-heroFx" ref={inkCanvas} aria-hidden="true" />
        <div className="p-kicker p-fade">
          <span className="g-label">( Contact )</span>
          <span className="g-label">
            <span className="dot">◉</span> Replies within 48 hours
          </span>
        </div>

        <h1 className="p-title ct-title">
          <span className="p-mask">
            <span className="p-rise">Say</span>
          </span>
          <span className="p-mask">
            <span className="p-rise">
              <em>hello.</em>
            </span>
          </span>
        </h1>

        <div className="p-hero-foot p-fade">
          <p className="p-note">
            No account managers, no discovery-call gauntlet. You write, a maker answers — usually
            the one who&apos;ll art-direct your site.
          </p>
          <span className="g-label">Move your cursor — then scroll ↓</span>
        </div>
      </section>

      {/* ---------- mad-libs form ---------- */}
      <section className="ct-form">
        <p className="g-label ct-form-kicker">( 01 — The world&apos;s least boring form )</p>

        <div className="ct-lines">
          <p className="ct-line">
            Hi Saturday <span className="ct-star">✦</span> my name is{' '}
            <span className="ct-blank">
              <input
                type="text"
                value={name}
                placeholder="your name"
                size={Math.max(9, name.length || 9)}
                onChange={(e) => setName(e.target.value)}
              />
            </span>{' '}
            and I work with{' '}
            <span className="ct-blank">
              <input
                type="text"
                value={company}
                placeholder="company"
                size={Math.max(8, company.length || 8)}
                onChange={(e) => setCompany(e.target.value)}
              />
            </span>
            .
          </p>

          <p className="ct-line">
            We need a
            <span className="ct-chips">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`ct-chip${type === t ? ' is-on' : ''}`}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ))}
            </span>
          </p>

          <p className="ct-line">
            and the budget lives around
            <span className="ct-chips">
              {BUDGETS.map((b) => (
                <button
                  key={b}
                  type="button"
                  className={`ct-chip${budget === b ? ' is-on' : ''}`}
                  onClick={() => setBudget(b)}
                >
                  {b}
                </button>
              ))}
            </span>
          </p>

          <p className="ct-line">
            Here&apos;s the gist:{' '}
            <span className="ct-blank ct-blank-wide">
              <input
                type="text"
                value={gist}
                placeholder="two sentences is plenty"
                onChange={(e) => setGist(e.target.value)}
              />
            </span>
          </p>

          <p className="ct-line">
            You can reach me at{' '}
            <span className="ct-blank">
              <input
                type="email"
                value={email}
                placeholder="you@somewhere.com"
                size={Math.max(16, email.length || 16)}
                onChange={(e) => setEmail(e.target.value)}
              />
            </span>
            .
          </p>
        </div>

        <div className="ct-sendwrap" ref={sendWrap}>
          <button className="ct-send" type="button" ref={send} onClick={submit} data-cursor>
            <span>
              Send it <i>✦</i>
            </span>
          </button>
        </div>
      </section>

      {/* ---------- email belt ---------- */}
      <a className="ct-belt" href="mailto:hello@saturdaythemes.com">
        <span className="ct-belt-inner">
          {[0, 1].map((k) => (
            <span className="ct-belt-chunk" key={k} aria-hidden={k === 1}>
              <span>hello@saturdaythemes.com</span>
              <span className="dot">✦</span>
              <span>New business</span>
              <span className="dot">✦</span>
              <span>Collabs</span>
              <span className="dot">✦</span>
              <span>Press</span>
              <span className="dot">✦</span>
            </span>
          ))}
        </span>
      </a>

      {/* ---------- info columns ---------- */}
      <section className="ct-info">
        <div className="ct-col">
          <h4 className="g-label">Studio</h4>
          <ul>
            <li>Made on Saturdays</li>
            <li>Shipped worldwide</li>
            <li>Three time zones deep</li>
          </ul>
        </div>
        <div className="ct-col">
          <h4 className="g-label">Elsewhere</h4>
          <ul>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Instagram ↗</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Dribbble ↗</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>LinkedIn ↗</a></li>
          </ul>
        </div>
        <div className="ct-col">
          <h4 className="g-label">Office hours</h4>
          <ul>
            <li>Sat — Sun: all in</li>
            <li>Mon — Fri: recovering</li>
            <li>
              <span className="dot">◉</span> Booking Q3 — 2026
            </li>
          </ul>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="ct-faq">
        <div className="ct-faq-head">
          <h2 className="p-h2">
            Fair <em>questions</em>
          </h2>
          <span className="g-label">( 02 — Before you ask )</span>
        </div>
        {FAQ.map((f, i) => (
          <div className={`ct-faq-item${open === i ? ' is-open' : ''}`} key={f.q}>
            <button className="ct-faq-q" type="button" onClick={() => toggle(i)}>
              <span className="g-label">{String(i + 1).padStart(2, '0')}</span>
              <span className="ct-faq-text">{f.q}</span>
              <span className="ct-faq-glyph" aria-hidden="true">
                ✦
              </span>
            </button>
            <div
              className="ct-faq-a"
              ref={(el) => {
                answers.current[i] = el
              }}
            >
              <p>{f.a}</p>
            </div>
          </div>
        ))}
      </section>

      <FooterV2 />
    </div>
  )
}
