import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

/* The V1 preloader, re-dressed in V2's paper & ink palette: the week ticks
   over from MONDAY to SATURDAY while a percent readout counts up, then the
   panel lifts away. It stays smooth because nothing animates per-frame —
   the day is a plain text swap and the only tweens are one fade-lift and
   one wipe, both transform/opacity.
   Colours are hard-coded so the panel is opaque on the very first paint,
   independent of the `body.v2` theme timing. */

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

export default function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useGSAP(
    () => {
      const num = root.current!.querySelector('.ld-count') as HTMLElement
      const day = root.current!.querySelector('.ld-day') as HTMLElement
      const counter = { v: 0 }
      const step = 0.34

      const tl = gsap.timeline({ onComplete: () => setGone(true) })

      DAYS.forEach((d, i) => {
        tl.call(
          () => {
            day.textContent = d
          },
          [],
          i * step
        )
      })

      tl.to(
        counter,
        {
          v: 100,
          duration: DAYS.length * step,
          ease: 'power2.inOut',
          onUpdate: () => {
            num.textContent = `LOADING — ${String(Math.round(counter.v)).padStart(3, '0')}%`
          },
        },
        0
      )

      tl.to(day, { color: '#2b24ff', letterSpacing: '0.02em', duration: 0.4, ease: 'power2.out' })
      tl.to('.ld-inner', { yPercent: -30, opacity: 0, duration: 0.55, ease: 'power2.in' }, '+=0.4')

      // hand off the heavy work (smoother unpause + ScrollTrigger refresh)
      // while the panel still covers the screen, so the wipe stays clean
      tl.add(() => onDone())
      tl.to(root.current, { yPercent: -100, duration: 1, ease: 'power4.inOut' })
    },
    { scope: root }
  )

  if (gone) return null

  return (
    <div className="ld" ref={root} aria-hidden="true">
      <div className="ld-inner">
        <span className="ld-count">LOADING — 000%</span>
        <span className="ld-day">MONDAY</span>
        <span className="ld-hint">a Saturday Themes production</span>
      </div>
    </div>
  )
}
