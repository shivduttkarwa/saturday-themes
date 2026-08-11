import { useRef } from 'react'
import type { ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ============================================================================
   01 — THE STUDIO · the flight

   One move, held for the whole section: the camera pushes forward through a
   deep field of studio photography, and the statement is IN that field —
   three giant plates of type standing at their own depths. You do not read
   the sentence, you fly through it, and the studio's photographs rush past
   your shoulders while you do. It lands inside the studio.

   The plates sit where they sit in world space, so perspective gathers them
   toward the vanishing point and they swell as they come — that convergence
   is the depth, and nothing here compensates it away.

   The sentence is handed over one plate at a time: a line only fades up once
   the line before it has swept past the lens, so exactly one is ever legible
   instead of all three stacked on the same spot. Where a photograph happens
   to be behind a line, a paper halo carries the type over it.

   Transform and opacity only. No masks, no filters, nothing that redraws —
   that is what keeps a sixteen-plate 3D push at frame rate.
   ============================================================================ */

const P = 900 // perspective — MUST match .gi-stage in v2.css
const TRAVEL = 7900 // how far the camera flies, in px of depth

/* A plate leaves the frame as it swells past the lens. These are the depths,
   as a fraction of the perspective, where it starts and finishes going. */
const GONE_FROM = 0.42 * P
const GONE_TO = 0.74 * P

const U = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`

type Plate =
  | { k: 'p'; z: number; x: number; y: number; w: number; ar: string; ry: number; img: string }
  | { k: 'w'; z: number; x: number; y: number; line: 1 | 2 | 3 }

/* x/y are vw/vh from centre, z is depth. Perspective does the composition:
   deep plates cluster at the vanishing point and swing wide as they come. */
const FIELD: Plate[] = [
  { k: 'p', z: -780, x: -47, y: -21, w: 27, ar: '4 / 5', ry: 9, img: '1497215728101-856f4ea42174' },
  { k: 'p', z: -1050, x: 45, y: 18, w: 25, ar: '1 / 1', ry: -10, img: '1522542550221-31fd19575a2d' },
  { k: 'w', z: -1350, x: 0, y: -1, line: 1 },
  { k: 'p', z: -1900, x: -33, y: 23, w: 23, ar: '3 / 4', ry: 8, img: '1531403009284-440f080d1e12' },
  { k: 'p', z: -2320, x: 32, y: -22, w: 24, ar: '4 / 5', ry: -7, img: '1493723843671-1d655e66ac1c' },
  { k: 'p', z: -2800, x: 4, y: 45, w: 21, ar: '1 / 1', ry: 5, img: '1506794778202-cad84cf45f1d' },
  { k: 'w', z: -3300, x: 0, y: 1, line: 2 },
  { k: 'p', z: -3820, x: -30, y: -25, w: 23, ar: '4 / 5', ry: 10, img: '1552664730-d307ca884978' },
  { k: 'p', z: -4260, x: 52, y: 21, w: 22, ar: '3 / 4', ry: -8, img: '1497366216548-37526070297c' },
  { k: 'p', z: -4740, x: -5, y: -55, w: 20, ar: '4 / 5', ry: 6, img: '1494790108377-be9c29b29330' },
  { k: 'w', z: -5300, x: 0, y: 0, line: 3 },
  { k: 'p', z: -5740, x: 27, y: -19, w: 21, ar: '1 / 1', ry: -6, img: '1488646953014-85cb44e25828' },
  { k: 'p', z: -6160, x: -28, y: 20, w: 21, ar: '4 / 5', ry: 8, img: '1499951360447-b19be8fe80f5' },
  { k: 'p', z: -6620, x: 8, y: 27, w: 19, ar: '3 / 4', ry: -5, img: '1500648767791-00dcc994a43e' },
  { k: 'p', z: -7060, x: -25, y: -23, w: 19, ar: '4 / 5', ry: 7, img: '1519389950473-47ba0277781c' },
  { k: 'p', z: -7400, x: 24, y: 16, w: 18, ar: '1 / 1', ry: -7, img: '1438761681033-6461ffad8d80' },
]

const STATS = [
  { value: 120, suffix: '+', label: 'Projects shipped' },
  { value: 9, suffix: 'yrs', label: 'Of weekend craft' },
  { value: 0, suffix: '', label: 'Templates used' },
]

/* The stack drops out of the sky and settles into the cloud bank along the
   bottom. `sink` is where a pill comes to rest as a fraction of the bank's
   height, so it lands the same depth into the clouds on any screen. */
const STACK = [
  { label: '✦ GSAP®', variant: 'blue', left: '3%', sink: 0.38, rot: -8 },
  { label: '⚡ React', variant: 'ink', left: '19%', sink: 0.3, rot: 6 },
  { label: '✳ Webflow', variant: 'paper', left: '34%', sink: 0.42, rot: -5 },
  { label: '● Shopify', variant: 'ink', left: '50%', sink: 0.31, rot: 9 },
  { label: '✺ Motion', variant: 'blue', left: '64%', sink: 0.36, rot: -9 },
  { label: '◍ 3D / WebGL', variant: 'paper', left: '77%', sink: 0.29, rot: 5 },
]

function Line({ n }: { n: 1 | 2 | 3 }): ReactNode {
  if (n === 1)
    return (
      <>
        Not your typical{' '}
        <span className="gi-struck">
          agency<span className="gi-strike" aria-hidden="true" />
        </span>
        .
      </>
    )
  if (n === 2) return <>A compact crew of designers &amp; engineers</>
  return (
    <>
      making the web feel{' '}
      <span className="gi-circled">
        handmade
        <svg className="gi-circle" viewBox="0 0 200 64" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M14 32 C 12 12, 58 5, 102 6 C 152 7, 190 13, 189 31 C 188 51, 142 59, 96 58 C 52 57, 16 50, 14 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      </span>{' '}
      again.
    </>
  )
}

export default function Intro() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const scope = root.current!
      const space = scope.querySelector<HTMLElement>('.gi-space')!
      const plates = gsap.utils.toArray<HTMLElement>('.gi-space > *')
      const circle = scope.querySelector<SVGPathElement>('.gi-circle path')
      const circleLen = circle ? circle.getTotalLength() : 0
      if (circle) gsap.set(circle, { strokeDasharray: circleLen, strokeDashoffset: circleLen })

      // stand every plate up in the field
      plates.forEach((el, i) => {
        const o = FIELD[i]
        gsap.set(el, {
          xPercent: -50,
          yPercent: -50,
          x: `${o.x}vw`,
          y: `${o.y}vh`,
          z: o.z,
          rotationY: o.k === 'p' ? o.ry : 0,
        })
      })

      // ---- the approach: the field eases toward you as the section arrives,
      // and hands the camera over at exactly the frame the pin takes it
      const reveal = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: 'top 90%',
          end: 'top top',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
      reveal.from(space, { z: -620, duration: 1, ease: 'power2.out' }, 0)
      reveal.from('.gi-rail > *', { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.12 }, 0.3)

      // ================================================================
      // THE FLIGHT — one linear push, everything else derived from it.
      // Linear on purpose: the camera speed IS the pacing, and any ease
      // here would make the plates lurch as they pass.
      // ================================================================
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope,
          start: 'top top',
          // the flight itself still gets ~285% of it; the rest is the arrival
          end: '+=400%',
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      tl.to(space, { z: TRAVEL, duration: 1, ease: 'none' }, 0)
      tl.to('.gi-rail', { autoAlpha: 0, duration: 0.05 }, 0.04)

      // Each plate dissolves exactly as it reaches the lens — the camera is
      // linear, so the moment is pure arithmetic rather than a hand-tuned
      // number that would drift the instant a depth changed.
      const goneFrom = (z: number) => (GONE_FROM - z) / TRAVEL
      const goneTo = (z: number) => (GONE_TO - z) / TRAVEL

      plates.forEach((el, i) => {
        const { z } = FIELD[i]
        const from = goneFrom(z)
        if (from > 1) return
        tl.to(el, { autoAlpha: 0, ease: 'none', duration: Math.max(0.02, goneTo(z) - from) }, from)
      })

      /* ---- the sentence, handed over one plate at a time.
         Line 1 is up from the first frame. Every later line waits until the
         line before it has finished sweeping past — so a line never has to
         compete with the one in front of it, which is what turned all three
         into a pile before. Their arrival depths are close enough that each
         one fades up at very nearly the same reading size. */
      const wordIdx = FIELD.map((o, i) => (o.k === 'w' ? i : -1)).filter((i) => i >= 0)
      const arrivedAt: number[] = []

      wordIdx.forEach((idx, n) => {
        if (n === 0) {
          arrivedAt.push(0)
          return
        }
        const at = goneTo(FIELD[wordIdx[n - 1]].z) // the previous line is clear
        tl.fromTo(plates[idx], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04, ease: 'none' }, at)
        arrivedAt.push(at + 0.04)
      })

      // the marker marks are drawn just after their own line settles in
      tl.to('.gi-strike', { scaleX: 1, duration: 0.035, ease: 'power2.inOut' }, arrivedAt[0] + 0.03)
      if (circle)
        tl.to(
          circle,
          { strokeDashoffset: 0, duration: 0.05, ease: 'power2.inOut' },
          arrivedAt[2] + 0.03
        )

      /* ---- ARRIVAL — the flight breaks out above the weather.
         Night floods the paper, the bank rises into frame, and SATURDAY
         comes up out of the clouds like a sun. */
      tl.to('.gi-arrive', { autoAlpha: 1, duration: 0.1, ease: 'power2.out' }, 0.8)
      tl.from('.gi-sky', { y: '26%', duration: 0.16, ease: 'power2.out' }, 0.84)
      tl.from('.gi-glow', { autoAlpha: 0, scale: 0.7, duration: 0.16, ease: 'power2.out' }, 0.88)
      tl.from(
        '.gi-card > *',
        { y: 26, autoAlpha: 0, duration: 0.08, stagger: 0.035, ease: 'power3.out' },
        0.9
      )

      // it rises from behind the crests, so it starts fully swallowed
      tl.from('.gi-sun', { y: '30vh', duration: 0.18, ease: 'power3.out' }, 0.95)

      gsap.utils.toArray<HTMLElement>('.gi-num').forEach((el) => {
        const target = Number(el.dataset.v)
        const o = { v: 0 }
        tl.to(
          o,
          {
            v: target,
            duration: 0.08,
            ease: 'power1.out',
            onUpdate: () => {
              el.textContent = String(Math.round(o.v))
            },
          },
          0.96
        )
      })

      /* ---- and the stack drops out of the sky. It falls under gravity
         (power2.in) rather than bouncing — a bounce reads as hitting a floor,
         and the whole point is that the clouds catch it: each pill sinks a
         little past its resting place and floats back up.
         Directions come from the index, never from a random: a scrubbed
         timeline runs backwards as often as forwards, and a random start
         would pick a new one on every re-render. */
      gsap.utils.toArray<HTMLElement>('.gi-sticker').forEach((el, i) => {
        const at = 1.06 + i * 0.024
        tl.from(
          el,
          {
            y: '-130vh',
            x: `${(i % 2 ? 1 : -1) * (8 + i * 3)}vw`,
            rotation: (i % 2 ? 1 : -1) * (120 + i * 35),
            duration: 0.1,
            ease: 'power2.in',
          },
          at
        )
        tl.to(el, { y: 12, duration: 0.025, ease: 'power2.out' }, at + 0.1)
        tl.to(el, { y: 0, duration: 0.05, ease: 'power2.inOut' }, at + 0.125)
      })

      // a held beat so the pin never releases on the last frame of motion
      tl.to({}, { duration: 0.06 })

      // ---- the field breathes, off the scroll entirely
      gsap.to(space, {
        rotationY: 1.4,
        rotationX: -0.8,
        duration: 14,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })
    },
    { scope: root }
  )

  return (
    <section className="g-intro" id="studio" ref={root}>
      <div className="gi-stage">
        <div className="gi-space">
          {FIELD.map((o, i) =>
            o.k === 'p' ? (
              <figure
                className="gi-plate"
                key={i}
                style={{ width: `${o.w}vw`, aspectRatio: o.ar }}
              >
                <img src={U(o.img)} alt="" loading="lazy" decoding="async" />
              </figure>
            ) : (
              <div className="gi-wordplate" key={i}>
                <Line n={o.line} />
              </div>
            )
          )}
        </div>

        <div className="gi-rail">
          <span className="g-label">( 01 — The studio )</span>
          <span className="g-label">Scroll to fly through ↓</span>
        </div>

        {/* ---- ABOVE THE CLOUDS ----
            The flight breaks through the weather and comes out on top of it.
            SATURDAY rises out of the bank like a sun, the stack rains down
            past it, and the clouds swallow whatever lands short. */}
        <div className="gi-arrive">
          <div className="gi-glow" aria-hidden="true" />

          <div className="gi-sky" aria-hidden="true">
            <img src="/cloudes.png" alt="" />
          </div>

          <div className="gi-sunwrap" aria-hidden="true">
            <span className="gi-sun">Saturday</span>
          </div>

          <div className="gi-slaps" aria-hidden="true">
            {STACK.map((s) => (
              <span
                className={`gi-sticker is-${s.variant}`}
                key={s.label}
                style={{
                  left: s.left,
                  bottom: `calc(var(--sky) * ${s.sink})`,
                  rotate: `${s.rot}deg`,
                }}
              >
                {s.label}
              </span>
            ))}
          </div>

          {/* the same clouds again, cropped to their crests and laid over the
              word and the pills — that overlap is what sinks them into it */}
          <div className="gi-sky is-front" aria-hidden="true">
            <img src="/cloudes.png" alt="" />
          </div>

          <div className="gi-card">
            <div className="gi-top">
              <span className="g-label">( 01 — The studio )</span>

              <div className="gi-stats">
                {STATS.map((s) => (
                  <div className="gi-stat" key={s.label}>
                    <span className="gi-stat-value">
                      <span className="gi-num" data-v={s.value}>
                        0
                      </span>
                      <span className="gi-suffix">{s.suffix}</span>
                    </span>
                    <span className="gi-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="gi-said">
              Nine years of Saturdays. One rule: nothing that looks like a template.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
