'use client';

import { useEffect, useRef } from 'react';

/**
 * The halftone wave as real dots (WebGL2 points).
 *
 * Dot sizes come from `public/indigo-bands.png`, the six ink layers of
 * `indigo-curl.svg` flattened by scripts/bake-wave-bands.mjs, so the print
 * matches the traced artwork. Every dot is its own particle:
 * - the pointer knocks dots loose; a copy falls under gravity and fades while
 *   the dot re-inks in place, so the print never looks erased,
 * - spray dots keep dropping off the crest while the page is idle, and
 *   scrolling shakes loose a shower of them from all along the crest,
 * - crest dots twinkle: each swells, shrinks and briefly blinks out on its own beat,
 * - scrolling lets the wave go, dot by dot, and reverses on the way back up.
 * Without WebGL2 the server-rendered fallback underneath stays visible.
 */

type Variant = 'wave' | 'tide';

interface Config {
  focus: [number, number];
  focusNarrow?: [number, number];
  paper: string;
  ramp: string[];
  cell: number;
  cellNarrow: number;
  travel?: boolean;
  spray: number;
}

const BANDS = '/indigo-bands.png';
const ANGLE = 0.42;

const VARIANTS: Record<Variant, Config> = {
  wave: {
    focus: [0.5, 0.43],
    focusNarrow: [0.68, 0.5],
    paper: '#f6e5c4',
    // The six ink colours of indigo-curl.svg, light to deep.
    ramp: ['#c2ccd0', '#94acc0', '#6889ac', '#3f6694', '#20497d', '#0b346a'],
    cell: 6,
    cellNarrow: 5,
    travel: true,
    spray: 26,
  },
  tide: {
    focus: [0.72, 0.4],
    focusNarrow: [0.72, 0.42],
    paper: '#0d2341',
    ramp: ['#22406b', '#36578a', '#5577a8', '#86a2c8', '#c4cfdc', '#f2e4c6'],
    cell: 6.5,
    cellNarrow: 5.5,
    spray: 14,
  },
};

