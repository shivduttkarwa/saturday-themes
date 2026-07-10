import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect()
    gsap.to(ref.current, {
      x: (e.clientX - r.left - r.width / 2) * 0.35,
      y: (e.clientY - r.top - r.height / 2) * 0.35,
      duration: 0.4,
      ease: 'power3.out',
    })
  }

  const onLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' })
  }

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ display: 'inline-block' }}>
      {children}
    </div>
  )
}

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export default function Footer() {
  const root = useRef<HTMLElement>(null)
  const now = useClock()
  const isSaturday = now.getDay() === 6
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  useGSAP(
    () => {
      gsap.from('.ft-line', {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.footer-title', start: 'top 82%', once: true },
      })

      gsap.from('.footer-cta-row, .footer-grid', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.footer-cta-row', start: 'top 90%', once: true },
      })
    },
    { scope: root }
  )

  const toTop = (e: React.MouseEvent) => {
    e.preventDefault()
    const smoother = ScrollSmoother.get()
    if (smoother) smoother.scrollTo(0, true)
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer" id="contact" ref={root}>
      <div className="footer-strip" aria-hidden="true">
        <div className="footer-strip-inner">
          {[0, 1].map((k) => (
            <span key={k}>
              Let&apos;s build something worth the weekend — Now booking new projects — Let&apos;s
              build something worth the weekend — Now booking new projects —&nbsp;
            </span>
          ))}
        </div>
      </div>

      <div className="footer-main">
        <h2 className="footer-title">
          <span className="ft-mask">
            <span className="ft-line">Start your</span>
          </span>
          <span className="ft-mask">
            <span className="ft-line">
              <em>Saturday.</em>
            </span>
          </span>
        </h2>

        <div className="footer-cta-row">
          <p className="footer-note">
            Tell us about your project — the ambitious one you keep putting off until the weekend.
            We&apos;ll take it from here.
          </p>
          <Magnetic>
            <a className="btn-pill" href="mailto:hello@saturdaythemes.com">
              hello@saturdaythemes.com <span className="arr">→</span>
            </a>
          </Magnetic>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <p className="footer-tagline">Websites so good, every day feels like Saturday.</p>
          </div>
          <div className="footer-col">
            <h4>Sitemap</h4>
            <ul>
              <li><a href="#studio">Studio</a></li>
              <li><a href="#craft">Craft</a></li>
              <li><a href="#work">Work</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Social</h4>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Instagram</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Dribbble</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>LinkedIn</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>X / Twitter</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Office hours</h4>
            <ul>
              <li>Sat — Sat</li>
              <li>Made on Saturdays</li>
              <li>Shipped worldwide</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {now.getFullYear()} Saturday Themes® — All rights reserved</span>
        <span className="clock">
          Local time {time} — {isSaturday ? "it's Saturday. Perfect." : 'not Saturday yet.'}
        </span>
        <button className="to-top" onClick={toTop} type="button">
          Back to top ↑
        </button>
      </div>
    </footer>
  )
}
