import { useEffect, useLayoutEffect, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { SplitText } from 'gsap/SplitText'

import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Manifesto from './components/Manifesto'
import Craft from './components/Craft'
import Work from './components/Work'
import SaturdayStory from './components/SaturdayStory'
import Stats from './components/Stats'
import Footer from './components/Footer'

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText)

/*
 * Rendered as the FIRST child so its layout effect runs before every
 * section's useGSAP — ScrollSmoother must exist before any pinned
 * ScrollTrigger is created, otherwise pins resolve to position:fixed and
 * break inside the transformed smooth-content wrapper.
 */
function SmoothScroll({ ready }: { ready: boolean }) {
  useLayoutEffect(() => {
    const smoother = ScrollSmoother.create({ smooth: 1.2, effects: true })
    smoother.paused(true) // locked while the preloader plays
    return () => smoother.kill()
  }, [])

  useEffect(() => {
    const smoother = ScrollSmoother.get()
    if (!smoother) return
    smoother.paused(!ready)
    if (ready) requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [ready])

  return null
}

export default function V1() {
  const [ready, setReady] = useState(false)

  return (
    <>
      <SmoothScroll ready={ready} />
      <Preloader onDone={() => setReady(true)} />
      <Cursor />
      <Nav ready={ready} />

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <Hero ready={ready} />
          <Marquee />
          <Manifesto />
          <Craft />
          <Work />
          <SaturdayStory />
          <Stats />
          <Footer />
        </div>
      </div>

      <div className="grain" aria-hidden="true" />
    </>
  )
}
