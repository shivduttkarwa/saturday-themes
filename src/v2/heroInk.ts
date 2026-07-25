/*
 * Cursor water-reveal for the V2 hero.
 * A real-time GPU fluid simulation (stable fluids: semi-Lagrangian advection,
 * Jacobi pressure solve, vorticity confinement). The cursor injects dye AND
 * momentum, so every stroke becomes a current — it flows, curls into eddies,
 * stretches into tendrils and keeps drifting after the pointer stops.
 * The composite pass thresholds the dye into a glassy meniscus and reveals
 * through CSS difference blending — paper turns black, the headline inverts.
 * Requires WebGL2 + renderable half-float; returns null otherwise (the effect
 * is decorative and both callers handle the fallback).
 */

const QUAD_VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos * 2.0 - 1.0, 0.0, 1.0);
}
`

/* move any field through the velocity field (velocity itself, and the dye) */
const ADVECT_FRAG = `
precision highp float;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uTexel;       // 1 / sim resolution
uniform float uDt;
uniform float uDissipation;
varying vec2 vUv;
void main() {
  vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexel;
  vec4 result = texture2D(uSource, coord);
  gl_FragColor = result / (1.0 + uDissipation * uDt);
}
`

/* stroke splat — used for both momentum (velocity) and ink (dye).
   A capsule along the last stroke segment, not a round dot: the injected
   shape is already stretched in the direction of travel, so the fluid pulls
   it into streaks and teardrops instead of pushing a ball around.
   uClamp01 = 1 keeps the dye from over-saturating (repeated strokes would
   otherwise pile up into blobs that linger long after the fade should end) */
const SPLAT_FRAG = `
precision highp float;
uniform sampler2D uTarget;
uniform float uAspect;
uniform vec2 uP0;         // stroke start (uv)
uniform vec2 uP1;         // stroke end — the cursor (uv)
uniform vec2 uDir;        // smoothed travel direction (aspect space, unit)
uniform float uSquash;    // >1 squeezes the splat across the direction of travel
uniform vec3 uColor;
uniform float uRadius;
uniform float uClamp01;
varying vec2 vUv;
void main() {
  vec2 asp = vec2(uAspect, 1.0);
  vec2 pa = vUv * asp - uP0 * asp;
  vec2 ba = (uP1 - uP0) * asp;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  vec2 q = pa - ba * h;                       // offset from the stroke centreline

  // anisotropic falloff: narrow across the stroke, long along it. an isotropic
  // gaussian can only ever produce a bead — this is what makes it a ribbon.
  vec2 perp = vec2(-uDir.y, uDir.x);
  vec2 e = vec2(dot(q, uDir), dot(q, perp) * uSquash);
  float d = length(e);

  vec3 splat = exp(-(d * d) / uRadius) * uColor;
  vec3 v = texture2D(uTarget, vUv).xyz + splat;
  gl_FragColor = vec4(mix(v, clamp(v, 0.0, 1.0), uClamp01), 1.0);
}
`

const CURL_FRAG = `
precision highp float;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  float L = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).y;
  float R = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).y;
  float B = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).x;
  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}
