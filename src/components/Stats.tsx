import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: 120, suffix: '+', label: 'Projects shipped' },
  { value: 9, suffix: 'yrs', label: 'Of weekend craft' },
  { value: 98, suffix: '/100', label: 'Median Lighthouse score' },
  { value: 0, suffix: '', label: 'Templates ever used' },
]

export default function Stats() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('.stat-num').forEach((el) => {
        const target = Number(el.dataset.value)
        const counter = { v: 0 }
        gsap.to(counter, {
          v: target,
          duration: 1.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(counter.v))
          },
        })
      })

      gsap.from('.stat', {
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
      })
    },
    { scope: root }
  )

  return (
    <section className="stats" ref={root}>
      {STATS.map((s) => (
        <div className="stat" key={s.label}>
          <span className="stat-value">
            <span className="stat-num" data-value={s.value}>
              0
            </span>
            <span className="stat-suffix">{s.suffix}</span>
          </span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </section>
  )
}
