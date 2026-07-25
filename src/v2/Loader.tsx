import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

/* A clean, modern editorial preloader — paper field, a rolling odometer
   counter (same mechanic as the Process `gp-counter`), a full-width hairline
   that fills as it counts, then a single decisive expo lift that hands off to
   the hero. Colours are hard-coded so the panel is opaque from the very first
   paint, independent of the theme. */

// each column is a compact 0-9 strip with a duplicate 0 on the end, so the
// 9→0 wrap is seamless (no snap). columns differ only by their decimal place.
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
const PLACES = [100, 10, 1]

export default function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useGSAP(
    () => {
      const strips = gsap.utils.toArray<HTMLElement>('.ldr-strip')
      const count = { v: 0 }

      const roll = () => {
        strips.forEach((strip, i) => {
          const r = (count.v / PLACES[i]) % 10 // 0 → 10, wraps into the dup 0
          gsap.set(strip, { yPercent: -(r / DIGITS.length) * 100 })
        })
      }
      roll()

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => setGone(true),
      })

      // intro — masked lines rise into view
      tl.from('.ldr-rise', {
        yPercent: 115,
        duration: 1.1,
        stagger: 0.09,
        ease: 'power4.out',
      })

      // roll the odometer 0 → 100, decelerating so it settles calmly on 100
      tl.to(count, { v: 100, duration: 3.4, ease: 'power2.out', onUpdate: roll }, 0.5)
      tl.to('.ldr-bar-fill', { scaleX: 1, duration: 3.4, ease: 'power2.out' }, 0.5)

      // small hold at 100 before the reveal
      tl.to({}, { duration: 0.45 })

      // outro — content lifts out of its masks, then the panel wipes up
      tl.to('.ldr-rise', {
        yPercent: -115,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power3.in',
      })
      tl.to('.ldr-bar', { scaleY: 0, transformOrigin: 'bottom', duration: 0.5 }, '<')
      tl.to(
        root.current,
        {
          yPercent: -100,
          duration: 1.25,
          ease: 'expo.inOut',
          onStart: onDone,
        },
        '-=0.2'
      )
    },
    { scope: root }
  )

  if (gone) return null

  return (
    <div className="ldr" ref={root} aria-hidden="true">
      <div className="ldr-head">
        <span className="ldr-mask">
          <span className="ldr-rise ldr-brand">Saturday Themes®</span>
        </span>
        <span className="ldr-mask">
          <span className="ldr-rise ldr-tag">Premium web studio</span>
        </span>
      </div>

      <div className="ldr-mid">
        <span className="ldr-rise ldr-count">
          <span className="ldr-odo">
            {PLACES.map((_, ci) => (
              <span className="ldr-col" key={ci}>
                <span className="ldr-strip">
                  {DIGITS.map((d, di) => (
                    <span key={di}>{d}</span>
                  ))}
                </span>
              </span>
            ))}
          </span>
          <i>%</i>
        </span>
      </div>

      <div className="ldr-foot">
        <div className="ldr-bar">
          <span className="ldr-bar-fill" />
        </div>
        <div className="ldr-foot-row">
          <span className="ldr-mask">
            <span className="ldr-rise">Loading experience</span>
          </span>
          <span className="ldr-mask">
            <span className="ldr-rise">Est. 2017</span>
          </span>
        </div>
      </div>
    </div>
  )
}
