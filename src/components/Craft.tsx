import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PANELS = [
  {
    num: '01',
    kicker: 'See it before it exists',
    title: 'Art Direction & Design',
    copy: 'Bold, editorial interfaces with a point of view. We design layouts that give your brand a voice — never a template.',
    tags: ['Brand identity', 'UI / UX', 'Design systems', 'Figma'],
  },
  {
    num: '02',
    kicker: 'Engineered like a Swiss watch',
    title: 'Creative Development',
    copy: 'React, WordPress, Shopify, Webflow — hand-built to feel instant, score green on every audit, and never break character.',
    tags: ['React', 'WordPress', 'Webflow', 'TypeScript'],
  },
  {
    num: '03',
    kicker: 'The part people screenshot',
    title: 'Motion & Interaction',
    copy: 'GSAP-powered scroll stories, micro-interactions and page transitions that make visitors feel something on the way down.',
    tags: ['GSAP', 'ScrollTrigger', 'WebGL', '3D'],
  },
  {
    num: '04',
    kicker: 'Beauty that converts',
    title: 'E-Commerce',
    copy: 'Cinematic storefronts that turn browsers into buyers — custom Shopify builds with product storytelling baked in.',
    tags: ['Shopify', 'Conversion', 'Checkout UX', 'Analytics'],
  },
]

export default function Craft() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const getDistance = () => track.current!.scrollWidth - window.innerWidth

      gsap.to(track.current, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => '+=' + getDistance(),
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      gsap.to('.craft-progress-fill', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => '+=' + getDistance(),
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
    },
    { scope: root }
  )

  return (
    <section className="craft" id="craft" ref={root}>
      <div className="craft-pin">
        <div className="craft-head">
          <p className="section-label">02 — What we do</p>
          <h2>
            The <em>craft</em>
          </h2>
        </div>

        <div className="craft-track" ref={track}>
          {PANELS.map((p) => (
            <article className="craft-panel" key={p.num} data-cursor>
              <span className="panel-num" aria-hidden="true">
                {p.num}
              </span>
              <p className="panel-kicker">{p.kicker}</p>
              <h3 className="panel-title">{p.title}</h3>
              <p className="panel-copy">{p.copy}</p>
              <div className="panel-tags">
                {p.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="craft-progress">
          <div className="craft-progress-fill" />
        </div>
      </div>
    </section>
  )
}
