import { useEffect, useLayoutEffect, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { SplitText } from 'gsap/SplitText'

import './v2.css'
import Cursor from '../components/Cursor'
import Loader from './Loader'
import NavV2 from './NavV2'
import HeroV2 from './HeroV2'
import Intro from './Intro'
import Ticker from './Ticker'
import Cases from './Cases'
import Services from './Services'
import Fill from './Fill'
import Process from './Process'
import FooterV2 from './FooterV2'

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText)

/*
 * First child on purpose — ScrollSmoother must exist before any pinned
 * ScrollTrigger is created (see V1.tsx for the full explanation).
 */
function SmoothScroll({ ready }: { ready: boolean }) {
  useLayoutEffect(() => {
    const smoother = ScrollSmoother.create({ smooth: 1.2, effects: true })
    smoother.paused(true)
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

export default function V2() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    document.body.classList.add('v2')
    return () => document.body.classList.remove('v2')
  }, [])

  return (
    <>
      <SmoothScroll ready={ready} />
      <Loader onDone={() => setReady(true)} />
      <Cursor />
      <NavV2 ready={ready} />

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <HeroV2 ready={ready} />
          <Intro />
          <Ticker />
          <Cases />
          <Services />
          <Fill />
          <Process />
          <FooterV2 />
        </div>
      </div>

      <div className="grain" aria-hidden="true" />
    </>
  )
}
