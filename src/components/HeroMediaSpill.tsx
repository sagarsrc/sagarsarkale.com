"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const vertex = `#version 300 es
in vec2 a_position;
void main() { gl_Position = vec4(a_position, 0., 1.); }
`;
const fragment = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform vec2 u_resolution, u_pointer, u_lens;
uniform float u_dpr, u_cell, u_time, u_progress, u_reveal, u_dark, u_scroll;
uniform vec3 u_fg, u_surface, u_accent;
out vec4 color;
float lum(vec3 c) { return dot(c, vec3(.2126,.7152,.0722)); }
// Mip-filter before posterization: suppress watercolor grain, retain the huge curl.
float sampleL(vec2 p) { return lum(textureLod(u_image,p,4.).rgb); }
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
  vec2 size=u_resolution/u_dpr;
  vec2 px=gl_FragCoord.xy/u_dpr;
  vec2 uv=px/size;
  // The image is the poster, not an opacity texture: three solid printing inks.
  // Parallax is bounded to eight CSS pixels and never moves the halftone grid.
  vec2 shift=clamp(u_pointer,vec2(-1.),vec2(1.))*8.;
  vec2 flow=shift+vec2(sin(u_time*.09)*2.,cos(u_time*.07)*2.);
  vec2 cell=floor(px/u_cell);
  vec2 q=fract(px/u_cell)-.5;
  vec2 sampleUV=(px+flow)/size;
  sampleUV.y=1.-sampleUV.y;
  // Ken Burns: the print slowly enlarges as the hero scrolls away.
  vec2 centered=sampleUV-.5;
  sampleUV=.5+centered/mix(1.,1.12,u_scroll)+vec2(0.,u_scroll*.045);
  // A portrait crop keeps the breaking lip large on small screens.
  if(size.x<size.y) sampleUV.x=.20+sampleUV.x*.65;
  vec3 source=textureLod(u_image,sampleUV,4.).rgb;
  float light=lum(source);
  // Posterize into five printing plates: watercolor grain merges into broad ink shapes.
  float plate=floor(light*4.999)/4.;
  float threshold=bayer(ivec2(cell))-.5;
  float tone=plate+threshold*.02;
  float deep=1.-smoothstep(.38,.47,tone);
  float foam=smoothstep(.74,.85,tone);
  vec3 ink=mix(vec3(.025,.20,.38),vec3(.025,.37,.46),u_dark);
  vec3 sea=mix(vec3(.13,.53,.70),vec3(.05,.70,.78),u_dark);
  vec3 paper=mix(vec3(.92,.95,.91),vec3(.67,.94,.91),u_dark);
  ink=mix(ink,u_accent,.06+u_reveal*.08);
  paper=mix(paper,u_surface,.08);
  vec3 printed=mix(sea,ink,deep);
  printed=mix(printed,paper,foam);

  // Coarse screen-print dots sit within the broad masses, not instead of them.
  float radius=mix(.12,.43,smoothstep(.25,.80,plate));
  float dotInk=1.-smoothstep(radius,radius+fwidth(q.x),length(q));
  float mid=1.-abs(plate-.55)*2.;
  printed=mix(printed,ink,dotInk*.32*clamp(mid,0.,1.)*(1.-foam));

  // Four-tap image gradient: directional marks belong only to the foam boundary.
  vec2 e=vec2(.006,.009);
  vec2 g=vec2(sampleL(sampleUV+vec2(e.x,0.))-sampleL(sampleUV-vec2(e.x,0.)),
              sampleL(sampleUV+vec2(0.,e.y))-sampleL(sampleUV-vec2(0.,e.y)));
  vec2 tangent=normalize(vec2(g.y,g.x)+vec2(.0001));
  float edge=smoothstep(.04,.18,length(g));
  float hatch=line(q,-tangent*.32,tangent*.32,.04);
  float foamDetail=edge*smoothstep(.60,.80,plate)*hatch;
  printed=mix(printed,ink,foamDetail*.6*u_progress);
  // The develop lens: pointing dissolves the print back into the photograph.
  // Revealing the face behind the wave: the print remembers it is a photograph.
  // The develop lens widens and the whole sheet partially resolves, reversibly.
  float develop=1.-smoothstep(60.,150.+u_reveal*min(size.x,size.y)*.55,distance(px,u_lens));
  if(develop>.001||u_reveal>.001) {
    vec3 photo=textureLod(u_image,sampleUV,0.).rgb;
    printed=mix(printed,photo,develop*(.85+u_reveal*.15));
    printed=mix(printed,photo,u_reveal*.16);
  }
  // Static print grain: paper tooth, no shimmer.
  float grain=fract(sin(dot(px,vec2(12.9898,78.233)))*43758.5453)-.5;
  printed+=grain*.022;
  // The sheet develops: blank paper with a ghost of the sea resolves into plates.
  printed=mix(mix(paper,sea,.14),printed,.25+.75*u_progress);
  color=vec4(printed,1.);
}
`;

