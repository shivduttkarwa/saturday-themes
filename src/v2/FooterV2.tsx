import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export default function FooterV2() {
  const root = useRef<HTMLElement>(null)
  const now = useClock()
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  useGSAP(
    () => {
      gsap.from('.g-f-line', {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.g-f-title', start: 'top 82%', once: true },
      })

      gsap.to('.g-email-inner', { xPercent: -50, repeat: -1, duration: 18, ease: 'none' })
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
    <footer className="g-footer" id="contact" ref={root}>
      <h2 className="g-f-title">
        <span className="g-f-mask">
          <span className="g-f-line">Let&apos;s make it</span>
        </span>
        <span className="g-f-mask">
          <span className="g-f-line">
            <em>Saturday.</em>
          </span>
        </span>
      </h2>

      <a className="g-email-belt" href="mailto:hello@saturdaythemes.com">
        <span className="g-email-inner">
          {[0, 1].map((k) => (
            <span className="g-email-chunk" key={k} aria-hidden={k === 1}>
              <span>hello@saturdaythemes.com</span>
              <span className="dot">✦</span>
              <span>Start a project</span>
              <span className="dot">✦</span>
              <span>hello@saturdaythemes.com</span>
              <span className="dot">✦</span>
              <span>Start a project</span>
              <span className="dot">✦</span>
            </span>
          ))}
        </span>
      </a>

      <div className="g-f-grid">
        <div className="g-f-col">
          <p className="g-f-tagline">Websites so good, every day feels like Saturday.</p>
        </div>
        <div className="g-f-col">
          <h4>Sitemap</h4>
          <ul>
            <li><a href="#work">Work</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#approach">Approach</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div className="g-f-col">
          <h4>Social</h4>
          <ul>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Instagram</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Dribbble</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>LinkedIn</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>X / Twitter</a></li>
          </ul>
        </div>
        <div className="g-f-col">
          <h4>Studio</h4>
          <ul>
            <li>Made on Saturdays</li>
            <li>Shipped worldwide</li>
            <li className="clock">Local — {time}</li>
          </ul>
        </div>
      </div>

      <div className="g-f-bottom">
        <span>© {now.getFullYear()} Saturday Themes® — All rights reserved</span>
        <span>Imagery — Unsplash</span>
        <button className="to-top" onClick={toTop} type="button">
          Back to top ↑
        </button>
      </div>
    </footer>
  )
}
