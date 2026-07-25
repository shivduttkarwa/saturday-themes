import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { SplitText } from 'gsap/SplitText'

import './v2.css'
import './pages/pages.css'
import Cursor from '../components/Cursor'
import Loader from './Loader'
import NavV2 from './NavV2'
import PageTransition from './PageTransition'
import type { TransitionHandle } from './PageTransition'
import { PAGE_LABELS, readPage, writePage } from './router'
import type { PageKey } from './router'

import HomePage from './HomePage'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import WorkPage from './pages/WorkPage'
import ContactPage from './pages/ContactPage'

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText)

const PAGES: Record<PageKey, ComponentType<{ ready: boolean }>> = {
  home: HomePage,
  about: AboutPage,
  services: ServicesPage,
  work: WorkPage,
  contact: ContactPage,
}

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
  /* booted — loader finished (smoother unpauses once, stays unpaused)
     ready  — the current page is visible; gates every page's entrance */
  const [booted, setBooted] = useState(false)
  const [ready, setReady] = useState(false)
  const [page, setPage] = useState<PageKey>(readPage)

  const pageRef = useRef(page)
  useEffect(() => {
    pageRef.current = page
  }, [page])
  const trans = useRef<TransitionHandle>(null)
  const busy = useRef(false)
  const pendingReveal = useRef(false)

  useLayoutEffect(() => {
    document.body.classList.add('v2')
    return () => document.body.classList.remove('v2')
  }, [])

  useEffect(() => {
    document.title = `Saturday Themes® — ${PAGE_LABELS[page]}`
  }, [page])

  const go = useCallback((next: PageKey, push = true) => {
    if (busy.current || next === pageRef.current) return
    busy.current = true
    if (push) writePage(next)
    trans.current?.cover(PAGE_LABELS[next], () => {
      pendingReveal.current = true
      setReady(false)
      setPage(next)
    })
  }, [])

  /* new page just mounted under the curtain — reset scroll, remeasure, peel */
  useLayoutEffect(() => {
    if (!pendingReveal.current) return
    pendingReveal.current = false
    ScrollSmoother.get()?.scrollTop(0)
    window.scrollTo(0, 0)
    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      trans.current?.reveal()
      setReady(true)
      busy.current = false
    })
  }, [page])

  useEffect(() => {
    const onNav = (e: Event) => go((e as CustomEvent<PageKey>).detail)
    const onPop = () => go(readPage(), false)
    window.addEventListener('v2:navigate', onNav)
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('v2:navigate', onNav)
      window.removeEventListener('popstate', onPop)
    }
  }, [go])

  const Page = PAGES[page]

  return (
    <>
      <SmoothScroll ready={booted} />
      <Loader
        onDone={() => {
          setBooted(true)
          setReady(true)
        }}
      />
      <Cursor />
      <NavV2 ready={booted} page={page} />

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <Page ready={ready} key={page} />
        </div>
      </div>

      <PageTransition ref={trans} />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
