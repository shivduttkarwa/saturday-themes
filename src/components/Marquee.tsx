import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WORDS = [
  'Immersive Design',
  'Creative Development',
  'Scroll Storytelling',
  'E-Commerce',
  'Brand Sites',
  'Motion Craft',
]

function Chunk({ flip }: { flip?: boolean }) {
  return (
    <span className="marquee-chunk" aria-hidden="true">
      {WORDS.map((w, i) => (
        <span key={w} className={(i + (flip ? 1 : 0)) % 2 ? 'm-outline' : undefined}>
          {w} <span className="m-star">✺</span>
        </span>
      ))}
    </span>
  )
}

export default function Marquee() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const rows = gsap.utils.toArray<HTMLElement>('.marquee-inner')
      const tweens = rows.map((row, i) =>
        gsap.fromTo(
          row,
          { xPercent: i % 2 ? -50 : 0 },
          { xPercent: i % 2 ? 0 : -50, repeat: -1, duration: 24, ease: 'none' }
        )
      )

      // scroll velocity makes the belts hurry
      ScrollTrigger.create({
        onUpdate: (self) => {
          const boost = gsap.utils.clamp(0, 4, Math.abs(self.getVelocity()) / 900)
          if (boost > 0.15) {
            tweens.forEach((t) =>
              gsap.to(t, {
                timeScale: 1 + boost,
                duration: 0.2,
                overwrite: true,
                onComplete: () =>
                  gsap.to(t, { timeScale: 1, duration: 1.4, ease: 'power2.out' }),
              })
            )
          }
        },
      })
    },
    { scope: root }
  )

  return (
    <div className="marquee" ref={root}>
      <div className="marquee-tilt">
        <div className="marquee-row">
          <div className="marquee-inner">
            <Chunk />
            <Chunk />
          </div>
        </div>
        <div className="marquee-row">
          <div className="marquee-inner">
            <Chunk flip />
            <Chunk flip />
          </div>
        </div>
      </div>
    </div>
  )
}