/** The server-rendered card stays intact; capture also sees keyboard-generated clicks. */
export function HeroSpillReveal({ children }: { children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Scroll choreography: --hero-scroll drives content drift/fade in page.tsx and
  // the field's counter-zoom in the shader. Damped in the canvas RAF loop.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = wrap.getBoundingClientRect();
      const progress = Math.min(Math.max(-rect.top / (rect.height * 0.7), 0), 1);
      wrap.style.setProperty("--hero-scroll", progress.toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={wrapRef} className="relative isolate min-h-[min(75vh,780px)] py-20 max-md:pt-52 max-md:pb-16" onClickCapture={(event) => {
    if ((event.target as HTMLElement).closest("button")) setRevealed(value => !value);
  }}>
    <HeroMediaSpill revealed={revealed} />
    <HeroMediaSpill mobile revealed={revealed} />
    {/* Ghost of the name's meaning: the wave is the subject, the word is its root. */}
    <span aria-hidden="true" className="pointer-events-none absolute z-[5] right-[1%] top-[4%] font-serif italic select-none leading-none max-md:hidden" style={{fontSize:"clamp(96px,17vw,250px)",color:"var(--fg)",opacity:.09,mixBlendMode:"overlay"}}>sāgara</span>
    {/* The print dissolves into the page instead of ending at a hard edge. */}
    <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-[6]" style={{background:"linear-gradient(to bottom, transparent, var(--bg))"}} />
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
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      const uniforms = Object.fromEntries(["resolution","pointer","lens","dpr","cell","time","progress","reveal","dark","scroll","fg","surface","accent"].map(name=>[name,gl.getUniformLocation(program,`u_${name}`)]));
      let dpr = 1;
      const pointer = [0,0], target = [0,0];
      const lens = [-1000,-1000], lensTarget = [-1000,-1000];
      let scroll = 0, scrollTarget = 0;
      const draw = () => {
        gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);
        gl.uniform2f(uniforms.pointer,pointer[0],pointer[1]);
        gl.uniform2f(uniforms.lens,lens[0],lens[1]);
        gl.uniform1f(uniforms.dpr,dpr); gl.uniform1f(uniforms.cell,mobile ? 16 : 28);
        gl.uniform1f(uniforms.time,motion.matches ? 0 : elapsed);
        gl.uniform1f(uniforms.progress,motion.matches ? 1 : 1-Math.pow(1-Math.min(elapsed/1.2,1),3));
        gl.uniform1f(uniforms.reveal,reveal);
        gl.uniform1f(uniforms.scroll,scroll);
        gl.drawArrays(gl.TRIANGLES,0,6);
      };
      const frame = (now: number) => {
        raf = 0;
        if (dead || !visible || !loaded || motion.matches) return;
        const dt = previous ? Math.min((now-previous)/1000,.05) : 0; previous=now;
        // Visitor motion control (footer "still the wave"): freeze the drift,
        // pointer and lens in place; the last frame keeps rendering.
        const frozen = document.documentElement.dataset.motion === 'paused';
        if (!frozen) {
          elapsed+=dt;
          const heroRect=canvas.getBoundingClientRect();
          scrollTarget=Math.min(Math.max(-heroRect.top/(heroRect.height*0.7),0),1);
          const damping=1-Math.exp(-dt*2.5);
          for(let i=0;i<2;i++) pointer[i]+=(target[i]-pointer[i])*damping;
          reveal+=(Number(revealRef.current)-reveal)*damping;
          scroll+=(scrollTarget-scroll)*(1-Math.exp(-dt*6));
          for(let i=0;i<2;i++) lens[i]+=(lensTarget[i]-lens[i])*(1-Math.exp(-dt*10));
        }
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
      image.onload=()=>{ if(dead)return; gl.bindTexture(gl.TEXTURE_2D,texture); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image); gl.generateMipmap(gl.TEXTURE_2D); resize(); palette(); loaded=true; draw(); setReady(true); start(); };
      image.src="/textures/wave-spill.jpg";
      const observer=new IntersectionObserver(([entry])=>{ visible=entry.isIntersecting; if(visible)start(); else { cancelAnimationFrame(raf); raf=0; previous=0; } }); observer.observe(canvas);
      const sizing=new ResizeObserver(resize); sizing.observe(canvas);
      const theme=new MutationObserver(palette); theme.observe(document.documentElement,{attributes:true,attributeFilter:["class","data-theme"]});
      const move=(event: PointerEvent)=>{ const r=canvas.getBoundingClientRect(); target[0]=Math.max(-1,Math.min(1,(event.clientX-r.left)/r.width*2-1)); target[1]=Math.max(-1,Math.min(1,(r.bottom-event.clientY)/r.height*2-1)); lensTarget[0]=event.clientX-r.left; lensTarget[1]=r.bottom-event.clientY; };
      const leave=()=>{ target[0]=0; target[1]=0; lensTarget[0]=-1000; lensTarget[1]=-1000; };
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

  return <div aria-hidden="true" className={`pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-screen overflow-hidden ${mobile ? "hidden max-md:block" : "max-md:hidden"}`}>
    {/* A poster exists from SSR until the first successful GPU frame, including failures. */}
    <img src="/textures/wave-spill.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" style={{opacity:ready ? 0 : 1}} />
    <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{opacity:ready ? 1 : 0}} />
  </div>;
}
