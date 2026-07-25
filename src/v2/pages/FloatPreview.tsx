import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'

/*
 * Cursor-following image preview for index/archive lists.
 * Rows opt in with `data-preview="<image url>"`. The card is portaled to
 * <body> (position: fixed) so it rides outside the smooth-scroll transform,
 * lerps after the cursor and banks into the direction of travel.
 */

export default function FloatPreview({ scope }: { scope: RefObject<HTMLElement | null> }) {
  const card = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const rootEl = scope.current
    const cardEl = card.current
    const imgEl = img.current
    if (!rootEl || !cardEl || !imgEl) return
    if (window.matchMedia('(hover: none)').matches) return

    gsap.set(cardEl, { xPercent: -50, yPercent: -50, scale: 0, force3D: true })

    const xTo = gsap.quickTo(cardEl, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(cardEl, 'y', { duration: 0.5, ease: 'power3.out' })
    const rTo = gsap.quickTo(cardEl, 'rotation', { duration: 0.6, ease: 'power3.out' })

    let lastX = 0
    let shown = false

    const onMove = (e: MouseEvent) => {
      const row = (e.target as Element).closest<HTMLElement>('[data-preview]')
      if (row) {
        const src = row.dataset.preview || ''
        if (imgEl.getAttribute('src') !== src) imgEl.setAttribute('src', src)
        if (!shown) {
          shown = true
          // materialize at the cursor, not gliding in from the last spot
          gsap.set(cardEl, { x: e.clientX, y: e.clientY })
          gsap.to(cardEl, { scale: 1, duration: 0.45, ease: 'back.out(1.7)', overwrite: 'auto' })
        }
        xTo(e.clientX)
        yTo(e.clientY)
        rTo(gsap.utils.clamp(-14, 14, (e.clientX - lastX) * 0.55))
      } else if (shown) {
        shown = false
        gsap.to(cardEl, { scale: 0, duration: 0.3, ease: 'power3.in', overwrite: 'auto' })
      }
      lastX = e.clientX
    }

    const onLeave = () => {
      if (!shown) return
      shown = false
      gsap.to(cardEl, { scale: 0, duration: 0.3, ease: 'power3.in', overwrite: 'auto' })
    }

    rootEl.addEventListener('mousemove', onMove)
    rootEl.addEventListener('mouseleave', onLeave)
    return () => {
      rootEl.removeEventListener('mousemove', onMove)
      rootEl.removeEventListener('mouseleave', onLeave)
    }
  }, [scope])

  return createPortal(
    <div className="fprev" ref={card} aria-hidden="true">
      <img ref={img} alt="" />
    </div>,
    document.body
  )
}
