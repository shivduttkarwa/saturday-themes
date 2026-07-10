import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    num: '01',
    name: 'Discover',
    copy: 'We interrogate the brief — brand, audience, ambition — until the story your site must tell becomes obvious.',
  },
  {
    num: '02',
    name: 'Design',
    copy: 'Art direction first, wireframes second. Every screen is composed like an editorial spread, not assembled from blocks.',
  },
  {
    num: '03',
    name: 'Build',
    copy: 'Hand-written code, obsessive performance budgets, motion choreographed to the pixel. No page builders. No shortcuts.',
  },
  {
    num: '04',
    name: 'Launch',
    copy: 'QA on real devices, analytics wired, SEO tuned — then we stay on for the first month of Saturdays after launch.',
  },
]

export default function Process() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.from('.g-step', {
        y: 60,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.g-steps', start: 'top 80%', once: true },
      })
    },
    { scope: root }
  )

  return (
    <section className="g-process" id="approach" ref={root}>
      <div className="g-process-head">
        <h2>
          The <em>approach</em>
        </h2>
        <span className="g-label">( From brief to launch )</span>
      </div>
      <div className="g-steps">
        {STEPS.map((s) => (
          <div className="g-step" key={s.num}>
            <span className="g-step-num">/{s.num}</span>
            <h3 className="g-step-name">{s.name}</h3>
            <p className="g-step-copy">{s.copy}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
