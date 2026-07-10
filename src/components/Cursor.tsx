import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    const dotX = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power2.out' })
    const dotY = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power2.out' })
    const ringX = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3.out' })

    const onMove = (e: MouseEvent) => {
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
    }

    const onOver = (e: MouseEvent) => {
      const hot = (e.target as Element).closest('a, button, [data-cursor]')
      ring.current?.classList.toggle('is-hover', !!hot)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
    }
  }, [])

  return (
    <>
      <div className="cursor-dot" ref={dot} />
      <div className="cursor-ring" ref={ring} />
    </>
  )
}
