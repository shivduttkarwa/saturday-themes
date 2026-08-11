import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

/* The week rolls over to Saturday on a departure board, then the panel is
   torn away in slats.

   The panel is ink and the page it uncovers is paper — the old paper panel
   slid off a paper page, which is no reveal at all. It also puts the boot on
   the same ink vocabulary as the page transition (PageTransition.tsx): ink
   columns rise to cover a navigation, ink slats lift to uncover the site.

   The exit is the whole point:
     · `onDone()` fires while the slats still cover everything, so the
       smoother unpause + ScrollTrigger.refresh burn their frame unseen and
       the hero entrance gets a head start;
     · the slats peel left to right a beat later, uncovering a hero that is
       ALREADY moving — the reveal is the hero's own motion, not the panel's;
     · SATURDAY rides up out of its mask on the same gesture the hero words
       use, so the loader's last move and the page's first move rhyme.

   Colours are hard-coded so the panel is opaque on the very first paint,
   independent of the `body.v2` theme timing. */

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
const SLATS = [0, 1, 2, 3, 4, 5]

export default function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useGSAP(
    () => {
      const scope = root.current!
      const stack = scope.querySelector('.ld-stack') as HTMLElement
      const pct = scope.querySelector('.ld-pct') as HTMLElement
      const fill = scope.querySelector('.ld-fill') as HTMLElement

      const stepY = 100 / DAYS.length // one day, as a share of the stack height
      const flick = 0.18 // beat between weekday flicks
      const spin = (DAYS.length - 2) * flick + 0.5 // four flicks + the Saturday settle
      const hand = spin + 0.12 // the handoff: page takes over here

      const tl = gsap.timeline({ onComplete: () => setGone(true) })

      // ---- the roll: four fast weekday flicks, then SATURDAY lands with
      // weight. Each flick is shorter than the beat between them, so no two
      // tweens are ever live on the same transform at once.
      DAYS.forEach((_, i) => {
        if (i === 0) return
        const last = i === DAYS.length - 1
        tl.to(
          stack,
          {
            yPercent: -stepY * i,
            duration: last ? 0.5 : 0.16,
            ease: last ? 'expo.out' : 'power2.inOut',
          },
          (i - 1) * flick
        )
      })

      const counter = { v: 0 }
      tl.to(
        counter,
        {
          v: 100,
          duration: spin,
          ease: 'power2.inOut',
          onUpdate: () => {
            pct.textContent = `${String(Math.round(counter.v)).padStart(3, '0')}%`
          },
        },
        0
      )
      tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: spin, ease: 'power2.inOut' }, 0)

      // Saturday arrives in Klein blue, lifted for ink — #2b24ff is barely
      // brighter than the panel it sits on, so the landing would read muddy
      tl.to([stack, pct], { color: '#6d66ff', duration: 0.3, ease: 'power2.out' }, spin - 0.32)

      // ---- handoff, still fully covered. Dropping `booting` here puts the
      // document back on paper behind the slats, so the peel never uncovers
      // a rim of ink at the edges of the page.
      tl.call(
        () => {
          document.documentElement.classList.remove('booting')
          onDone()
        },
        undefined,
        hand
      )

      // ---- the tear-away
      tl.to(stack, { yPercent: -100, duration: 0.72, ease: 'power4.inOut' }, hand)
      tl.to(
        '.ld-kick, .ld-rule, .ld-meta',
        { autoAlpha: 0, y: -12, duration: 0.35, ease: 'power2.in' },
        hand
      )
      tl.to(
        '.ld-slat',
        { yPercent: -100, duration: 0.85, ease: 'expo.inOut', stagger: 0.055 },
        hand + 0.22
      )
    },
    { scope: root }
  )

  if (gone) return null

  return (
    <div className="ld" ref={root} aria-hidden="true">
      <div className="ld-slats">
        {SLATS.map((i) => (
          <span className="ld-slat" key={i} />
        ))}
      </div>

      <div className="ld-inner">
        <span className="ld-kick">a Saturday Themes production</span>

        <span className="ld-roll">
          <span className="ld-stack">
            {DAYS.map((d) => (
              <span className="ld-day" key={d}>
                {d}
              </span>
            ))}
          </span>
        </span>

        <span className="ld-rule">
          <i className="ld-fill" />
        </span>

        <span className="ld-meta">
          <span>Loading the weekend</span>
          <span className="ld-pct">000%</span>
        </span>
      </div>
    </div>
  )
}
