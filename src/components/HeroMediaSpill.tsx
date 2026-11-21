"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const vertex = `#version 300 es
in vec2 a_position;
void main() { gl_Position = vec4(a_position, 0., 1.); }
`;
const fragment = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform vec2 u_resolution, u_pointer;
uniform float u_dpr, u_cell, u_time, u_progress, u_reveal, u_dark;
uniform vec3 u_fg, u_surface, u_accent;
out vec4 color;
float lum(vec3 c) { return dot(c, vec3(.2126,.7152,.0722)); }
float sampleL(vec2 p) { return lum(texture(u_image,p).rgb); }
// Ordered thresholds are locked to the grid, never to the clock.
float bayer(ivec2 p) {
  const float b[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
  return (b[(p.y & 3)*4+(p.x & 3)]+.5)/16.;
}
float line(vec2 p, vec2 a, vec2 b, float width) {
  vec2 v=b-a; float d=length(p-a-v*clamp(dot(p-a,v)/dot(v,v),0.,1.));
  return 1.-smoothstep(width,width+fwidth(d),d);
}
void main() {
  vec2 px=gl_FragCoord.xy/u_dpr;
  vec2 size=u_resolution/u_dpr;
  vec2 uv=px/size;
  float lens=1.-smoothstep(0.,120.,distance(px,u_pointer));
  // Stationary cells: pointer refines the stroke, not the grid origin.
  vec2 cell=floor(px/u_cell), q=fract(px/u_cell)-.5;
  vec2 sampleUV=(cell+.5)*u_cell/size;
  // A broad landscape wave, with only a subpixel tide at rest.
  sampleUV.y=1.-sampleUV.y;
  sampleUV+=vec2(sin(u_time*.13)*.0015,cos(u_time*.11)*.001);
  vec3 source=texture(u_image,sampleUV).rgb;
  vec2 e=vec2(.006,.009);
  // Eight-tap Sobel preserves the foam/curl tangent in the glyph field.
  float tl=sampleL(sampleUV+vec2(-e.x,-e.y)), tc=sampleL(sampleUV+vec2(0.,-e.y));
  float tr=sampleL(sampleUV+vec2(e.x,-e.y)), ml=sampleL(sampleUV-vec2(e.x,0.));
  float mr=sampleL(sampleUV+vec2(e.x,0.)), bl=sampleL(sampleUV+vec2(-e.x,e.y));
  float bc=sampleL(sampleUV+vec2(0.,e.y)), br=sampleL(sampleUV+e);
  vec2 grad=vec2(tr+2.*mr+br-tl-2.*ml-bl,bl+2.*bc+br-tl-2.*tc-tr);
  float edge=smoothstep(mix(.035,.08,u_dark),mix(.32,.65,u_dark),length(grad));
  vec2 tangent=normalize(vec2(grad.y,grad.x)+vec2(.0001));
  float ink=clamp((1.-lum(source))*1.45,0.,1.);
  float level=clamp(ink+(bayer(ivec2(cell))-.5)*.18+lens*.025,0.,1.);
  float width=mix(.045,.026,lens);
  float dotMark=1.-smoothstep(.07,.07+fwidth(q.x),length(q));
  float dash=line(q,vec2(-.28,0.),vec2(.28,0.),width);
  float plus=max(dash,line(q,vec2(0.,-.29),vec2(0.,.29),width));
  float hatch=max(line(q,vec2(-.3,-.28),vec2(.3,.28),width),line(q,vec2(-.3,.28),vec2(.3,-.28),width));
  float glyph=mix(dotMark,dash,smoothstep(.12,.25,level));
  glyph=mix(glyph,plus,smoothstep(.3,.45,level));
  glyph=mix(glyph,hatch,smoothstep(.55,.75,level));
  float contour=line(q,-tangent*.36,tangent*.36,width);
  glyph=mix(glyph,contour,edge*mix(.97,.85,u_dark));
  float halftone=1.-smoothstep(.31*sqrt(ink),.31*sqrt(ink)+fwidth(q.x),length(q));
  float mark=mix(halftone,glyph,u_progress);
  // Paper becomes transparent; only blue pigment and its contours spill.
  float pigment=smoothstep(mix(.08,.18,u_dark),mix(.52,.65,u_dark),ink);
  float mask=smoothstep(0.,.16,uv.x)*(1.-smoothstep(.78,1.,uv.x));
  mask*=smoothstep(.08,.25,uv.y)*(1.-smoothstep(.82,1.,uv.y));
  // Light paper needs saturated ocean ink; keep the established night palette.
  vec3 blue=mix(vec3(.025,.36,.59),vec3(.30,.62,.74),u_dark);
  blue=mix(blue,source,.18);
  blue=mix(blue,u_accent,.14+u_reveal*.13);
  blue=mix(blue,u_fg,.12*u_dark);
  blue=mix(blue,u_surface,u_reveal*.08);
  float alpha=mark*pigment*mask*(.9-u_reveal*.12);
  color=vec4(blue*alpha,alpha);
}
`;

