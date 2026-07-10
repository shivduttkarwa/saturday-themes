import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PROJECTS = [
  { name: 'Aurora Hotels', field: 'Hospitality — Art direction, Webflow', year: '2026', hue: 18 },
  { name: 'Núma Studio', field: 'Architecture — Design, Development', year: '2025', hue: 262 },
  { name: 'Forma', field: 'Furniture — E-commerce, Shopify', year: '2025', hue: 152 },
  { name: 'Atlas & Co', field: 'Finance — Brand site, Motion', year: '2024', hue: 210 },
  { name: 'Velvet Noir', field: 'Fashion — Campaign site, WebGL', year: '2024', hue: 330 },
]

export default function Work() {
  const root = useRef<HTMLElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const move = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null)
  const [active, setActive] = useState(0)

  const { contextSafe } = useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('.work-row').forEach((row) => {
        gsap.from(row, {
          y: 70,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 90%', once: true },
        })
      })

      gsap.set('.work-preview', { xPercent: -50, yPercent: -55, scale: 0.85, autoAlpha: 0 })
      move.current = {
        x: gsap.quickTo('.work-preview', 'x', { duration: 0.55, ease: 'power3' }),
        y: gsap.quickTo('.work-preview', 'y', { duration: 0.55, ease: 'power3' }),
      }
    },
    { scope: root }
  )

  const onMove = (e: React.MouseEvent) => {
    const r = list.current!.getBoundingClientRect()
    move.current?.x(e.clientX - r.left)
    move.current?.y(e.clientY - r.top)
  }

  const show = contextSafe(() =>
    gsap.to('.work-preview', { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power3.out' })
  )
  const hide = contextSafe(() =>
    gsap.to('.work-preview', { autoAlpha: 0, scale: 0.85, duration: 0.35, ease: 'power3.in' })
  )

  return (
    <section className="work" id="work" ref={root}>
      <div className="work-head">
        <p className="section-label">03 — Selected work</p>
        <h2>
          Made on <em>saturdays</em>
        </h2>
      </div>

      <div
        className="work-list"
        ref={list}
        onMouseMove={onMove}
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {PROJECTS.map((p, i) => (
          <a
            className="work-row"
            key={p.name}
            href="#contact"
            onClick={(e) => e.preventDefault()}
            onMouseEnter={() => setActive(i)}
          >
            <span className="row-idx">0{i + 1}</span>
            <span className="row-name">{p.name}</span>
            <span className="row-field">{p.field}</span>
            <span className="row-year">{p.year}</span>
            <span className="row-arrow">↗</span>
          </a>
        ))}

        <div className="work-preview" aria-hidden="true">
          {PROJECTS.map((p, i) => (
            <div
              className={`preview-tile${i === active ? ' on' : ''}`}
              key={p.name}
              style={{
                background: `linear-gradient(140deg, hsl(${p.hue} 85% 62%), hsl(${p.hue + 40} 90% 42%))`,
              }}
            >
              <span className="tile-letter">{p.name.charAt(0)}</span>
              <span className="tile-name">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
