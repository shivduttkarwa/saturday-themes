import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useGSAP(
    () => {
      const percentage = root.current!.querySelector('.ld-pct') as HTMLElement
      const counter = { value: 0 }

      const timeline = gsap.timeline({ onComplete: () => setGone(true) })

      timeline.to(
        counter,
        {
          value: 100,
          duration: 1.1,
          ease: 'power2.inOut',
          onUpdate: () => {
            percentage.textContent = `${Math.round(counter.value)}%`
          },
        },
        0
      )
      timeline.fromTo(
        '.ld-fill',
        { scaleX: 0 },
        { scaleX: 1, duration: 1.1, ease: 'power2.inOut' },
        0
      )
      timeline.call(() => {
        document.documentElement.classList.remove('booting')
        onDone()
      })
      timeline.to(root.current, { autoAlpha: 0, duration: 0.4, ease: 'power2.out' })
    },
    { scope: root }
  )

  if (gone) return null

  return (
    <div className="ld" ref={root} aria-hidden="true">
      <div className="ld-inner">
        <span className="ld-mark">Saturday Themes</span>
        <span className="ld-rule" aria-hidden="true">
          <i className="ld-fill" />
        </span>
        <span className="ld-pct">0%</span>
      </div>
    </div>
  )
}
