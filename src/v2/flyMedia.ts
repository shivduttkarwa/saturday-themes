/*
 * WebGL "liquid peel" plane for the V2 hero morph (ported from the UpSunday ref).
 * A densely subdivided quad drawn in viewport pixel space. Instead of lerping
 * one rect in JS, the vertex shader receives BOTH rects (uFrom = the pill slot
 * in the headline, uTo = the full-bleed panel) plus a scroll progress uShow,
 * and every vertex interpolates between them on its own corner-weighted
 * schedule — a hard corner-by-corner peel (the Lusion curl). A cyclic
 * horizontal wobble and a transient tilt (both zero at rest and on landing)
 * make the flight feel fluid. Cover-fit and the rounded-rect mask are computed
 * per-fragment from the interpolated rect so corners never stretch.
 */

const VERT = `
attribute vec2 aPos;
uniform vec4 uFrom;      // x, y, w, h in css px (viewport space, y down)
uniform vec4 uTo;
uniform float uShow;     // 0..1 scroll progress
uniform vec2 uViewport;  // css px
varying vec2 vUv;
varying vec2 vRectWH;
void main() {
  vec2 p = aPos;         // 0..1 across the quad (y = 0 is the top edge)
  // corner-weighted stagger -> a HARD corner-by-corner peel: a big reveal
  // spread so each vertex unfolds on its own schedule. The wider the
  // spread, the harder the peel.
  float pw = 1.0 - (pow(p.x * p.x, 0.75) + pow(1.0 - p.y, 1.5)) * 0.5;
  float sr = smoothstep(pw * 0.45, 0.55 + pw * 0.45, uShow);

  vec4 rect = mix(uFrom, uTo, sr);
  // subtle horizontal wobble through the transition — zero at both ends
  rect.x += mix(rect.z, 0.0, cos(sr * 6.2831853) * 0.5 + 0.5) * 0.06;

  vec2 sp = rect.xy + p * rect.zw;          // vertex pos in px
  // transient tilt about the rect centre — zero at both ends, peaks mid
  float rot = (smoothstep(0.0, 1.0, sr) - sr) * -1.05;
  vec2 ctr = rect.xy + rect.zw * 0.5;
  vec2 rel = sp - ctr;
  float s = sin(rot);
  float c = cos(rot);
  rel = mat2(c, -s, s, c) * rel;
  sp = ctr + rel;

  vec2 clip = (sp / uViewport) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  vUv = p;
  vRectWH = rect.zw;
}
`

const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform float uVideoAspect;
uniform float uR0;       // corner radius at rest (px) — the pill
uniform float uR1;       // corner radius on landing (px)
uniform float uShow;
varying vec2 vUv;
varying vec2 vRectWH;
void main() {
  // cover-fit against the PER-FRAGMENT interpolated rect, so the crop is
  // correct mid-peel while different parts of the sheet are different sizes
  float planeAspect = vRectWH.x / max(vRectWH.y, 1.0);
  vec2 s = planeAspect > uVideoAspect
    ? vec2(1.0, uVideoAspect / planeAspect)
    : vec2(planeAspect / uVideoAspect, 1.0);
  vec2 uv = (vUv - 0.5) * s + 0.5;
  vec3 col = texture2D(uTex, uv).rgb;

  // rounded-rect SDF mask in rect-local px (radius doesn't stretch with size)
  vec2 p = vUv * vRectWH;
  vec2 halfRes = vRectWH * 0.5;
  float r = min(mix(uR0, uR1, uShow), min(halfRes.x, halfRes.y));
  vec2 q = abs(p - halfRes) - (halfRes - vec2(r));
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  float a = 1.0 - smoothstep(-1.0, 1.0, d);
  gl_FragColor = vec4(col * a, a);
}
`

// dense grid — the peel bends per-vertex, so it needs real resolution
const SEG_X = 128
const SEG_Y = 80

export interface FlyRect {
  x: number
  y: number
  w: number
  h: number
}

export interface FlyDrawOpts {
  from: FlyRect
  to: FlyRect
  show: number // 0..1 scroll progress
  r0: number // corner radius at show = 0
  r1: number // corner radius at show = 1
}

export interface FlyMedia {
  draw: (o: FlyDrawOpts) => void
  destroy: () => void
}

export function createFlyMedia(canvas: HTMLCanvasElement, source: HTMLVideoElement): FlyMedia | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
  })
  if (!gl) return null

  const compile = (type: number, source: string) => {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, source)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('[flyMedia] shader compile error:', gl.getShaderInfoLog(sh))
    }
    return sh
  }

  const prog = gl.createProgram()!
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[flyMedia] program link error:', gl.getProgramInfoLog(prog))
    return null
  }
  gl.useProgram(prog)

  // grid geometry in unit space
  const verts: number[] = []
  for (let iy = 0; iy <= SEG_Y; iy++) {
    for (let ix = 0; ix <= SEG_X; ix++) {
      verts.push(ix / SEG_X, iy / SEG_Y)
    }
  }
  const idx: number[] = []
  for (let iy = 0; iy < SEG_Y; iy++) {
    for (let ix = 0; ix < SEG_X; ix++) {
      const a = iy * (SEG_X + 1) + ix
      const b = a + 1
      const c = a + SEG_X + 1
      const d = c + 1
      idx.push(a, c, b, b, c, d)
    }
  }

  const vbo = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW)
  const ibo = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW)

  const aPos = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const uFrom = gl.getUniformLocation(prog, 'uFrom')
  const uTo = gl.getUniformLocation(prog, 'uTo')
  const uShow = gl.getUniformLocation(prog, 'uShow')
  const uViewport = gl.getUniformLocation(prog, 'uViewport')
  const uVideoAspect = gl.getUniformLocation(prog, 'uVideoAspect')
  const uR0 = gl.getUniformLocation(prog, 'uR0')
  const uR1 = gl.getUniformLocation(prog, 'uR1')

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

  // texture
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  let srcAspect = 16 / 9
  let texLoaded = false
  const updateAspect = () => {
    if (source.videoWidth) srcAspect = source.videoWidth / source.videoHeight
  }
  source.addEventListener('loadedmetadata', updateAspect)
  updateAspect()

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const resize = () => {
    canvas.width = Math.round(window.innerWidth * dpr)
    canvas.height = Math.round(window.innerHeight * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
  }
  resize()
  window.addEventListener('resize', resize)

  const draw = (o: FlyDrawOpts) => {
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // pull the current video frame into the texture
    if (source.readyState >= 2) {
      updateAspect()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
      texLoaded = true
    }
    if (!texLoaded) return

    gl.uniform4f(uFrom, o.from.x, o.from.y, Math.max(1, o.from.w), Math.max(1, o.from.h))
    gl.uniform4f(uTo, o.to.x, o.to.y, Math.max(1, o.to.w), Math.max(1, o.to.h))
    gl.uniform1f(uShow, o.show)
    gl.uniform2f(uViewport, window.innerWidth, window.innerHeight)
    gl.uniform1f(uVideoAspect, srcAspect)
    gl.uniform1f(uR0, Math.max(0, o.r0))
    gl.uniform1f(uR1, Math.max(0, o.r1))

    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0)
  }

  const destroy = () => {
    source.removeEventListener('loadedmetadata', updateAspect)
    window.removeEventListener('resize', resize)
    gl.deleteBuffer(vbo)
    gl.deleteBuffer(ibo)
    gl.deleteTexture(tex)
    gl.deleteProgram(prog)
  }

  return { draw, destroy }
}
