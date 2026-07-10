import { useRef } from 'react'
import type { CSSProperties } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function SaturdayStory() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const days = gsap.utils.toArray<HTMLElement>('.day-item')

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=280%',
          scrub: 0.6,
          pin: true,
        },
      })

      days.forEach((day) => {
        tl.to(day, { '--strike': '104%', duration: 0.5, ease: 'none' })
        tl.to(day, { color: '#3a352c', duration: 0.35, ease: 'none' }, '<0.15')
      })

      tl.to('.day-sat', { opacity: 1, color: '#ff4d00', duration: 0.9, ease: 'power2.inOut' }, '+=0.2')
      tl.from(
        '.day-sat',
        { scale: 0.92, transformOrigin: 'left center', duration: 0.9, ease: 'power2.inOut' },
        '<'
      )
      tl.from('.story-caption', { opacity: 0, y: 50, duration: 0.8, ease: 'power2.out' }, '-=0.3')
    },
    { scope: root }
  )

  return (
    <section className="saturday" ref={root}>
      <div className="saturday-pin">
        <p className="section-label">04 — The Saturday principle</p>

        <div className="days">
          {WEEKDAYS.map((d) => (
            <span className="day-item" key={d} style={{ '--strike': '0%' } as CSSProperties}>
              {d}
            </span>
          ))}
          <span className="day-sat">
            Saturday<sup>®</sup>
          </span>
        </div>

        <p className="story-caption">
          Great websites aren&apos;t made on deadlines. <strong>They&apos;re made on
          Saturdays.</strong> That&apos;s the energy we bring to every single build.
        </p>
      </div>
    </section>
  )
}
