import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { requestPage } from './router'
import type { PageKey } from './router'

gsap.registerPlugin(ScrollTrigger)

const LINKS: { label: string; target: PageKey }[] = [
  { label: 'Studio', target: 'about' },
  { label: 'Work', target: 'work' },
  { label: 'Services', target: 'services' },
  { label: 'Contact', target: 'contact' },
]

export default function NavV2({ ready, page }: { ready: boolean; page: PageKey }) {
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

  const go = (e: React.MouseEvent, target: PageKey) => {
    e.preventDefault()
    requestPage(target)
  }

  return (
    <nav className="g-nav" ref={root}>
      <a className="g-nav-logo" href="?p=home" onClick={(e) => go(e, 'home')}>
        Saturday®
      </a>
      <span className="g-nav-tag">Digital design house — websites worth the weekend</span>
      <div className="g-nav-links">
        {LINKS.map((l) => (
          <a
            key={l.label}
            href={`?p=${l.target}`}
            className={page === l.target ? 'is-active' : ''}
            onClick={(e) => go(e, l.target)}
          >
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
