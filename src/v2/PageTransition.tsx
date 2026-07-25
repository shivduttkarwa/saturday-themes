import { forwardRef, useImperativeHandle, useRef } from 'react'
import gsap from 'gsap'

/*
 * Ink-curtain page transition. Five ink columns rise from the bottom edge,
 * the destination's name rolls up in serif italic while covered, then the
 * columns peel away upward. `cover()` fires its callback at full black so
 * V2 can swap the page + reset scroll while nothing is visible.
 */

export interface TransitionHandle {
  cover: (label: string, onCovered: () => void) => void
  reveal: () => void
}

const COLS = [0, 1, 2, 3, 4]

const PageTransition = forwardRef<TransitionHandle>(function PageTransition(_, ref) {
  const root = useRef<HTMLDivElement>(null)
  const word = useRef<HTMLSpanElement>(null)
  const kick = useRef<HTMLSpanElement>(null)

  useImperativeHandle(ref, () => ({
    cover(label, onCovered) {
      const el = root.current
      if (!el || !word.current || !kick.current) return
      word.current.textContent = label

      el.style.pointerEvents = 'auto'
      el.style.visibility = 'visible'

      const cols = el.querySelectorAll('.pt-col')
      const tl = gsap.timeline({ onComplete: onCovered })
      tl.set(cols, { transformOrigin: '50% 100%', scaleY: 0 })
      tl.set([word.current, kick.current], { yPercent: 130 })
      tl.to(cols, { scaleY: 1, duration: 0.62, ease: 'expo.inOut', stagger: 0.055 }, 0)
      tl.to(word.current, { yPercent: 0, duration: 0.6, ease: 'power3.out' }, 0.32)
      tl.to(kick.current, { yPercent: 0, duration: 0.5, ease: 'power3.out' }, 0.4)
      // a beat at full black so the swap never feels like a glitch
      tl.to({}, { duration: 0.15 })
    },

    reveal() {
      const el = root.current
      if (!el || !word.current || !kick.current) return

      const cols = el.querySelectorAll('.pt-col')
      const tl = gsap.timeline({
        onComplete: () => {
          el.style.pointerEvents = 'none'
          el.style.visibility = 'hidden'
        },
      })
      tl.to(kick.current, { yPercent: -130, duration: 0.4, ease: 'power3.in' }, 0)
      tl.to(word.current, { yPercent: -130, duration: 0.45, ease: 'power3.in' }, 0.04)
      tl.set(cols, { transformOrigin: '50% 0%' })
      tl.to(cols, { scaleY: 0, duration: 0.68, ease: 'expo.inOut', stagger: 0.05 }, 0.3)
    },
  }))

  return (
    <div className="pt" ref={root} aria-hidden="true">
      <div className="pt-cols">
        {COLS.map((c) => (
          <span className="pt-col" key={c} />
        ))}
      </div>
      <div className="pt-center">
        <span className="pt-mask">
          <span className="pt-kick" ref={kick}>
            Saturday Themes® — est. 2017
          </span>
        </span>
        <span className="pt-mask">
          <span className="pt-word" ref={word} />
        </span>
      </div>
    </div>
  )
})

export default PageTransition
