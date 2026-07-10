import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SERVICES = [
  {
    title: 'Art Direction & Design',
    copy: 'Bold, editorial interfaces with a point of view. We design layouts that give your brand a voice — never a template.',
    tags: 'Brand identity / UI–UX / Design systems',
    img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1600&auto=format&fit=crop',
  },
  {
    title: 'Creative Development',
    copy: 'React, WordPress, Shopify, Webflow — hand-built to feel instant, score green on every audit, and never break character.',
    tags: 'React / Webflow / WordPress / TypeScript',
    img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1600&auto=format&fit=crop',
  },
  {
    title: 'Motion & Interaction',
    copy: 'GSAP-powered scroll stories, micro-interactions and page transitions that make visitors feel something on the way down.',
    tags: 'GSAP / ScrollTrigger / WebGL / 3D',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
  },
  {
    title: 'E-Commerce',
    copy: 'Cinematic storefronts that turn browsers into buyers — custom Shopify builds with product storytelling baked in.',
    tags: 'Shopify / Checkout UX / Conversion',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop',
  },
]

export default function Services() {
  const root = useRef<HTMLElement>(null)
  const media = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      // the media column rides along while the list scrolls
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: media.current,
        pinSpacing: false,
        invalidateOnRefresh: true,
      })

      const imgs = gsap.utils.toArray<HTMLElement>('.g-smedia-img')
      gsap.set(imgs, { clipPath: 'inset(100% 0% 0% 0%)' })
      gsap.set(imgs[0], { clipPath: 'inset(0% 0% 0% 0%)' })

      const swap = (i: number) => {
        setActive(i)
        imgs.forEach((img, j) => {
          gsap.to(img, {
            clipPath: j <= i ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
            duration: 0.7,
            ease: 'power3.inOut',
            overwrite: true,
          })
        })
      }

      gsap.utils.toArray<HTMLElement>('.g-sitem').forEach((item, i) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 55%',
          end: 'bottom 55%',
          onEnter: () => swap(i),
          onEnterBack: () => swap(i),
        })

        gsap.from(item.children, {
          y: 40,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 78%', once: true },
        })
      })
    },
    { scope: root }
  )

  return (
    <section className="g-services" id="services" ref={root}>
      <div className="g-services-media" ref={media}>
        {SERVICES.map((s, i) => (
          <div className="g-smedia-img" key={s.title} style={{ zIndex: i }}>
            <img src={s.img} alt={s.title} loading="lazy" />
          </div>
        ))}
        <span className="g-smedia-count">
          {String(active + 1).padStart(2, '0')} — {String(SERVICES.length).padStart(2, '0')}
        </span>
      </div>

      <div className="g-services-list">
        <p className="g-label">( What we do )</p>
        {SERVICES.map((s, i) => (
          <div className="g-sitem" key={s.title}>
            <span className="g-snum">/{String(i + 1).padStart(2, '0')}</span>
            <h3 className="g-stitle">{s.title}</h3>
            <p className="g-scopy">{s.copy}</p>
            <span className="g-stags">{s.tags}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
