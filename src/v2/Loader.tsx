import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const WORD = 'SATURDAY®'

export default function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useGSAP(
    () => {
      const pct = root.current!.querySelector('.g-loader-pct') as HTMLElement
      const counter = { v: 0 }

      const tl = gsap.timeline({ onComplete: () => setGone(true) })

      tl.from('.g-loader-word .ch', {
        yPercent: 110,
        duration: 0.9,
        stagger: 0.05,
        ease: 'power4.out',
      })

      tl.to('.g-loader-line', { scaleX: 1, duration: 1.3, ease: 'power2.inOut' }, 0.3)
      tl.to(
        counter,
        {
          v: 100,
          duration: 1.3,
          ease: 'power2.inOut',
          onUpdate: () => {
            pct.textContent = `${String(Math.round(counter.v)).padStart(3, '0')} — 100`
          },
        },
        0.3
      )

      tl.to('.g-loader-word .ch', {
        yPercent: -110,
        duration: 0.7,
        stagger: 0.04,
        ease: 'power3.in',
      })
      tl.to('.g-loader-track, .g-loader-pct', { opacity: 0, duration: 0.4 }, '<')
      tl.to(root.current, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power4.inOut',
        onStart: onDone,
      })
    },
    { scope: root }
  )

  if (gone) return null

  return (
    <div className="g-loader" ref={root}>
      <div className="g-loader-word" aria-label={WORD}>
        {WORD.split('').map((c, i) => (
          <span className="ch" key={i} aria-hidden="true">
            {c}
          </span>
        ))}
      </div>
      <div className="g-loader-track">
        <div className="g-loader-line" />
      </div>
      <span className="g-loader-pct">000 — 100</span>
    </div>
  )
}