`

/* vorticity confinement — feeds the small eddies that make it read as water */
const VORTICITY_FRAG = `
precision highp float;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 uTexel;
uniform float uStrength;
uniform float uDt;
varying vec2 vUv;
void main() {
  float L = texture2D(uCurl, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture2D(uCurl, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture2D(uCurl, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture2D(uCurl, vUv + vec2(0.0, uTexel.y)).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= uStrength * C;
  force.y *= -1.0;
  vec2 velocity = texture2D(uVelocity, vUv).xy + force * uDt;
  gl_FragColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);
}
`

const DIVERGENCE_FRAG = `
precision highp float;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  float L = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
  float T = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).y;
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}
`

const CLEAR_FRAG = `
precision highp float;
uniform sampler2D uTexture;
uniform float uValue;
varying vec2 vUv;
void main() {
  gl_FragColor = uValue * texture2D(uTexture, vUv);
}
`

const PRESSURE_FRAG = `
precision highp float;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  float L = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  float divergence = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
}
`

const GRADIENT_FRAG = `
precision highp float;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  float L = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`

const COMPOSITE_FRAG = `
precision highp float;
uniform sampler2D uDye;
uniform vec2 uTexel;      // 1 / dye resolution
uniform vec3 uPaper;      // page background color
varying vec2 vUv;
void main() {
  // the lightest smoothing — just enough to keep the waterline from
  // aliasing. any more and filaments melt back into one round mass.
  vec2 t = uTexel * 1.1;
  float m = texture2D(uDye, vUv).r * 0.52;
  m += texture2D(uDye, vUv + vec2(t.x, 0.0)).r * 0.12;
  m += texture2D(uDye, vUv - vec2(t.x, 0.0)).r * 0.12;
  m += texture2D(uDye, vUv + vec2(0.0, t.y)).r * 0.12;
  m += texture2D(uDye, vUv - vec2(0.0, t.y)).r * 0.12;

  // the waterline: cut close to the core so the edge tracks the fluid's
  // real silhouette — torn, tapering, never a circle around the cursor
  float a = smoothstep(0.44, 0.55, m);

  // meniscus shading from the field gradient
  float ml = texture2D(uDye, vUv - vec2(uTexel.x * 2.5, 0.0)).r;
  float mr = texture2D(uDye, vUv + vec2(uTexel.x * 2.5, 0.0)).r;
  float mb = texture2D(uDye, vUv - vec2(0.0, uTexel.y * 2.5)).r;
  float mt = texture2D(uDye, vUv + vec2(0.0, uTexel.y * 2.5)).r;
  float spec = clamp(-(mt - mb) * 2.4 - (mr - ml) * 1.0, 0.0, 1.0);

  // thin darker band hugging the waterline — the glassy rim of a real drop
  float rim = a * (1.0 - smoothstep(0.55, 0.72, m));

  // paper-colored water + difference blending (CSS) inverts whatever sits
  // beneath: paper turns black, the dark headline turns light.
  vec3 col = uPaper * (1.0 - rim * 0.16 - pow(spec, 2.0) * 0.14);

  gl_FragColor = vec4(col * a, a);
}
`

/* sim tuning — the "wateriness" lives in these numbers.
   Elegance = restraint: laminar swirls (low curl), a calm settle (higher
   velocity dissipation) and a trail that clears within a couple of seconds. */
const SIM_H = 128 // velocity / pressure grid height
/* high enough that filaments and torn edges survive advection — at low res
   everything melts into one round mass no matter how the splat is shaped */
const DYE_H = 640
const PRESSURE_ITERATIONS = 20
const CURL_STRENGTH = 14 // shears the ribbon into tendrils
const VELOCITY_DISSIPATION = 0.32 // currents glide, then settle
const DYE_DISSIPATION = 1.2 // the ink clears — the page stays clean
const SPLAT_SQUASH = 2.4 // ribbon thinness across the stroke
/* once the pointer rests, the water calms and clears much faster */
const IDLE_DELAY = 0.12 // s of stillness before the fast fade kicks in
const IDLE_VELOCITY_DISSIPATION = 1.6
const IDLE_DYE_DISSIPATION = 4.5
const SPLAT_FORCE = 3600
const PRESSURE_FADE = 0.82

export interface HeroInk {
  /** feed a pointer position in element-space uv (y up) */
  setMouse: (u: number, v: number, entered: boolean) => void
  step: (time: number) => void
  resize: () => void
  destroy: () => void
}

interface FBO {
  tex: WebGLTexture
  fb: WebGLFramebuffer
  w: number
  h: number
}

interface DoubleFBO {
  read: FBO
  write: FBO
  swap: () => void
}

export function createHeroInk(canvas: HTMLCanvasElement): HeroInk | null {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    depth: false,
    stencil: false,
  }) as WebGL2RenderingContext | null
  if (!gl) return null
  // half-float render targets are the whole ballgame for a fluid sim
  if (!gl.getExtension('EXT_color_buffer_float')) return null

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('[heroInk] shader compile error:', gl.getShaderInfoLog(sh))
    }
    return sh
  }

  const vert = compile(gl.VERTEX_SHADER, QUAD_VERT)

  interface Prog {
    p: WebGLProgram
    u: Record<string, WebGLUniformLocation | null>
    aPos: number
  }
  const link = (frag: string): Prog | null => {
    const p = gl.createProgram()!
    gl.attachShader(p, vert)
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, frag))
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn('[heroInk] link error:', gl.getProgramInfoLog(p))
      return null
    }
    const u: Record<string, WebGLUniformLocation | null> = {}
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i)
      if (info) u[info.name] = gl.getUniformLocation(p, info.name)
    }
    return { p, u, aPos: gl.getAttribLocation(p, 'aPos') }
  }

  const advectProg = link(ADVECT_FRAG)
  const splatProg = link(SPLAT_FRAG)
  const curlProg = link(CURL_FRAG)
  const vorticityProg = link(VORTICITY_FRAG)
  const divergenceProg = link(DIVERGENCE_FRAG)
  const clearProg = link(CLEAR_FRAG)
  const pressureProg = link(PRESSURE_FRAG)
  const gradientProg = link(GRADIENT_FRAG)
  const compProg = link(COMPOSITE_FRAG)
  const progs = [
    advectProg,
    splatProg,
    curlProg,
    vorticityProg,
    divergenceProg,
    clearProg,
    pressureProg,
    gradientProg,
    compProg,
  ]
  if (progs.some((p) => !p)) return null

  // fullscreen quad
  const vbo = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW)

  const makeFBO = (w: number, h: number): FBO => {
    const tex = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null)
    const fb = gl.createFramebuffer()!
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    gl.viewport(0, 0, w, h)
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    return { tex, fb, w, h }
  }

  const makeDouble = (w: number, h: number): DoubleFBO => {
    const pair = { read: makeFBO(w, h), write: makeFBO(w, h) }
    return {
      get read() {
        return pair.read
      },
      get write() {
        return pair.write
      },
      swap() {
        const t = pair.read
        pair.read = pair.write
        pair.write = t
      },
    } as DoubleFBO
  }

  const releaseFBO = (f: FBO) => {
    gl.deleteTexture(f.tex)
    gl.deleteFramebuffer(f.fb)
  }

  // sim state
  let simW = SIM_H
  let simH = SIM_H
  let dyeW = DYE_H
  let dyeH = DYE_H
  let velocity: DoubleFBO
  let pressure: DoubleFBO
  let dye: DoubleFBO
  let divergence: FBO
  let curl: FBO
  let allFBOs: FBO[] = []

  const buildSim = () => {
    for (const f of allFBOs) releaseFBO(f)
    allFBOs = []
    const aspect = Math.max(canvas.clientWidth / Math.max(canvas.clientHeight, 1), 0.5)
    simW = Math.round(SIM_H * aspect)
    simH = SIM_H
    dyeW = Math.round(DYE_H * aspect)
    dyeH = DYE_H
    velocity = makeDouble(simW, simH)
    pressure = makeDouble(simW, simH)
    dye = makeDouble(dyeW, dyeH)
    divergence = makeFBO(simW, simH)
    curl = makeFBO(simW, simH)
    allFBOs = [velocity.read, velocity.write, pressure.read, pressure.write, dye.read, dye.write, divergence, curl]
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 1.25)
  const resize = () => {
    canvas.width = Math.max(2, Math.round(canvas.clientWidth * dpr))
    canvas.height = Math.max(2, Math.round(canvas.clientHeight * dpr))
    buildSim()
  }
  resize()

  const draw = (prog: Prog, target: FBO | null) => {
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb)
      gl.viewport(0, 0, target.w, target.h)
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    gl.useProgram(prog.p)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.enableVertexAttribArray(prog.aPos)
    gl.vertexAttribPointer(prog.aPos, 2, gl.FLOAT, false, 0, 0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  const bindTex = (tex: WebGLTexture, unit: number) => {
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    return unit
  }

  // pointer state (uv, y up) — stroke segments queue up for the next step
  let last = { x: 0.5, y: 0.5 }
  let hasPointer = false
  // smoothed travel direction — the instantaneous segment goes to zero on
  // slow moves, and a splat with no direction is necessarily round
  let dir = { x: 1, y: 0 }
  const splats: {
    x0: number
    y0: number
    x1: number
    y1: number
    dx: number
    dy: number
    dirx: number
    diry: number
    squash: number
    r: number
    s: number
  }[] = []

  const setMouse = (u: number, v: number, entered: boolean) => {
    if (!entered || !hasPointer) {
      last = { x: u, y: v }
      hasPointer = entered
      return
    }
    const dx = u - last.x
    const dy = v - last.y
    const speed = Math.hypot(dx, dy)
    if (speed < 0.0004) return

    // aspect-corrected, eased so the ribbon banks through turns
    const aspect = Math.max(canvas.clientWidth / Math.max(canvas.clientHeight, 1), 0.5)
    const nx = (dx * aspect) / speed
    const ny = dy / speed
    dir = { x: dir.x * 0.6 + nx * 0.4, y: dir.y * 0.6 + ny * 0.4 }
    const dl = Math.hypot(dir.x, dir.y) || 1
    dir = { x: dir.x / dl, y: dir.y / dl }

    if (splats.length < 10) {
      splats.push({
        x0: last.x,
        y0: last.y,
        x1: u,
        y1: v,
        dx: dx * SPLAT_FORCE,
        dy: dy * SPLAT_FORCE,
        dirx: dir.x,
        diry: dir.y,
        // faster strokes draw out thinner — water stretches as it's pulled
        squash: SPLAT_SQUASH + Math.min(1.4, speed * 22),
        r: 0.00045 + Math.min(0.0009, speed * 0.008),
        s: Math.min(1, 0.5 + speed * 20),
      })

      // fast strokes shed beads off the trailing edge — separate droplets are
      // what read as water rather than one continuous mass
      if (speed > 0.006 && Math.random() < 0.5 && splats.length < 10) {
        const side = Math.random() < 0.5 ? 1 : -1
        const off = 0.01 + Math.random() * 0.03
        const px = (-dir.y * side * off) / aspect
        const py = dir.x * side * off
        splats.push({
          x0: u + px,
          y0: v + py,
          x1: u + px,
          y1: v + py,
          dx: 0,
          dy: 0,
          dirx: dir.x,
          diry: dir.y,
          squash: 1.15,
          r: 0.00006 + Math.random() * 0.00012,
          s: 0.75 + Math.random() * 0.25,
        })
      }
    }
    last = { x: u, y: v }
  }

  let lastTime: number | null = null
  let idleT = 0
  const step = (time: number) => {
    const dt = lastTime === null ? 1 / 60 : Math.min(Math.max(time - lastTime, 0), 1 / 30)
    lastTime = time
    const simAspect = simW / simH

    // stillness detector — while the pointer rests, the fade accelerates
    if (splats.length > 0) idleT = 0
    else idleT += dt
    const idle = Math.min(1, Math.max(0, (idleT - IDLE_DELAY) / 0.25))
    const velDissipation =
      VELOCITY_DISSIPATION + (IDLE_VELOCITY_DISSIPATION - VELOCITY_DISSIPATION) * idle
    const dyeDissipation = DYE_DISSIPATION + (IDLE_DYE_DISSIPATION - DYE_DISSIPATION) * idle

    gl.disable(gl.BLEND)

    /* --- inject the cursor strokes: momentum into velocity, ink into dye --- */
    const a = advectProg!
    const sp = splatProg!
    for (const s of splats.splice(0)) {
      gl.useProgram(sp.p)
      gl.uniform1f(sp.u.uAspect!, simAspect)
      gl.uniform2f(sp.u.uP0!, s.x0, s.y0)
      gl.uniform2f(sp.u.uP1!, s.x1, s.y1)
      gl.uniform2f(sp.u.uDir!, s.dirx, s.diry)
      gl.uniform1f(sp.u.uSquash!, s.squash)
      gl.uniform1f(sp.u.uRadius!, s.r)
      gl.uniform1f(sp.u.uClamp01!, 0)
      gl.uniform1i(sp.u.uTarget!, bindTex(velocity.read.tex, 0))
      gl.uniform3f(sp.u.uColor!, s.dx, s.dy, 0)
      draw(sp, velocity.write)
      velocity.swap()

      gl.useProgram(sp.p)
      gl.uniform1f(sp.u.uClamp01!, 1)
      gl.uniform1i(sp.u.uTarget!, bindTex(dye.read.tex, 0))
      gl.uniform3f(sp.u.uColor!, s.s, 0, 0)
      draw(sp, dye.write)
      dye.swap()
    }

    /* --- vorticity confinement keeps the eddies alive --- */
    const cu = curlProg!
    gl.useProgram(cu.p)
    gl.uniform2f(cu.u.uTexel!, 1 / simW, 1 / simH)
    gl.uniform1i(cu.u.uVelocity!, bindTex(velocity.read.tex, 0))
    draw(cu, curl)

    const vo = vorticityProg!
    gl.useProgram(vo.p)
    gl.uniform2f(vo.u.uTexel!, 1 / simW, 1 / simH)
    gl.uniform1f(vo.u.uStrength!, CURL_STRENGTH)
    gl.uniform1f(vo.u.uDt!, dt)
    gl.uniform1i(vo.u.uVelocity!, bindTex(velocity.read.tex, 0))
    gl.uniform1i(vo.u.uCurl!, bindTex(curl.tex, 1))
    draw(vo, velocity.write)
    velocity.swap()

    /* --- pressure projection: make the flow incompressible (watery) --- */
    const dv = divergenceProg!
    gl.useProgram(dv.p)
    gl.uniform2f(dv.u.uTexel!, 1 / simW, 1 / simH)
    gl.uniform1i(dv.u.uVelocity!, bindTex(velocity.read.tex, 0))
    draw(dv, divergence)

    const cl = clearProg!
    gl.useProgram(cl.p)
    gl.uniform1f(cl.u.uValue!, PRESSURE_FADE)
    gl.uniform1i(cl.u.uTexture!, bindTex(pressure.read.tex, 0))
    draw(cl, pressure.write)
    pressure.swap()

    const pr = pressureProg!
    gl.useProgram(pr.p)
    gl.uniform2f(pr.u.uTexel!, 1 / simW, 1 / simH)
    for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
      gl.useProgram(pr.p)
      gl.uniform1i(pr.u.uPressure!, bindTex(pressure.read.tex, 0))
      gl.uniform1i(pr.u.uDivergence!, bindTex(divergence.tex, 1))
      draw(pr, pressure.write)
      pressure.swap()
    }

    const gr = gradientProg!
    gl.useProgram(gr.p)
    gl.uniform2f(gr.u.uTexel!, 1 / simW, 1 / simH)
    gl.uniform1i(gr.u.uPressure!, bindTex(pressure.read.tex, 0))
    gl.uniform1i(gr.u.uVelocity!, bindTex(velocity.read.tex, 1))
    draw(gr, velocity.write)
    velocity.swap()

    /* --- advect: the field carries itself, then carries the ink --- */
    gl.useProgram(a.p)
    gl.uniform2f(a.u.uTexel!, 1 / simW, 1 / simH)
    gl.uniform1f(a.u.uDt!, dt)
    gl.uniform1f(a.u.uDissipation!, velDissipation)
    gl.uniform1i(a.u.uVelocity!, bindTex(velocity.read.tex, 0))
    gl.uniform1i(a.u.uSource!, bindTex(velocity.read.tex, 0))
    draw(a, velocity.write)
    velocity.swap()

    gl.useProgram(a.p)
    gl.uniform1f(a.u.uDissipation!, dyeDissipation)
    gl.uniform1i(a.u.uVelocity!, bindTex(velocity.read.tex, 0))
    gl.uniform1i(a.u.uSource!, bindTex(dye.read.tex, 1))
    draw(a, dye.write)
    dye.swap()

    /* --- composite to screen --- */
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const cp = compProg!
    gl.useProgram(cp.p)
    gl.uniform1i(cp.u.uDye!, bindTex(dye.read.tex, 0))
    gl.uniform2f(cp.u.uTexel!, 1 / dyeW, 1 / dyeH)
    gl.uniform3f(cp.u.uPaper!, 0.949, 0.937, 0.914)
    draw(cp, null)
  }

  const destroy = () => {
    for (const f of allFBOs) releaseFBO(f)
    gl.deleteBuffer(vbo)
    for (const p of progs) if (p) gl.deleteProgram(p.p)
  }

  return { setMouse, step, resize, destroy }
}
