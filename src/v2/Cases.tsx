import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const CASES = [
  {
    name: 'Aurora Hotels',
    field: 'Hospitality',
    year: '2026',
    tags: ['Art direction', 'Webflow', 'Booking UX'],
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2400&auto=format&fit=crop',
  },
  {
    name: 'Forma',
    field: 'Furniture',
    year: '2025',
    tags: ['E-commerce', 'Shopify', '3D viewer'],
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2400&auto=format&fit=crop',
  },
  {
    name: 'Núma Arquitectura',
    field: 'Architecture',
    year: '2025',
    tags: ['Design', 'Development', 'CMS'],
    img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2400&auto=format&fit=crop',
  },
  {
    name: 'Velvet Noir',
    field: 'Fashion',
    year: '2024',
    tags: ['Campaign site', 'WebGL', 'Motion'],
    img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2400&auto=format&fit=crop',
  },
  {
    name: 'Atlas & Co',
    field: 'Finance',
    year: '2024',
    tags: ['Brand site', 'React', 'Storytelling'],
    img: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=2400&auto=format&fit=crop',
  },
]

export default function Cases() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const cases = gsap.utils.toArray<HTMLElement>('.g-case')

      cases.forEach((c, i) => {
        // layered pinning — each case holds at the top while the next slides over it
        ScrollTrigger.create({
          trigger: c,
          start: 'top top',
          end: () => `+=${(cases.length - 1 - i) * window.innerHeight}`,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })

        // reveal zoom while the case slides into view
        gsap.fromTo(
          c.querySelector('.g-case-img img'),
          { scale: 1.25 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: c, start: 'top bottom', end: 'top top', scrub: true },
          }
        )

        // recede + darken while the next case covers this one
        const next = cases[i + 1]
        if (next) {
          gsap.to(c.querySelector('.g-case-inner'), {
            scale: 0.92,
            filter: 'brightness(0.35)',
            ease: 'none',
            scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true },
          })
        }

        // info slides up as the case arrives
        gsap.from(c.querySelector('.g-case-info'), {
          y: 60,
          autoAlpha: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: c, start: 'top 45%', once: true },
        })
      })
    },
    { scope: root }
  )

  return (
    <section id="work" ref={root}>
      <div className="g-cases-head">
        <h2>
          Selected <em>work</em>
        </h2>
        <span className="g-label">( 05 — projects )</span>
      </div>

      {CASES.map((c, i) => (
        <article className="g-case" key={c.name}>
          <div className="g-case-inner">
            <div className="g-case-img">
              <img src={c.img} alt={c.name} loading={i === 0 ? 'eager' : 'lazy'} />
            </div>
            <div className="g-case-grad" />
            <div className="g-case-meta">
              <span>
                {String(i + 1).padStart(2, '0')} / {String(CASES.length).padStart(2, '0')}
              </span>
              <span>
                {c.field} — {c.year}
              </span>
            </div>
            <div className="g-case-info">
              <h3 className="g-case-title">{c.name}</h3>
              <div className="g-case-tags">
                {c.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
