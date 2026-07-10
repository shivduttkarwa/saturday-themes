import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useGSAP(
    () => {
      const num = root.current!.querySelector('.pre-count') as HTMLElement
      const day = root.current!.querySelector('.pre-day') as HTMLElement
      const counter = { v: 0 }
      const step = 0.34

      const tl = gsap.timeline({ onComplete: () => setGone(true) })

      DAYS.forEach((d, i) => {
        tl.call(() => { day.textContent = d }, [], i * step)
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

      tl.to(day, { color: '#ff4d00', letterSpacing: '0.02em', duration: 0.4, ease: 'power2.out' })
      tl.to('.pre-inner', { yPercent: -30, opacity: 0, duration: 0.55, ease: 'power2.in' }, '+=0.4')
      tl.to(
        root.current,
        { yPercent: -100, duration: 1, ease: 'power4.inOut', onStart: onDone },
        '<0.15'
      )
    },
    { scope: root }
  )

  if (gone) return null

  return (
    <div className="preloader" ref={root}>
      <div className="pre-inner">
        <span className="pre-count">LOADING — 000%</span>
        <span className="pre-day">MONDAY</span>
        <span className="pre-hint">a Saturday Themes production</span>
      </div>
    </div>
  )
}
