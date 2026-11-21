"use client";

import { useEffect, useRef } from "react";

/**
 * WaveHorizon — one thin living line below the hero.
 * A horizontal luminance slice of the wave artwork becomes the line's
 * displacement; a slow traveling swell keeps it breathing. Dithered ink
 * dots, wave-blue palette, paper background. Degrades to a clean 2px rule.
 */

const vertex = `#version 300 es
in vec2 a_position;
void main() { gl_Position = vec4(a_position, 0., 1.); }
`;

const fragment = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_dpr, u_time, u_amp, u_pointer, u_dark, u_swell;
uniform vec3 u_accent;
out vec4 color;
float lum(vec3 c) { return dot(c, vec3(.2126,.7152,.0722)); }
float bayer4(ivec2 p) {
  const float b[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
  return (b[(p.y & 3)*4+(p.x & 3)]+.5)/16.;
}
float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
void main() {
  vec2 px = gl_FragCoord.xy/u_dpr;
  float w = u_resolution.x/u_dpr;
  float h = u_resolution.y/u_dpr;
  float u = px.x/w;
  // The curl row of the artwork drives the line's silhouette.
  float l = lum(textureLod(u_image, vec2(u,.42), 1.).rgb);
  // Pointer proximity lifts the swell locally, damped in the RAF loop.
  float pdx = (px.x-u_pointer)/190.;
  float near = exp(-pdx*pdx);
  float amp = u_amp*u_swell*(1.+.9*near);
  float mid = h*.5;
  float y = mid
    + (l-.5)*amp*1.7
    + sin(u*23.-u_time*.7)*amp*.3
    + sin(u*7.1+u_time*.21)*amp*.18;
  float d = abs(px.y-y);
  float aa = fwidth(d)+.5;
  // The stroke, carved into ordered dots by the Bayer screen.
  float ink = 1.-smoothstep(1.35,1.35+aa,d);
  float x = bayer4(ivec2(floor(px/3.)));
  ink *= smoothstep(x, x+.25, ink*.85+.12);
  // Faint echo above the crest: memory of the foam.
  float echo = 1.-smoothstep(.6,.6+aa,abs(px.y-(y-amp*.55)));
  echo *= step(.82,bayer4(ivec2(floor(px/3.))+7))*.35;
  ink = max(ink,echo);
  // Paper-tooth grain so the line never looks vector-clean.
  ink = clamp(ink+(hash(px)-.5)*.07,0.,1.);
  vec3 inkCol = mix(vec3(.035,.18,.35), vec3(.05,.70,.78), u_dark);
  inkCol = mix(inkCol, u_accent, .12);
  // Context is premultiplied-alpha: rgb must carry the ink coverage.
  color = vec4(inkCol*ink, ink);
}
`;

export function WaveHorizon() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let dispose = () => {};
    const setup = () => {
      dispose();
      const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true });
      if (!gl) return; // CSS baseline rule remains — clean degradation.
      let raf = 0, dead = false, loaded = false, visible = false;
      let elapsed = 0, previous = 0, swell = 0, swellStart = -1;
      const shaders: WebGLShader[] = [];
      const program = gl.createProgram()!;
      const buffer = gl.createBuffer();
      const texture = gl.createTexture();
      const cleanupGL = () => {
        gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program);
        shaders.forEach(s => gl.deleteShader(s));
      };
      try {
        for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
          const shader = gl.createShader(type)!; shaders.push(shader);
          gl.shaderSource(shader, source); gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Shader compile failed");
          gl.attachShader(program, shader);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Horizon link failed");
      } catch (error) { console.warn("Wave horizon: using baseline rule", error); cleanupGL(); return; }
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const uniforms = Object.fromEntries(
        ["resolution","dpr","time","amp","pointer","dark","swell","accent"].map(n => [n, gl.getUniformLocation(program, `u_${n}`)])
      );
      let dpr = 1, amp = 8, pointer = -9999, pointerTarget = -9999;
      const draw = () => {
        gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
        gl.uniform1f(uniforms.dpr, dpr);
        gl.uniform1f(uniforms.time, motion.matches ? 0 : elapsed);
        gl.uniform1f(uniforms.amp, amp);
        gl.uniform1f(uniforms.pointer, pointer);
        gl.uniform1f(uniforms.swell, motion.matches ? 1 : swell);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      };
      const frame = (now: number) => {
        raf = 0;
        if (dead || !visible || !loaded || motion.matches) return;
        const dt = previous ? Math.min((now-previous)/1000, .05) : 0; previous = now; elapsed += dt;
        pointer += (pointerTarget-pointer)*(1-Math.exp(-dt*6));
        // One-shot swell when the band first scrolls into view, then settle.
        if (swellStart >= 0) swell = 1 + .85*Math.exp(-(elapsed-swellStart)*2.2);
        draw();
        raf = requestAnimationFrame(frame);
      };
      const start = () => { if (loaded && visible && !motion.matches && !raf) { previous = 0; raf = requestAnimationFrame(frame); } };
      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        dpr = Math.min(devicePixelRatio, 2);
        canvas.width = Math.max(1, Math.round(rect.width*dpr));
        canvas.height = Math.max(1, Math.round(rect.height*dpr));
        gl.viewport(0, 0, canvas.width, canvas.height);
        amp = rect.width < 768 ? 6 : 11;
        if (loaded) draw();
      };
      const palette = () => {
        const style = getComputedStyle(document.documentElement);
        const hex = style.getPropertyValue("--accent").trim().replace("#","");
        const full = hex.length === 3 ? hex.split("").map(c => c+c).join("") : hex;
        gl.uniform3f(uniforms.accent, parseInt(full.slice(0,2),16)/255, parseInt(full.slice(2,4),16)/255, parseInt(full.slice(4,6),16)/255);
        gl.uniform1f(uniforms.dark, document.documentElement.classList.contains("dark") ? 1 : 0);
        if (loaded) draw();
      };
      const image = new Image();
      image.onload = () => {
        if (dead) return;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        resize(); palette(); loaded = true; draw(); start();
      };
      image.src = "/textures/wave-spill.jpg";
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) { if (swellStart < 0 && !motion.matches) swellStart = elapsed; start(); }
        else { cancelAnimationFrame(raf); raf = 0; previous = 0; }
      }, { threshold: .1 });
      observer.observe(canvas);
      const sizing = new ResizeObserver(resize); sizing.observe(canvas);
      const theme = new MutationObserver(palette);
      theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class","data-theme"] });
      const move = (event: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        pointerTarget = event.clientX >= r.left-100 && event.clientX <= r.right+100 ? event.clientX-r.left : -9999;
      };
      const frozen = () => document.documentElement.dataset.motion === "paused";
      // Freeze check runs inside the loop cadence via a light interval-free path:
      // we piggyback on pointer/visibility events plus a rAF guard.
      let lastFrozen = false;
      const guard = () => {
        if (dead) return;
        const f = frozen();
        if (f !== lastFrozen) { lastFrozen = f; if (!f) start(); }
        if (!f) setTimeout(guard, 500);
        else { cancelAnimationFrame(raf); raf = 0; setTimeout(guard, 500); }
      };
      guard();
      const lost = () => { loaded = false; cancelAnimationFrame(raf); raf = 0; };
      window.addEventListener("pointermove", move, { passive: true });
      canvas.addEventListener("webglcontextlost", lost);
      resize(); palette();
      dispose = () => {
        dead = true; cancelAnimationFrame(raf); image.onload = null;
        observer.disconnect(); sizing.disconnect(); theme.disconnect();
        window.removeEventListener("pointermove", move);
        canvas.removeEventListener("webglcontextlost", lost);
        cleanupGL();
      };
    };
    setup();
    const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
    motionQuery.addEventListener("change", setup);
    return () => { dispose(); motionQuery.removeEventListener("change", setup); };
  }, []);

  // Full-bleed: the container is max-w-3xl px-5, so center a w-screen strip.
  // The 2px baseline rule always renders — WebGL failure degrades to it.
  return (
    <div aria-hidden="true" className="pointer-events-none relative h-14 max-md:h-10 left-1/2 -translate-x-1/2 w-screen">
      <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--border)]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