const VERT = `#version 300 es
in vec2 aHome;
in vec3 aStat;     // radius (device px), tone 0..1, random 0..1
in vec4 aDyn;      // offset x, offset y, scale, alpha
uniform vec2 uRes;
uniform float uTime;
uniform float uTravel;
uniform float uMotion;
uniform float uDpr;
out float vR;
out float vTone;
out float vAlpha;
void main(){
  vec2 p = aHome + aDyn.xy;
  // A slow swell passes through the water; deep ink barely moves.
  p.y += sin(aHome.x / uDpr * 0.006 - uTime * 0.9 + aHome.y / uDpr * 0.002) * 1.6 * uDpr * uMotion * aStat.y;
  // Scrolling lets dots go one by one; they drop and drift.
  // The first part of the scroll only showers spray off the crest; the body lets go after.
  float f = max(0.0, (uTravel - 0.3) * 1.9 - aStat.z * 0.9);
  p.y += f * f * uRes.y * 0.9;
  p.x += f * (aStat.z - 0.5) * 60.0 * uDpr;
  float r = aStat.x * aDyn.z;
  // Crest dots breathe and now and then blink out, each on its own beat.
  float crest = step(0.05, aStat.y) * step(aStat.y, 0.7) * (1.0 - smoothstep(uRes.y * 0.45, uRes.y * 0.62, aHome.y)) * uMotion;
  float beat = 0.5 + 0.5 * sin(uTime * (1.4 + 2.6 * aStat.z) + aStat.z * 43.0);
  float blink = smoothstep(0.0, 0.12, fract(uTime * (0.22 + 0.25 * aStat.z) + aStat.z * 17.0));
  r *= mix(1.0, (0.4 + 1.05 * beat * beat) * blink, crest);
  vR = r;
  vTone = aStat.y;
  vAlpha = aDyn.w * (1.0 - smoothstep(0.15, 0.7, f));
  gl_PointSize = r * 2.0 + 2.0;
  vec2 clip = p / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in float vR;
in float vTone;
in float vAlpha;
uniform vec3 uRamp[6];
out vec4 outColor;
void main(){
  float d = length(gl_PointCoord * 2.0 - 1.0) * (vR + 1.0);
  float a = clamp(vR + 0.5 - d, 0.0, 1.0) * vAlpha;
  if (a <= 0.0) discard;
  float x = clamp(vTone * 5.0, 0.0, 5.0);
  int i = int(min(floor(x), 4.0));
  vec3 c = mix(uRamp[i], uRamp[i + 1], x - float(i));
  outColor = vec4(c * a, a);
}`;

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function link(gl: WebGL2RenderingContext) {
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[HalftoneField]', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const vs = shader(gl.VERTEX_SHADER, VERT);
  const fs = shader(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  return gl.getProgramParameter(prog, gl.LINK_STATUS) ? prog : null;
}

/** Downscale the band map step by step so each texel averages one dot cell. */
function toneSampler(img: HTMLImageElement, size: number) {
  let src: CanvasImageSource = img;
  let s = img.naturalWidth;
  while (s / 2 > size) {
    s = Math.round(s / 2);
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const x = c.getContext('2d')!;
    x.imageSmoothingQuality = 'high';
    x.drawImage(src, 0, 0, s, s);
    src = c;
  }
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const x = c.getContext('2d', { willReadFrequently: true })!;
  x.imageSmoothingQuality = 'high';
  x.drawImage(src, 0, 0, size, size);
  const data = x.getImageData(0, 0, size, size).data;
  return (u: number, v: number) => {
    if (u < 0 || v < 0 || u >= 1 || v >= 1) return 0;
    const fx = u * size - 0.5;
    const fy = v * size - 0.5;
    const x0 = Math.max(0, Math.floor(fx));
    const y0 = Math.max(0, Math.floor(fy));
    const x1 = Math.min(size - 1, x0 + 1);
    const y1 = Math.min(size - 1, y0 + 1);
    const tx = Math.min(1, Math.max(0, fx - x0));
    const ty = Math.min(1, Math.max(0, fy - y0));
    const at = (xx: number, yy: number) => data[(yy * size + xx) * 4] / 255;
    return (at(x0, y0) * (1 - tx) + at(x1, y0) * tx) * (1 - ty) + (at(x0, y1) * (1 - tx) + at(x1, y1) * tx) * ty;
  };
}

export function HalftoneField({ variant, className }: { variant: Variant; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const cfg = VARIANTS[variant];
    const fail = () => { canvas.dataset.failed = 'true'; };
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: true });
    if (!gl) { fail(); return; }
    const prog = link(gl);
    if (!prog) { fail(); return; }
    gl.useProgram(prog);
    const U = {
      res: gl.getUniformLocation(prog, 'uRes'), time: gl.getUniformLocation(prog, 'uTime'),
      travel: gl.getUniformLocation(prog, 'uTravel'), motion: gl.getUniformLocation(prog, 'uMotion'),
      dpr: gl.getUniformLocation(prog, 'uDpr'), ramp: gl.getUniformLocation(prog, 'uRamp'),
    };
    gl.uniform3fv(U.ramp, cfg.ramp.flatMap(rgb));
    const paper = rgb(cfg.paper);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const homeBuf = gl.createBuffer();
    const statBuf = gl.createBuffer();
    const dynBuf = gl.createBuffer();
    const bind = (buf: WebGLBuffer | null, name: string, size: number) => {
      const loc = gl.getAttribLocation(prog, name);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };
    bind(homeBuf, 'aHome', 2);
    bind(statBuf, 'aStat', 3);
    bind(dynBuf, 'aDyn', 4);

    // Falling droplets live in their own small pool, drawn after the print.
    const POOL = 4000;
    const poolVao = gl.createVertexArray();
    gl.bindVertexArray(poolVao);
    const pHomeBuf = gl.createBuffer();
    const pStatBuf = gl.createBuffer();
    const pDynBuf = gl.createBuffer();
    bind(pHomeBuf, 'aHome', 2);
    bind(pStatBuf, 'aStat', 3);
    bind(pDynBuf, 'aDyn', 4);
    const pHome = new Float32Array(POOL * 2);
    const pStat = new Float32Array(POOL * 3);
    const pDyn = new Float32Array(POOL * 4);
    const pVel = new Float32Array(POOL * 2);
    const pAge = new Float32Array(POOL);
    let m = 0;
    for (const [buf, arr] of [[pHomeBuf, pHome], [pStatBuf, pStat], [pDynBuf, pDyn]] as const) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, arr.byteLength, gl.DYNAMIC_DRAW);
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const opening = cfg.travel ? (canvas.closest('.landing-opening') as HTMLElement | null) : null;

    let sample: ((u: number, v: number) => number) | null = null;
    let w = 1;
    let h = 1;
    let dpr = 1;
    let n = 0;
    let home = new Float32Array(0);
    let stat = new Float32Array(0);
    let dyn = new Float32Array(0);
    let age = new Float32Array(0);
    let mode = new Uint8Array(0);       // 0 resting, 2 re-inking
    let active: number[] = [];
    let spray: number[] = [];
    let crestDots: number[] = [];
    let buckets = new Map<number, number[]>();
    let bucketSize = 40;
    let visible = false;
    let frame = 0;
    let disposed = false;
    let start = 0;
    let last = 0;
    let lastInput = -1e9;
    let sprayDebt = 0;
    let dirty = true;
    const ptr = { x: 0, y: 0, vx: 0, vy: 0, t: 0 };
    const interacting = () => performance.now() - lastInput < 3000;

    const build = () => {
      if (!sample) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      const narrow = window.innerWidth < 700;
      const [fx, fy] = narrow && cfg.focusNarrow ? cfg.focusNarrow : cfg.focus;
      const side = Math.max(w, h);
      const offX = (w - side) * fx;
      const offY = (h - side) * fy;
      const cell = (narrow ? cfg.cellNarrow : cfg.cell) * dpr;
      const ca = Math.cos(ANGLE);
      const sa = Math.sin(ANGLE);
      const diag = Math.hypot(w, h);
      const pos: number[] = [];
      const st: number[] = [];
      for (let gy = -diag; gy < diag; gy += cell) {
        for (let gx = -diag; gx < diag; gx += cell) {
          const x = w / 2 + ca * gx - sa * gy;
          const y = h / 2 + sa * gx + ca * gy;
          if (x < -cell || y < -cell || x > w + cell || y > h + cell) continue;
          const tone = sample((x - offX) / side, (y - offY) / side);
          if (tone < 0.04) continue;
          pos.push(x, y);
          st.push(cell * 0.5 * Math.sqrt(tone) * 1.38, tone, Math.random());
        }
      }
      n = pos.length / 2;
      home = new Float32Array(pos);
      stat = new Float32Array(st);
      dyn = new Float32Array(n * 4);
      for (let i = 0; i < n; i++) { dyn[i * 4 + 2] = 1; dyn[i * 4 + 3] = 1; }
      age = new Float32Array(n);
      mode = new Uint8Array(n);
      active = [];
      spray = [];
      crestDots = [];
      m = 0;
      buckets = new Map();
      bucketSize = 44 * dpr;
      for (let i = 0; i < n; i++) {
        const x = home[i * 2];
        const y = home[i * 2 + 1];
        const key = Math.floor(x / bucketSize) * 4096 + Math.floor(y / bucketSize);
        let b = buckets.get(key);
        if (!b) buckets.set(key, (b = []));
        b.push(i);
        // Light foam in the upper part of the wave sheds spray.
        const t = stat[i * 3 + 1];
        if (t > 0.05 && t < 0.5 && y < h * 0.55) spray.push(i);
        // Mid-tone crest dots: dark enough to read when they fall on a scroll.
        if (t > 0.3 && t < 0.8 && y < h * 0.5) crestDots.push(i);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, homeBuf);
      gl.bufferData(gl.ARRAY_BUFFER, home, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, statBuf);
      gl.bufferData(gl.ARRAY_BUFFER, stat, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf);
      gl.bufferData(gl.ARRAY_BUFFER, dyn, gl.DYNAMIC_DRAW);
      dirty = false;
    };

    // The dot sheds a falling copy and starts re-inking where it was.
    const loosen = (i: number, vx: number, vy: number) => {
      if (mode[i] !== 0 || m >= POOL) return;
      mode[i] = 2;
      age[i] = 0;
      dyn[i * 4 + 2] = 0;
      active.push(i);
      pHome[m * 2] = home[i * 2];
      pHome[m * 2 + 1] = home[i * 2 + 1];
      pStat[m * 3] = stat[i * 3];
      pStat[m * 3 + 1] = stat[i * 3 + 1];
      pStat[m * 3 + 2] = 0;
      pDyn[m * 4] = 0;
      pDyn[m * 4 + 1] = 0;
      pDyn[m * 4 + 2] = 1;
      pDyn[m * 4 + 3] = 1;
      pVel[m * 2] = vx;
      pVel[m * 2 + 1] = vy;
      pAge[m] = 0;
      m++;
    };

    const knock = (cx: number, cy: number, radius: number, pvx: number, pvy: number, force: number) => {
      const r2 = radius * radius;
      const b0x = Math.floor((cx - radius) / bucketSize);
      const b1x = Math.floor((cx + radius) / bucketSize);
      const b0y = Math.floor((cy - radius) / bucketSize);
      const b1y = Math.floor((cy + radius) / bucketSize);
      for (let bx = b0x; bx <= b1x; bx++) {
        for (let by = b0y; by <= b1y; by++) {
          const b = buckets.get(bx * 4096 + by);
          if (!b) continue;
          for (const i of b) {
            if (mode[i] !== 0) continue;
            const dx = home[i * 2] - cx;
            const dy = home[i * 2 + 1] - cy;
            const d2 = dx * dx + dy * dy;
            if (d2 > r2) continue;
            const fall = 1 - Math.sqrt(d2) / radius;
            if (Math.random() > fall * force) continue;
            const d = Math.sqrt(d2) + 1;
            loosen(i,
              pvx * 0.35 + (dx / d) * (40 + Math.random() * 90) * dpr * force,
              pvy * 0.35 - (20 + Math.random() * 60) * dpr * force);
          }
        }
      }
    };

    const step = (dt: number) => {
      const still = reduced.matches;
      if (!still && cfg.spray && spray.length) {
        sprayDebt += cfg.spray * dt;
        while (sprayDebt >= 1) {
          sprayDebt -= 1;
          const pool = crestDots.length ? crestDots : spray;
          const i = pool[(Math.random() * pool.length) | 0];
          if (mode[i] === 0) loosen(i, (-10 - Math.random() * 30) * dpr, (Math.random() * 15) * dpr);
        }
      }
      const g = 650 * dpr;
      for (let j = 0; j < m; j++) {
        pAge[j] += dt;
        const life = pAge[j] / 1.8;
        if (life >= 1) {
          // Swap-remove the finished droplet.
          m--;
          pHome.copyWithin(j * 2, m * 2, m * 2 + 2);
          pStat.copyWithin(j * 3, m * 3, m * 3 + 3);
          pDyn.copyWithin(j * 4, m * 4, m * 4 + 4);
          pVel.copyWithin(j * 2, m * 2, m * 2 + 2);
          pAge[j] = pAge[m];
          j--;
          continue;
        }
        pVel[j * 2] *= 0.985;
        pVel[j * 2 + 1] += g * dt;
        pDyn[j * 4] += pVel[j * 2] * dt;
        pDyn[j * 4 + 1] += pVel[j * 2 + 1] * dt;
        pDyn[j * 4 + 2] = 1 - life * 0.4;
        pDyn[j * 4 + 3] = 1 - life * life;
      }
      if (!active.length) return m > 0;
      const next: number[] = [];
      for (const i of active) {
        // Re-ink in place, like the press laying the dot down again.
        age[i] += dt;
        const k = Math.min(1, Math.max(0, (age[i] - 0.15) / 0.75));
        dyn[i * 4 + 2] = 1 - Math.pow(1 - k, 3);
        if (k >= 1) { mode[i] = 0; dyn[i * 4 + 2] = 1; }
        else next.push(i);
      }
      active = next;
      return true;
    };

    const render = (now: number) => {
      if (!sample) return;
      if (dirty) build();
      const dt = Math.min(0.04, last ? (now - last) / 1000 : 0.016);
      last = now;
      if (!start && visible) start = now;
      const still = reduced.matches;
      if (step(dt) || active.length) {
        gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, dyn);
      }
      if (m) {
        gl.bindBuffer(gl.ARRAY_BUFFER, pHomeBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, pHome, 0, m * 2);
        gl.bindBuffer(gl.ARRAY_BUFFER, pStatBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, pStat, 0, m * 3);
        gl.bindBuffer(gl.ARRAY_BUFFER, pDynBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, pDyn, 0, m * 4);
      }
      const travel = opening && !still ? Math.min(1, Math.max(0, parseFloat(opening.style.getPropertyValue('--travel')) || 0)) : 0;
      gl.clearColor(paper[0], paper[1], paper[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.time, still ? 0 : (now - start) / 1000);
      gl.uniform1f(U.travel, travel);
      gl.uniform1f(U.motion, still ? 0 : 1);
      gl.uniform1f(U.dpr, dpr);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.POINTS, 0, n);
      if (m) {
        gl.bindVertexArray(poolVao);
        gl.drawArrays(gl.POINTS, 0, m);
      }
      canvas.dataset.live = 'true';
    };

    const loop = (now: number) => {
      frame = 0;
      render(now);
      if (visible && !disposed && (!reduced.matches || interacting() || active.length || m)) frame = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (frame || disposed) return;
      frame = requestAnimationFrame(loop);
    };

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      return x >= 0 && y >= 0 && x <= r.width && y <= r.height ? [x * dpr, y * dpr] : null;
    };
    const onMove = (e: PointerEvent) => {
      const at = local(e);
      if (!at || !n) return;
      const now = performance.now();
      const dt = Math.max(0.008, (now - ptr.t) / 1000);
      if (now - ptr.t < 100) {
        ptr.vx += ((at[0] - ptr.x) / dt - ptr.vx) * 0.4;
        ptr.vy += ((at[1] - ptr.y) / dt - ptr.vy) * 0.4;
      } else { ptr.vx = 0; ptr.vy = 0; }
      ptr.x = at[0]; ptr.y = at[1]; ptr.t = now;
      const speed = Math.hypot(ptr.vx, ptr.vy) / dpr;
      if (speed > 60) knock(at[0], at[1], 30 * dpr, ptr.vx, ptr.vy, Math.min(0.7, speed / 1400));
      lastInput = now;
      kick();
    };
    const onDown = (e: PointerEvent) => {
      const at = local(e);
      if (!at || !n) return;
      knock(at[0], at[1], 90 * dpr, 0, 0, 1);
      lastInput = performance.now();
      kick();
    };

    const ro = new ResizeObserver(() => { dirty = true; kick(); });
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    }, { rootMargin: '80px' });
    // Scrolling shakes spray loose from all along the crest, more for a faster scroll.
    let lastScroll = window.scrollY;
    let shed = 0;
    const onScroll = () => {
      const dy = Math.abs(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      if (visible && crestDots.length && !reduced.matches) {
        shed += Math.min(dy, 200) * 3;
        while (shed >= 1) {
          shed -= 1;
          const i = crestDots[(Math.random() * crestDots.length) | 0];
          if (mode[i] === 0) loosen(i, (Math.random() - 0.5) * 60 * dpr, (Math.random() * 40) * dpr);
        }
        lastInput = performance.now();
      }
      kick();
    };

    const img = new Image();
    img.decoding = 'async';
    img.src = BANDS;
    img.decode().then(() => {
      if (disposed) return;
      // About one texel per dot cell at typical sizes keeps the halftone free of moiré.
      sample = toneSampler(img, 300);
      dirty = true;
      ro.observe(canvas);
      io.observe(canvas);
      kick();
    }).catch(fail);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    reduced.addEventListener('change', kick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', onScroll);
      reduced.removeEventListener('change', kick);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [variant]);

  return <canvas ref={ref} className={`halftone-field${className ? ' ' + className : ''}`} aria-hidden="true" />;
}
