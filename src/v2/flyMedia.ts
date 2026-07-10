/*
 * WebGL "flying silk" plane for the V2 hero morph.
 * A 64×32-segment quad drawn in viewport pixel space; vertices are displaced
 * by layered sine waves (uAmp) so the media ripples like cloth mid-flight.
 * Rounded-pill corners are cut in the fragment shader (uRadius) so the
 * geometry can wave freely outside its nominal rect without CSS clipping.
 */

const VERT = `
attribute vec2 aPos;
uniform vec4 uRect;      // x, y, w, h in css px (viewport space)
uniform vec2 uViewport;  // css px
uniform float uAmp;      // px
uniform float uTime;     // seconds
varying vec2 vUv;
void main() {
  vUv = aPos;
  vec2 px = uRect.xy + aPos * uRect.zw;
  float w1 = sin(aPos.x * 9.42478 + uTime * 2.2);
  float w2 = sin(aPos.x * 4.71239 - uTime * 1.4 + 1.7);
  float env = 0.7 + 0.3 * sin(aPos.y * 3.14159);
  px.y += (w1 * 0.65 + w2 * 0.35) * uAmp * env;
  px.x += sin(aPos.y * 3.14159 + uTime * 1.1) * uAmp * 0.3;
  vec2 clip = (px / uViewport) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec4 uRect;
uniform float uRadius;   // px
uniform float uShade;    // 0..1 darken
uniform vec2 uUvScale;   // cover-fit crop
varying vec2 vUv;
void main() {
  vec2 uv = 0.5 + (vUv - 0.5) * uUvScale;
  vec3 col = texture2D(uTex, uv).rgb;
  vec2 halfSize = uRect.zw * 0.5;
  vec2 q = abs((vUv - 0.5) * uRect.zw) - (halfSize - vec2(uRadius));
  float d = length(max(q, 0.0)) - uRadius;
  float a = 1.0 - smoothstep(-1.0, 1.0, d);
  col *= (1.0 - uShade);
  gl_FragColor = vec4(col * a, a);
}
`

const SEG_X = 64
const SEG_Y = 32

export interface FlyDrawOpts {
  x: number
  y: number
  w: number
  h: number
  amp: number
  time: number
  radius: number
  shade: number
}

export interface FlyMedia {
  draw: (o: FlyDrawOpts) => void
  destroy: () => void
}

export function createFlyMedia(canvas: HTMLCanvasElement, src: string): FlyMedia | null {
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

  const uRect = gl.getUniformLocation(prog, 'uRect')
  const uViewport = gl.getUniformLocation(prog, 'uViewport')
  const uAmp = gl.getUniformLocation(prog, 'uAmp')
  const uTime = gl.getUniformLocation(prog, 'uTime')
  const uRadius = gl.getUniformLocation(prog, 'uRadius')
  const uShade = gl.getUniformLocation(prog, 'uShade')
  const uUvScale = gl.getUniformLocation(prog, 'uUvScale')

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

  // texture
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  let imgAspect = 16 / 9
  let texLoaded = false
  let destroyed = false
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    if (destroyed) return
    imgAspect = img.naturalWidth / img.naturalHeight
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    texLoaded = true
  }
  img.src = src

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
    if (!texLoaded) return

    const rectAspect = o.w / Math.max(o.h, 1)
    const uvScale: [number, number] =
      rectAspect > imgAspect ? [1, imgAspect / rectAspect] : [rectAspect / imgAspect, 1]

    gl.uniform4f(uRect, o.x, o.y, o.w, o.h)
    gl.uniform2f(uViewport, window.innerWidth, window.innerHeight)
    gl.uniform1f(uAmp, o.amp)
    gl.uniform1f(uTime, o.time)
    gl.uniform1f(uRadius, Math.max(0, Math.min(o.radius, Math.min(o.w, o.h) / 2)))
    gl.uniform1f(uShade, o.shade)
    gl.uniform2f(uUvScale, uvScale[0], uvScale[1])

    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0)
  }

  const destroy = () => {
    destroyed = true
    window.removeEventListener('resize', resize)
    gl.deleteBuffer(vbo)
    gl.deleteBuffer(ibo)
    gl.deleteTexture(tex)
    gl.deleteProgram(prog)
  }

  return { draw, destroy }
}
