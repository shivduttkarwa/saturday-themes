/*
 * Cursor ink-reveal for the V2 hero (noth.in-style).
 * A low-res ping-pong "trail" buffer accumulates cursor strokes (segment
 * splats so fast moves leave a continuous stroke), decays them each frame
 * and advects them with curl noise so the ink keeps swirling on its own.
 * The composite pass distorts the mask edge with fbm noise and reveals the
 * video inside a black ink rim, over a transparent canvas — the paper and
 * the DOM headline stay untouched above/below it.
 */

const QUAD_VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos * 2.0 - 1.0, 0.0, 1.0);
}
`

const NOISE = `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
`

const TRAIL_FRAG = `
precision highp float;
uniform sampler2D uPrev;
uniform vec2 uM0;        // stroke start (uv)
uniform vec2 uM1;        // stroke end (uv)
uniform float uStrength; // 0..1
uniform float uRadius;   // uv-squared falloff
uniform vec2 uDropPos;   // satellite droplet
uniform vec2 uDropParams;// radius, strength
uniform float uAspect;
uniform float uTime;
varying vec2 vUv;
${NOISE}
vec2 curl(vec2 p) {
  float e = 0.04;
  float n1 = noise(p + vec2(0.0, e));
  float n2 = noise(p - vec2(0.0, e));
  float n3 = noise(p + vec2(e, 0.0));
  float n4 = noise(p - vec2(e, 0.0));
  return vec2(n1 - n2, n4 - n3) / (2.0 * e);
}
float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}
void main() {
  // barely-there drift — drops quiver, they don't smear
  vec2 flow = curl(vUv * 2.2 + uTime * 0.05) * 0.0008;
  float prev = texture2D(uPrev, vUv - flow).r * 0.972;

  vec2 asp = vec2(uAspect, 1.0);
  float d = sdSegment(vUv * asp, uM0 * asp, uM1 * asp);
  float splat = exp(-(d * d) / uRadius) * uStrength;

  // satellite droplet flicked off the stroke
  vec2 dd = (vUv - uDropPos) * asp;
  splat += exp(-dot(dd, dd) / uDropParams.x) * uDropParams.y;

  gl_FragColor = vec4(clamp(prev + splat, 0.0, 1.0), 0.0, 0.0, 1.0);
}
`

const COMPOSITE_FRAG = `
precision highp float;
uniform sampler2D uTrail;
uniform sampler2D uTex;   // video
uniform vec2 uUvScale;    // cover-fit crop
uniform vec2 uTexel;      // 1 / trail resolution
uniform float uAspect;
uniform float uTime;
varying vec2 vUv;
${NOISE}
float fbm(vec2 p) {
  float v = 0.0;
  v += 0.5 * noise(p);
  v += 0.25 * noise(p * 2.13 + 5.2);
  v += 0.125 * noise(p * 4.27 + 9.7);
  return v / 0.875;
}
void main() {
  float m = texture2D(uTrail, vUv).r;

  // surface normal of the water from the field gradient
  float ml = texture2D(uTrail, vUv - vec2(uTexel.x * 1.5, 0.0)).r;
  float mr = texture2D(uTrail, vUv + vec2(uTexel.x * 1.5, 0.0)).r;
  float mb = texture2D(uTrail, vUv - vec2(0.0, uTexel.y * 1.5)).r;
  float mt = texture2D(uTrail, vUv + vec2(0.0, uTexel.y * 1.5)).r;
  vec2 nrm = vec2(mr - ml, mt - mb);

  // the merest imperfection — drops stay round, never mechanical
  float n = fbm(vUv * vec2(uAspect, 1.0) * 2.2 + uTime * 0.05);
  float mm = m + (n - 0.5) * 0.07;

  // crisp meniscus: tight threshold on a smooth field = metaball droplets
  float a = smoothstep(0.40, 0.50, mm);

  // droplet lens: the video bulges through the drop like light through water
  vec2 vuv = 0.5 + (vUv - 0.5) * uUvScale;
  vuv.y = 1.0 - vuv.y;
  vuv -= nrm * vec2(0.22, -0.22);

  vec3 video = texture2D(uTex, vuv).rgb;

  // gentle grade so the reveal reads rich against the paper
  float g = dot(video, vec3(0.299, 0.587, 0.114));
  video = mix(vec3(g), video, 1.12) * 0.99;

  // glassy highlight along the upper meniscus
  float spec = clamp(-nrm.y * 2.6 - nrm.x * 1.2, 0.0, 1.0);
  video += vec3(pow(spec, 2.2) * 0.28);

  gl_FragColor = vec4(video * a, a);
}
`

const TRAIL_H = 384

export interface HeroInk {
  /** feed a pointer position in element-space uv (y up) */
  setMouse: (u: number, v: number, entered: boolean) => void
  step: (time: number) => void
  resize: () => void
  destroy: () => void
}

export function createHeroInk(canvas: HTMLCanvasElement, source: HTMLVideoElement): HeroInk | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
  })
  if (!gl) return null

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('[heroInk] shader compile error:', gl.getShaderInfoLog(sh))
    }
    return sh
  }
  const link = (frag: string) => {
    const p = gl.createProgram()!
    gl.attachShader(p, compile(gl.VERTEX_SHADER, QUAD_VERT))
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, frag))
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn('[heroInk] link error:', gl.getProgramInfoLog(p))
      return null
    }
    return p
  }

  const trailProg = link(TRAIL_FRAG)
  const compProg = link(COMPOSITE_FRAG)
  if (!trailProg || !compProg) return null

  // fullscreen quad
  const vbo = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW)
  const bindQuad = (prog: WebGLProgram) => {
    const loc = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  }

  const makeTex = (w: number, h: number) => {
    const t = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    return t
  }

  // ping-pong trail buffers (low res is plenty — the mask is soft anyway)
  let trailW = TRAIL_H
  let trailH = TRAIL_H
  const fbos: { tex: WebGLTexture; fb: WebGLFramebuffer }[] = []
  const buildTrail = () => {
    const aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1)
    trailW = Math.round(TRAIL_H * Math.max(aspect, 0.5))
    trailH = TRAIL_H
    for (const f of fbos.splice(0)) {
      gl.deleteTexture(f.tex)
      gl.deleteFramebuffer(f.fb)
    }
    for (let i = 0; i < 2; i++) {
      const tex = makeTex(trailW, trailH)
      const fb = gl.createFramebuffer()!
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      fbos.push({ tex, fb })
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  // video texture
  const videoTex = makeTex(2, 2)
  let srcAspect = 16 / 9
  const updateAspect = () => {
    if (source.videoWidth) srcAspect = source.videoWidth / source.videoHeight
  }
  source.addEventListener('loadedmetadata', updateAspect)
  updateAspect()

  const dpr = Math.min(window.devicePixelRatio || 1, 1.25)
  const resize = () => {
    canvas.width = Math.max(2, Math.round(canvas.clientWidth * dpr))
    canvas.height = Math.max(2, Math.round(canvas.clientHeight * dpr))
    buildTrail()
  }
  resize()

  // pointer state (uv, y up)
  let m0 = { x: 0.5, y: 0.5 }
  let m1 = { x: 0.5, y: 0.5 }
  let strength = 0
  let radius = 0.0004
  let hasPointer = false
  const drops: { x: number; y: number; r: number; s: number }[] = []

  const setMouse = (u: number, v: number, entered: boolean) => {
    if (!entered || !hasPointer) {
      m0 = { x: u, y: v }
      m1 = { x: u, y: v }
      hasPointer = entered
      return
    }
    const speed = Math.hypot(u - m1.x, v - m1.y)
    m1 = { x: u, y: v }
    strength = Math.min(1, 0.55 + speed * 25)
    radius = 0.001 + Math.min(0.004, speed * 0.04)

    // fast strokes flick off small satellite droplets
    if (speed > 0.008 && Math.random() < 0.3 && drops.length < 8) {
      const ang = Math.random() * Math.PI * 2
      const dist = 0.02 + Math.random() * 0.05
      drops.push({
        x: u + Math.cos(ang) * dist,
        y: v + Math.sin(ang) * dist,
        r: 0.00006 + Math.random() * 0.00025,
        s: 0.5 + Math.random() * 0.5,
      })
    }
  }

  let flip = 0
  const step = (time: number) => {
    // --- trail update (ping-pong) ---
    const src = fbos[flip]
    const dst = fbos[1 - flip]
    flip = 1 - flip

    gl.disable(gl.BLEND)
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb)
    gl.viewport(0, 0, trailW, trailH)
    gl.useProgram(trailProg)
    bindQuad(trailProg)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, src.tex)
    gl.uniform1i(gl.getUniformLocation(trailProg, 'uPrev'), 0)
    gl.uniform2f(gl.getUniformLocation(trailProg, 'uM0'), m0.x, m0.y)
    gl.uniform2f(gl.getUniformLocation(trailProg, 'uM1'), m1.x, m1.y)
    gl.uniform1f(gl.getUniformLocation(trailProg, 'uStrength'), hasPointer ? strength : 0)
    gl.uniform1f(gl.getUniformLocation(trailProg, 'uRadius'), radius)
    gl.uniform1f(gl.getUniformLocation(trailProg, 'uAspect'), trailW / trailH)
    gl.uniform1f(gl.getUniformLocation(trailProg, 'uTime'), time)
    const drop = drops.shift()
    gl.uniform2f(gl.getUniformLocation(trailProg, 'uDropPos'), drop?.x ?? 0, drop?.y ?? 0)
    gl.uniform2f(gl.getUniformLocation(trailProg, 'uDropParams'), drop?.r ?? 1, drop?.s ?? 0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    // stroke consumed — next segment starts here; strength eases off
    m0 = { ...m1 }
    strength *= 0.8

    // --- composite to screen ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    gl.useProgram(compProg)
    bindQuad(compProg)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, dst.tex)
    gl.uniform1i(gl.getUniformLocation(compProg, 'uTrail'), 0)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, videoTex)
    if (source.readyState >= 2) {
      updateAspect()
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
    }
    gl.uniform1i(gl.getUniformLocation(compProg, 'uTex'), 1)

    const rectAspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1)
    const uvScale: [number, number] =
      rectAspect > srcAspect ? [1, srcAspect / rectAspect] : [rectAspect / srcAspect, 1]
    gl.uniform2f(gl.getUniformLocation(compProg, 'uUvScale'), uvScale[0], uvScale[1])
    gl.uniform2f(gl.getUniformLocation(compProg, 'uTexel'), 1 / trailW, 1 / trailH)
    gl.uniform1f(gl.getUniformLocation(compProg, 'uAspect'), rectAspect)
    gl.uniform1f(gl.getUniformLocation(compProg, 'uTime'), time)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.activeTexture(gl.TEXTURE0)
  }

  const destroy = () => {
    source.removeEventListener('loadedmetadata', updateAspect)
    for (const f of fbos) {
      gl.deleteTexture(f.tex)
      gl.deleteFramebuffer(f.fb)
    }
    gl.deleteTexture(videoTex)
    gl.deleteBuffer(vbo)
    gl.deleteProgram(trailProg)
    gl.deleteProgram(compProg)
  }

  return { setMouse, step, resize, destroy }
}
