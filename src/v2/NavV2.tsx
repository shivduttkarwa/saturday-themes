import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

const LINKS = [
  { label: 'Work', target: '#work' },
  { label: 'Services', target: '#services' },
  { label: 'Approach', target: '#approach' },
  { label: 'Contact', target: '#contact' },
]

export default function NavV2({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!ready) return
      gsap.from(root.current, { yPercent: -130, duration: 1, ease: 'power3.out', delay: 0.4 })

      ScrollTrigger.create({
        start: 'top top',
        onUpdate: (self) => {
          const hide = self.direction === 1 && self.scroll() > 400
          gsap.to(root.current, {
            yPercent: hide ? -130 : 0,
            duration: 0.45,
            ease: 'power2.out',
            overwrite: true,
          })
        },
      })
    },
    { scope: root, dependencies: [ready] }
  )

  const go = (e: React.MouseEvent, target: string) => {
    e.preventDefault()
    const smoother = ScrollSmoother.get()
    if (smoother) smoother.scrollTo(target, true, 'top top')
    else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="g-nav" ref={root}>
      <a className="g-nav-logo" href="#top" onClick={(e) => go(e, '#top')}>
        Saturday®
      </a>
      <span className="g-nav-tag">Digital design house — websites worth the weekend</span>
      <div className="g-nav-links">
        {LINKS.map((l) => (
          <a key={l.label} href={l.target} onClick={(e) => go(e, l.target)}>
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
