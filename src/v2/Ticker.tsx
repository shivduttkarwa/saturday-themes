import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const ITEMS = [
  'Premium web development',
  'Webflow',
  'React',
  'Shopify',
  'GSAP motion',
  'Art direction',
  'Since 2017',
]

function Chunk() {
  return (
    <span className="g-ticker-chunk" aria-hidden="true">
      {ITEMS.map((t) => (
        <span key={t}>
          {t} <span className="dot">✦</span>
        </span>
      ))}
    </span>
  )
}

export default function Ticker() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.to('.g-ticker-inner', { xPercent: -50, repeat: -1, duration: 30, ease: 'none' })
    },
    { scope: root }
  )

  return (
    <div className="g-ticker" ref={root}>
      <div className="g-ticker-inner">
        <Chunk />
        <Chunk />
      </div>
    </div>
  )
}
