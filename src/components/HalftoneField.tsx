'use client';

import { useEffect, useRef } from 'react';

/**
 * Live halftone / ordered-dither renderer (WebGL2).
 *
 * A source (the wave artwork or a procedural drawing) is averaged per cell through
 * its mipmaps and reprinted as clean rotated halftone dots. The pointer opens a
 * 1-bit Bayer "loupe" and pushes ripples through the dot field; scroll coarsens
 * the screen. Without WebGL2 the server-rendered fallback underneath stays visible.
 */

type Variant = 'wave' | 'tide';

interface Config {
  source: string;
  focus: [number, number];
  focusNarrow?: [number, number];
  paper: string;
  ink: string;
  inkDeep: string;
  paperLum: number;
  inkLum: number;
  cell: number;
  cellNarrow?: number;
  angle: number;
  lodBias: number;
  warp: number;
  lens: number;
  travel?: boolean;
  zoomOrigin?: [number, number];
  autoRipple?: boolean;
  grain?: number;
  dot?: number;
}

const VARIANTS: Record<Variant, Config> = {
  wave: {
    source: '/indigo-curl.webp',
    focus: [0.5, 0.43],
    focusNarrow: [0.68, 0.5],
    paper: '#f6e5c4',
    ink: '#3f6fae',
    inkDeep: '#0f2b55',
    paperLum: 0.88,
    inkLum: 0.12,
    cell: 6.5,
    cellNarrow: 5,
    angle: 0.42,
    lodBias: 0.8,
    dot: 1.38,
    warp: 3.2,
    lens: 150,
    travel: true,
    zoomOrigin: [0.68, 0.45],
    autoRipple: true,
    grain: 0.035,
  },
  tide: {
    source: '/indigo-curl.webp',
    focus: [0.72, 0.4],
    focusNarrow: [0.72, 0.42],
    paper: '#0d2341',
    ink: '#5d86bd',
    inkDeep: '#f4e6c8',
    paperLum: 0.86,
    inkLum: 0.2,
    cell: 7,
    cellNarrow: 5.5,
    angle: 0.42,
    lodBias: 1,
    dot: 1.12,
    warp: 2.4,
    lens: 130,
    autoRipple: true,
    grain: 0.02,
  },
};