/** The server-rendered card stays intact; capture also sees keyboard-generated clicks. */
export function HeroSpillReveal({ children }: { children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  return <div className="relative w-full isolate" onClickCapture={(event) => {
    if ((event.target as HTMLElement).closest("button")) setRevealed(value => !value);
  }}>
    <HeroMediaSpill revealed={revealed} />
    <div className="relative z-10">{children}</div>
  </div>;
}

export function HeroMediaSpill({ mobile = false, revealed = false }: { mobile?: boolean; revealed?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealRef = useRef(revealed);
  const [ready, setReady] = useState(false);
  useEffect(() => { revealRef.current = revealed; }, [revealed]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = matchMedia("(max-width: 379px)");
    const breakpoint = matchMedia("(max-width: 767px)");
    let dispose = () => {};
    const setup = () => {
      dispose(); setReady(false);
      if (breakpoint.matches !== mobile || (mobile && (motion.matches || narrow.matches))) return;
      const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true });
      if (!gl) return;
      let raf = 0, dead = false, loaded = false, visible = false, elapsed = 0, previous = 0, reveal = 0;
      const shaders: WebGLShader[] = [];
      const program = gl.createProgram()!;
      const buffer = gl.createBuffer();
      const texture = gl.createTexture();
      const cleanupGL = () => {
        gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program);
        shaders.forEach(shader => gl.deleteShader(shader));
      };
      try {
        for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
          const shader = gl.createShader(type)!; shaders.push(shader);
          gl.shaderSource(shader, source); gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation failed");
          gl.attachShader(program, shader);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Spill program link failed");
      } catch (error) { console.warn("Media spill: using poster", error); cleanupGL(); return; }
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      const uniforms = Object.fromEntries(["resolution","pointer","dpr","cell","time","progress","reveal","dark","fg","surface","accent"].map(name=>[name,gl.getUniformLocation(program,`u_${name}`)]));
      let dpr = 1;
      const pointer = [-1000,-1000], target = [-1000,-1000];
      const draw = () => {
        gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);
        gl.uniform2f(uniforms.pointer,pointer[0],pointer[1]);
        gl.uniform1f(uniforms.dpr,dpr); gl.uniform1f(uniforms.cell,mobile ? 19 : 11);
        gl.uniform1f(uniforms.time,motion.matches ? 0 : elapsed);
        gl.uniform1f(uniforms.progress,motion.matches ? 1 : 1-Math.pow(1-Math.min(elapsed/1.5,1),3));
        gl.uniform1f(uniforms.reveal,reveal);
        gl.drawArrays(gl.TRIANGLES,0,6);
      };
      const frame = (now: number) => {
        raf = 0;
        if (dead || !visible || !loaded || motion.matches) return;
        const dt = previous ? Math.min((now-previous)/1000,.05) : 0; previous=now; elapsed+=dt;
        const damping=1-Math.exp(-dt*7);
        for(let i=0;i<2;i++) pointer[i]+=(target[i]-pointer[i])*damping;
        reveal+=(Number(revealRef.current)-reveal)*damping;
        draw(); raf=requestAnimationFrame(frame);
      };
      const start = () => { if (loaded && visible && !motion.matches && !raf) { previous=0; raf=requestAnimationFrame(frame); } };
      const resize = () => {
        const rect=canvas.getBoundingClientRect();
        dpr=Math.min(devicePixelRatio,mobile ? 1.5 : 2);
        canvas.width=Math.max(1,Math.round(rect.width*dpr)); canvas.height=Math.max(1,Math.round(rect.height*dpr));
        gl.viewport(0,0,canvas.width,canvas.height);
        if(loaded) draw();
      };
      const palette = () => {
        const style=getComputedStyle(document.documentElement);
        for(const name of ["fg","surface","accent"]) {
          const value=style.getPropertyValue(`--${name}`).trim().replace("#","");
          const hex=value.length===3 ? value.split("").map(char=>char+char).join("") : value;
          gl.uniform3f(uniforms[name],parseInt(hex.slice(0,2),16)/255,parseInt(hex.slice(2,4),16)/255,parseInt(hex.slice(4,6),16)/255);
        }
        gl.uniform1f(uniforms.dark,document.documentElement.classList.contains("dark") ? 1 : 0);
        if(loaded) draw();
      };
      const image=new Image();
      image.onload=()=>{ if(dead)return; gl.bindTexture(gl.TEXTURE_2D,texture); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image); resize(); palette(); loaded=true; draw(); setReady(true); start(); };
      image.src="/textures/wave-spill.jpg";
      const observer=new IntersectionObserver(([entry])=>{ visible=entry.isIntersecting; if(visible)start(); else { cancelAnimationFrame(raf); raf=0; previous=0; } }); observer.observe(canvas);
      const sizing=new ResizeObserver(resize); sizing.observe(canvas);
      const theme=new MutationObserver(palette); theme.observe(document.documentElement,{attributes:true,attributeFilter:["class","data-theme"]});
      const move=(event: PointerEvent)=>{ const r=canvas.getBoundingClientRect(); target[0]=event.clientX-r.left; target[1]=r.bottom-event.clientY; };
      const leave=()=>{ target[0]=-1000; target[1]=-1000; };
      const lost=()=>{ loaded=false; cancelAnimationFrame(raf); raf=0; setReady(false); };
      window.addEventListener("pointermove",move,{passive:true}); document.addEventListener("pointerleave",leave);
      canvas.addEventListener("webglcontextlost",lost);
      resize(); palette();
      dispose=()=>{ dead=true; cancelAnimationFrame(raf); image.onload=null; observer.disconnect(); sizing.disconnect(); theme.disconnect(); window.removeEventListener("pointermove",move); document.removeEventListener("pointerleave",leave); canvas.removeEventListener("webglcontextlost",lost); cleanupGL(); };
    };
    setup();
    for(const query of [motion,narrow,breakpoint]) query.addEventListener("change",setup);
    return ()=>{ dispose(); for(const query of [motion,narrow,breakpoint])query.removeEventListener("change",setup); };
  }, [mobile]);

  return <div aria-hidden="true" className="pointer-events-none absolute" style={mobile ? {inset:0} : {left:0,top:-48,height:360,width:"calc(208px + max(20px, (100vw - 728px) / 2))"}}>
    {/* A poster exists from SSR until the first successful GPU frame, including failures. */}
    <img src="/textures/wave-spill.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" style={{opacity:ready ? 0 : .45,maskImage:"radial-gradient(ellipse at center, black 15%, transparent 70%)"}} />
    <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{opacity:ready ? 1 : 0}} />
  </div>;
}
