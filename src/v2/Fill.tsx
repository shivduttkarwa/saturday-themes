import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function Fill() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      SplitText.create('.g-quote', {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: { trigger: root.current, start: 'top 65%', once: true },
          }),
      })

      // the image drifts through the letterforms as you scroll
      gsap.fromTo(
        '.g-fillword',
        { backgroundPosition: 'center 0%' },
        {
          backgroundPosition: 'center 100%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.g-fillword',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      )

      gsap.from('.g-fillword', {
        y: 120,
        autoAlpha: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.g-fillword', start: 'top 85%', once: true },
      })
    },
    { scope: root }
  )

  return (
    <section className="g-fill" ref={root}>
      <p className="g-quote">
        Most of the internet is built on a Monday. We build like it&apos;s{' '}
        <span className="hl">Saturday</span> — unhurried, obsessive, in love with the details.
      </p>
      <h2 className="g-fillword" aria-hidden="true">
        Saturday
      </h2>
    </section>
  )
}