const VERT = `#version 300 es
void main(){
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec4 uMap;
uniform float uLod;
uniform float uCell;
uniform float uTime;
uniform vec3 uPointer;
uniform vec4 uRipples[8];
uniform float uReveal;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uInkDeep;
uniform float uPaperLum;
uniform float uInkLum;
uniform float uLens;
uniform float uAngle;
uniform float uWarp;
uniform float uDpr;
uniform float uGrain;
uniform float uDither;
uniform float uDot;
out vec4 outColor;

float bayer2(vec2 a){ a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a){ return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a){ return bayer4(0.5 * a) * 0.25 + bayer2(a); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

vec2 field(vec2 p, out vec2 foam){
  vec2 d = vec2(0.0);
  foam = vec2(0.0);
  for (int i = 0; i < 8; i++) {
    vec4 r = uRipples[i];
    if (r.w <= 0.0) continue;
    vec2 v = p - r.xy;
    float dist = length(v) + 0.001;
    float k = (dist - r.z * 430.0 * uDpr) / (52.0 * uDpr);
    float amp = r.w * exp(-r.z * 1.25) * exp(-k * k);
    float s = sin(k * 3.14159);
    d += v / dist * s * amp * 15.0 * uDpr;
    foam += vec2(amp * max(s, 0.0), amp * max(-s, 0.0));
  }
  if (uPointer.z > 0.001) {
    vec2 v = p - uPointer.xy;
    float f = uPointer.z * smoothstep(uLens, 0.0, length(v));
    d -= v * f * 0.22;
  }
  vec2 s = p / uDpr;
  d += uWarp * uDpr * vec2(
    sin(s.y * 0.0065 + uTime * 0.7) + 0.5 * sin(s.x * 0.011 - uTime * 0.9),
    cos(s.x * 0.0052 + uTime * 0.55) + 0.4 * sin(s.y * 0.009 + uTime * 0.8)
  );
  return d;
}

float toneAt(vec2 p, float lod){
  vec3 c = textureLod(uTex, p * uMap.xy + uMap.zw, lod).rgb;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  return clamp((uPaperLum - l) / (uPaperLum - uInkLum), 0.0, 1.0);
}

void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float ca = cos(uAngle), sa = sin(uAngle);
  mat2 rot = mat2(ca, sa, -sa, ca);
  vec2 q = rot * p;
  vec2 cell = floor(q / uCell);
  vec2 cq = (cell + 0.5) * uCell;
  vec2 cp = transpose(rot) * cq;

  vec2 foam;
  vec2 disp = field(cp, foam);
  float tone = toneAt(cp + disp, uLod);
  tone = clamp(tone + min(foam.x, 1.0) * 0.6 * (1.0 - tone) - foam.y * 0.5 * tone, 0.0, 1.0);

  float thr = (cp.x / uRes.x) * 0.72 + hash(cell) * 0.28;
  float gate = smoothstep(thr, thr + 0.12, uReveal * 1.14);

  float r = uCell * 0.5 * sqrt(tone) * uDot * gate;
  float aa = 0.7 * uDpr;
  float cov = smoothstep(r + aa, r - aa, length(q - cq));

  vec3 paper = uPaper + (hash(floor(p / uDpr)) - 0.5) * uGrain;
  vec3 ink = mix(uInk, uInkDeep, smoothstep(0.15, 0.95, tone));
  vec3 col = mix(paper, ink, cov);

  float lens = uPointer.z * smoothstep(uLens, uLens * 0.62, length(p - uPointer.xy));
  float dz = max(lens, uDither);
  if (dz > 0.001) {
    float px = 2.0 * uDpr;
    vec2 pc = (floor(p / px) + 0.5) * px;
    vec2 f2;
    vec2 d2 = field(pc, f2);
    float t2 = toneAt(pc + d2, uLod - 1.0);
    t2 = clamp(t2 + min(f2.x, 1.0) * 0.6 * (1.0 - t2) - f2.y * 0.5 * t2, 0.0, 1.0);
    float b = bayer8(floor(p / px));
    float on = step(b + 0.01, t2 * gate);
    float off = step(b + 0.01, clamp(toneAt(pc + d2 + vec2(3.0, -2.0) * uDpr, uLod - 1.0), 0.0, 1.0) * gate);
    vec3 riso = mix(paper, uInk, off * 0.55);
    vec3 dcol = mix(riso, uInkDeep, on);
    col = mix(col, dcol, dz);
    float ring = smoothstep(1.6 * uDpr, 0.0, abs(length(p - uPointer.xy) - uLens * 0.81)) * uPointer.z;
    col = mix(col, uInkDeep, ring * 0.5);
  }
  outColor = vec4(col, 1.0);
}`;

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn('[HalftoneField]', gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

async function loadSource(cfg: Config): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = 'async';
  img.src = cfg.source;
  await img.decode();
  return img;
}

