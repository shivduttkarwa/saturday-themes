import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function Manifesto() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const split = SplitText.create('.manifesto-text', { type: 'words' })
      gsap.set(split.words, { opacity: 0.12 })
      gsap.to(split.words, {
        opacity: 1,
        ease: 'none',
        stagger: 0.5,
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=180%',
          scrub: 0.4,
          pin: true,
        },
      })
    },
    { scope: root }
  )

  return (
    <section className="manifesto" id="studio" ref={root}>
      <p className="section-label">01 — The Saturday manifesto</p>
      <p className="manifesto-text">
        Most of the internet is built on a Monday. Rushed. Templated. Forgotten by Tuesday. We
        build like it&apos;s <em>Saturday</em> — unhurried, obsessive, a little bit in love with
        the details. Craft over deadlines. Stories over pages. Websites people don&apos;t just
        visit — websites they <em>remember.</em>
      </p>
    </section>
  )
}