export function HalftoneField({ variant, className }: { variant: Variant; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const cfg = VARIANTS[variant];
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: false });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const L = {
      res: u('uRes'), map: u('uMap'), lod: u('uLod'), cell: u('uCell'), time: u('uTime'),
      pointer: u('uPointer'), ripples: u('uRipples'), reveal: u('uReveal'), paper: u('uPaper'),
      ink: u('uInk'), inkDeep: u('uInkDeep'), paperLum: u('uPaperLum'), inkLum: u('uInkLum'),
      lens: u('uLens'), angle: u('uAngle'), warp: u('uWarp'), dpr: u('uDpr'), grain: u('uGrain'),
      dither: u('uDither'), dot: u('uDot'),
    };
    gl.uniform3fv(L.paper, rgb(cfg.paper));
    gl.uniform3fv(L.ink, rgb(cfg.ink));
    gl.uniform3fv(L.inkDeep, rgb(cfg.inkDeep));
    gl.uniform1f(L.paperLum, cfg.paperLum);
    gl.uniform1f(L.inkLum, cfg.inkLum);
    gl.uniform1f(L.angle, cfg.angle);
    gl.uniform1f(L.grain, cfg.grain ?? 0.02);
    gl.uniform1f(L.dot, cfg.dot ?? 1.46);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const opening = cfg.travel ? (canvas.closest('.landing-opening') as HTMLElement | null) : null;

    let tex: WebGLTexture | null = null;
    let texW = 1;
    let texH = 1;
    let w = 1;
    let h = 1;
    let dpr = 1;
    let visible = false;
    let frame = 0;
    let disposed = false;
    let start = 0;
    let lastAuto = 0;
    const pointer = { x: -9999, y: -9999, z: 0, target: 0, lastX: -9999, lastY: -9999, lastMove: 0 };
    const ripples: { x: number; y: number; t: number; s: number }[] = [];
    const rippleData = new Float32Array(32);

    const addRipple = (x: number, y: number, s: number) => {
      ripples.push({ x, y, t: performance.now(), s });
      if (ripples.length > 8) ripples.shift();
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };

    const render = (now: number) => {
      if (!tex) return;
      const narrow = window.innerWidth < 700;
      const travel = opening ? Math.min(1, Math.max(0, parseFloat(opening.style.getPropertyValue('--travel')) || 0)) : 0;
      const zoom = 1 + 0.18 * travel;
      const [fx, fy] = narrow && cfg.focusNarrow ? cfg.focusNarrow : cfg.focus;
      const s = Math.max(w / texW, h / texH);
      const dw = texW * s;
      const dh = texH * s;
      const offX = (w - dw) * fx;
      const offY = (h - dh) * fy;
      const [ox, oy] = cfg.zoomOrigin ?? [0.5, 0.5];
      const oX = ox * w;
      const oY = oy * h;
      gl.uniform4f(L.map, 1 / (zoom * dw), 1 / (zoom * dh), (oX * (1 - 1 / zoom) - offX) / dw, (oY * (1 - 1 / zoom) - offY) / dh);
      const still = reduced.matches;
      if (!start && visible) start = now;
      const t = still ? 0 : (now - start) / 1000;
      const rv = still ? 1 : Math.min(1, t / 1.8);
      const resolve = 1 + 2.4 * Math.pow(1 - rv, 3);
      const cell = (narrow && cfg.cellNarrow ? cfg.cellNarrow : cfg.cell) * dpr * (1 + 1.3 * travel) * resolve;
      gl.uniform1f(L.cell, cell);
      gl.uniform1f(L.lod, Math.log2(Math.max(1, (cell * texW) / (dw * zoom))) + cfg.lodBias);
      gl.uniform2f(L.res, w, h);
      gl.uniform1f(L.dpr, dpr);
      gl.uniform1f(L.lens, cfg.lens * dpr);
      gl.uniform1f(L.dither, Math.max(0, travel - 0.55) * 1.6);

      gl.uniform1f(L.time, t);
      gl.uniform1f(L.warp, still ? 0 : cfg.warp);
      gl.uniform1f(L.reveal, 1);

      pointer.z += (pointer.target - pointer.z) * 0.12;
      gl.uniform3f(L.pointer, pointer.x * dpr, pointer.y * dpr, still ? 0 : pointer.z);

      if (!still && cfg.autoRipple && now - pointer.lastMove > 3500 && now - lastAuto > 3800 && t > 1.6) {
        lastAuto = now;
        addRipple(canvas.clientWidth * (0.3 + Math.random() * 0.5), canvas.clientHeight * (0.25 + Math.random() * 0.4), 0.55);
      }
      rippleData.fill(0);
      let j = 0;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const age = (now - ripples[i].t) / 1000;
        if (age > 3.2 || still) { ripples.splice(i, 1); continue; }
        rippleData.set([ripples[i].x * dpr, ripples[i].y * dpr, age, ripples[i].s], j * 4);
        j++;
      }
      gl.uniform4fv(L.ripples, rippleData);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.dataset.live = 'true';
    };

    const loop = (now: number) => {
      frame = 0;
      render(now);
      if (visible && !reduced.matches && !disposed) frame = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (frame || disposed) return;
      frame = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      if (!inside) { pointer.target = 0; return; }
      pointer.x = x;
      pointer.y = y;
      pointer.lastMove = performance.now();
      pointer.target = e.pointerType === 'mouse' && fine.matches ? 1 : 0;
      const dx = x - pointer.lastX;
      const dy = y - pointer.lastY;
      if (dx * dx + dy * dy > 120 * 120) {
        pointer.lastX = x;
        pointer.lastY = y;
        addRipple(x, y, 0.45);
      }
    };
    const onDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return;
      pointer.lastMove = performance.now();
      addRipple(x, y, 2.4);
      window.setTimeout(() => addRipple(x, y, 1.3), 220);
      kick();
    };
    const onLeave = () => { pointer.target = 0; };

    const ro = new ResizeObserver(() => { resize(); kick(); });
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    }, { rootMargin: '80px' });
    const onScroll = () => { if (reduced.matches && opening) kick(); };

    loadSource(cfg).then((src) => {
      if (disposed) return;
      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      gl.generateMipmap(gl.TEXTURE_2D);
      texW = src.naturalWidth;
      texH = src.naturalHeight;
      resize();
      ro.observe(canvas);
      io.observe(canvas);
      kick();
    }).catch(() => { /* fallback artwork stays visible */ });

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    reduced.addEventListener('change', kick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      reduced.removeEventListener('change', kick);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [variant]);

  return <canvas ref={ref} className={`halftone-field${className ? ' ' + className : ''}`} aria-hidden="true" />;
}
