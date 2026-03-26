'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Lemniscate of Bernoulli with slight natural asymmetry
function infinityCurve(t: number, scale: number = 1.8): THREE.Vector3 {
  const asymmetry = 1.0 + 0.06 * Math.sin(t * 0.5);
  const denom = 1 + Math.sin(t) * Math.sin(t);
  const x = (scale * asymmetry * Math.cos(t)) / denom;
  const y = (scale * 0.92 * Math.sin(t) * Math.cos(t)) / denom;
  // 3D: the curve twists through z-space like a ribbon
  const z = Math.sin(t) * 0.4;
  return new THREE.Vector3(x, y, z);
}

// Get the Frenet frame (tangent, normal, binormal) at point t
function frenetFrame(t: number) {
  const dt = 0.001;
  const p0 = infinityCurve(t - dt);
  const p1 = infinityCurve(t);
  const p2 = infinityCurve(t + dt);

  const tangent = new THREE.Vector3().subVectors(p2, p0).normalize();
  const d2 = new THREE.Vector3().subVectors(p2, p1.clone().multiplyScalar(2).add(p0));
  const normal = new THREE.Vector3().crossVectors(tangent, d2).crossVectors(tangent, new THREE.Vector3().crossVectors(tangent, d2));

  if (normal.length() < 0.001) {
    // Fallback normal
    normal.set(0, 1, 0);
    if (Math.abs(tangent.dot(normal)) > 0.9) normal.set(0, 0, 1);
  }
  normal.normalize();

  const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

  return { tangent, normal, binormal };
}

interface RibbonData {
  positions: THREE.Vector3[];
  isCore: boolean[];
  tValues: number[];       // parametric t for each particle
  offsets: THREE.Vector3[]; // offset from spine at that t
}

// Generate ribbon-shaped particle cloud
function generateRibbonParticles(count: number): RibbonData {
  const positions: THREE.Vector3[] = [];
  const isCore: boolean[] = [];
  const tValues: number[] = [];
  const offsets: THREE.Vector3[] = [];

  const RIBBON_WIDTH = 0.38;
  const RIBBON_THICKNESS = 0.1;

  function addParticle(pos: THREE.Vector3, core: boolean, t: number, spine: THREE.Vector3) {
    positions.push(pos);
    isCore.push(core);
    tValues.push(t);
    offsets.push(new THREE.Vector3(pos.x - spine.x, pos.y - spine.y, pos.z - spine.z));
  }

  // Spine particles
  const spineCount = Math.floor(count * 0.12);
  for (let i = 0; i < spineCount; i++) {
    const t = (i / spineCount) * Math.PI * 2;
    const p = infinityCurve(t);
    addParticle(p, true, t, p);
  }

  // Ribbon surface particles — bulk of visible ribbon
  const surfaceCount = Math.floor(count * 0.65);
  for (let i = 0; i < surfaceCount; i++) {
    const t = (i / surfaceCount) * Math.PI * 2;
    const spine = infinityCurve(t);
    const frame = frenetFrame(t);
    const twist = t * 1.5;
    const ribbonU = (Math.random() - 0.5) * RIBBON_WIDTH;
    const ribbonV = (Math.random() - 0.5) * RIBBON_THICKNESS;
    const cos = Math.cos(twist);
    const sin = Math.sin(twist);
    const offsetN = ribbonU * cos - ribbonV * sin;
    const offsetB = ribbonU * sin + ribbonV * cos;

    const p = new THREE.Vector3(
      spine.x + frame.normal.x * offsetN + frame.binormal.x * offsetB,
      spine.y + frame.normal.y * offsetN + frame.binormal.y * offsetB,
      spine.z + frame.normal.z * offsetN + frame.binormal.z * offsetB,
    );
    addParticle(p, false, t, spine);
  }

  // Edge highlights
  const edgeCount = Math.floor(count * 0.1);
  for (let i = 0; i < edgeCount; i++) {
    const t = (i / edgeCount) * Math.PI * 2;
    const spine = infinityCurve(t);
    const frame = frenetFrame(t);
    const twist = t * 1.5;
    const cos = Math.cos(twist);
    const sin = Math.sin(twist);
    const side = Math.random() > 0.5 ? 1 : -1;
    const ribbonU = side * RIBBON_WIDTH * 0.5;
    const ribbonV = (Math.random() - 0.5) * RIBBON_THICKNESS * 0.5;
    const offsetN = ribbonU * cos - ribbonV * sin;
    const offsetB = ribbonU * sin + ribbonV * cos;

    const p = new THREE.Vector3(
      spine.x + frame.normal.x * offsetN + frame.binormal.x * offsetB,
      spine.y + frame.normal.y * offsetN + frame.binormal.y * offsetB,
      spine.z + frame.normal.z * offsetN + frame.binormal.z * offsetB,
    );
    addParticle(p, true, t, spine);
  }

  // Soft halo
  const haloCount = count - positions.length;
  for (let i = 0; i < haloCount; i++) {
    const t = Math.random() * Math.PI * 2;
    const spine = infinityCurve(t);
    const spread = 0.15;
    const p = new THREE.Vector3(
      spine.x + (Math.random() - 0.5) * spread,
      spine.y + (Math.random() - 0.5) * spread,
      spine.z + (Math.random() - 0.5) * spread,
    );
    addParticle(p, false, t, spine);
  }

  return { positions, isCore, tValues, offsets };
}

export function ParticleHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 5.5;

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    if (!renderer.getContext()) {
      renderer.dispose();
      return;
    }

    function getAccentColor(): THREE.Color {
      const isDark = document.documentElement.classList.contains('dark');
      return isDark ? new THREE.Color(0x22d3ee) : new THREE.Color(0x0891b2);
    }

    function getMutedColor(): THREE.Color {
      const isDark = document.documentElement.classList.contains('dark');
      return isDark ? new THREE.Color(0x555570) : new THREE.Color(0x94a3b8);
    }

    const PARTICLE_COUNT = 1500;
    const ribbonData = generateRibbonParticles(PARTICLE_COUNT);
    const { positions: shapePoints, isCore, tValues, offsets } = ribbonData;

    // Scatter close to final position for smoother entry (not across entire screen)
    const scatteredPositions = shapePoints.map((p) => new THREE.Vector3(
      p.x + (Math.random() - 0.5) * 3,
      p.y + (Math.random() - 0.5) * 3,
      p.z + (Math.random() - 0.5) * 3,
    ));

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const particleOpacities = new Float32Array(PARTICLE_COUNT);
    const colorIndices = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = scatteredPositions[i].x;
      positions[i * 3 + 1] = scatteredPositions[i].y;
      positions[i * 3 + 2] = scatteredPositions[i].z;
      // Wide thickness variation — some tiny specks, some chunky orbs
      const sizeRoll = Math.random();
      if (isCore[i]) {
        sizes[i] = sizeRoll < 0.3 ? (Math.random() * 1.5 + 4.5) : (Math.random() * 2 + 2.5); // big or medium
      } else {
        sizes[i] = sizeRoll < 0.2 ? (Math.random() * 1 + 0.5) : sizeRoll < 0.7 ? (Math.random() * 1.5 + 1.5) : (Math.random() * 2 + 3); // tiny, medium, or big
      }
      particleOpacities[i] = isCore[i] ? (Math.random() * 0.1 + 0.9) : (Math.random() * 0.2 + 0.7);
      colorIndices[i] = Math.random(); // 0-1 for color palette mixing
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aOpacity', new THREE.BufferAttribute(particleOpacities, 1));
    geometry.setAttribute('aIsCore', new THREE.Float32BufferAttribute(isCore.map(b => b ? 1.0 : 0.0), 1));
    geometry.setAttribute('aColorIdx', new THREE.BufferAttribute(colorIndices, 1));

    function getColors() {
      const isDark = document.documentElement.classList.contains('dark');
      return {
        color1: isDark ? new THREE.Color(0x3b82f6) : new THREE.Color(0x1d4ed8), // blue
        color2: isDark ? new THREE.Color(0xef4444) : new THREE.Color(0xb91c1c), // red
        color3: isDark ? new THREE.Color(0x818cf8) : new THREE.Color(0x4338ca), // indigo (blend)
        muted:  isDark ? new THREE.Color(0x475569) : new THREE.Color(0x6b7280),
      };
    }

    const initialColors = getColors();
    const initialIsDark = document.documentElement.classList.contains('dark');

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor1: { value: initialColors.color1 },
        uColor2: { value: initialColors.color2 },
        uColor3: { value: initialColors.color3 },
        uMutedColor: { value: initialColors.muted },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uTime: { value: 0 },
        uOpacityMult: { value: initialIsDark ? 0.85 : 1.2 },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aOpacity;
        attribute float aIsCore;
        attribute float aColorIdx;
        varying float vOpacity;
        varying float vDepth;
        varying float vIsCore;
        varying float vColorIdx;
        uniform float uPixelRatio;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vDepth = -mvPosition.z;
          vOpacity = aOpacity;
          vIsCore = aIsCore;
          vColorIdx = aColorIdx;
          gl_PointSize = aSize * uPixelRatio * (3.5 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec3 uMutedColor;
        uniform float uTime;
        uniform float uOpacityMult;
        varying float vOpacity;
        varying float vDepth;
        varying float vIsCore;
        varying float vColorIdx;

        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;

          float glow = 1.0 - smoothstep(0.0, 0.5, d);
          float core = 1.0 - smoothstep(0.0, 0.12, d);
          glow = pow(glow, 1.4);
          float sheen = vIsCore * core * 0.5;
          glow += sheen;

          // Multi-color palette based on particle index
          vec3 baseColor;
          if (vColorIdx < 0.33) {
            baseColor = mix(uColor1, uColor2, vColorIdx * 3.0);
          } else if (vColorIdx < 0.66) {
            baseColor = mix(uColor2, uColor3, (vColorIdx - 0.33) * 3.0);
          } else {
            baseColor = mix(uColor3, uColor1, (vColorIdx - 0.66) * 3.0);
          }

          float depthMix = smoothstep(3.5, 6.0, vDepth);
          vec3 color = mix(baseColor, uMutedColor, depthMix * 0.3);
          color = mix(color, vec3(1.0), core * vIsCore * 0.4);

          gl_FragColor = vec4(color, glow * vOpacity * uOpacityMult);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: initialIsDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Ribbon outline — flowing curve lines
    function createCurveLoop(count: number): Float32Array {
      const arr = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const p = infinityCurve(t);
        arr[i * 3] = p.x;
        arr[i * 3 + 1] = p.y;
        arr[i * 3 + 2] = p.z;
      }
      return arr;
    }

    const lineCount = 160;
    const lineTargets = createCurveLoop(lineCount);
    const lineStartPos = new Float32Array(lineCount * 3);
    for (let i = 0; i < lineCount * 3; i++) {
      lineStartPos[i] = (Math.random() - 0.5) * 10;
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineStartPos), 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: getMutedColor(),
      transparent: true,
      opacity: 0,
    });
    const lineLoop = new THREE.LineLoop(lineGeo, lineMat);
    scene.add(lineLoop);

    // Streamer data — a few particles gently drift out and back
    const STREAMER_COUNT = Math.floor(PARTICLE_COUNT * 0.04); // just ~60 particles
    const streamerIndices: number[] = [];
    const streamerTargets: THREE.Vector3[] = [];
    const streamerPhaseOffsets: number[] = [];
    for (let i = 0; i < STREAMER_COUNT; i++) {
      const idx = Math.floor(PARTICLE_COUNT * 0.85 + Math.random() * PARTICLE_COUNT * 0.15);
      streamerIndices.push(Math.min(idx, PARTICLE_COUNT - 1));
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.random() * Math.PI - Math.PI / 2;
      const dist = 1.5 + Math.random() * 1.2; // closer, not flying across screen
      streamerTargets.push(new THREE.Vector3(
        Math.cos(angle1) * Math.cos(angle2) * dist,
        Math.sin(angle2) * dist,
        Math.sin(angle1) * Math.cos(angle2) * dist,
      ));
      streamerPhaseOffsets.push(Math.random() * Math.PI * 2);
    }

    // Animation
    let animationId: number;
    const clock = new THREE.Clock();
    let morphProgress = 0;
    const mouse = new THREE.Vector2(0, 0);

    function handleMouseMove(e: MouseEvent) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    function handleResize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    const themeObserver = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      const c = getColors();
      material.uniforms.uColor1.value = c.color1;
      material.uniforms.uColor2.value = c.color2;
      material.uniforms.uColor3.value = c.color3;
      material.uniforms.uMutedColor.value = c.muted;
      material.uniforms.uOpacityMult.value = isDark ? 0.85 : 1.2;
      material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
      material.needsUpdate = true;
      lineMat.color = c.muted;
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    function animate() {
      const elapsed = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsed;

      morphProgress = Math.min(1, elapsed / 3.5); // slower morph, no glitch
      const ease = morphProgress * morphProgress * (3 - 2 * morphProgress); // smoothstep

      const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const start = scatteredPositions[i];
        const base = shapePoints[i];

        let tx = base.x, ty = base.y, tz = base.z;
        if (morphProgress >= 1) {
          // Very gentle oscillation around home position — no drift along curve
          const phase = tValues[i] + i * 0.01;
          const wobble = Math.sin(elapsed * 0.3 + phase) * 0.015;
          tx = base.x + wobble;
          ty = base.y + Math.sin(elapsed * 0.25 + phase * 1.3) * 0.01;
          tz = base.z + Math.cos(elapsed * 0.35 + phase * 0.7) * 0.01;
        }

        posAttr.setXYZ(
          i,
          THREE.MathUtils.lerp(start.x, tx, ease),
          THREE.MathUtils.lerp(start.y, ty, ease),
          THREE.MathUtils.lerp(start.z, tz, ease),
        );
      }
      // Apply streaming — particles fly out and back
      if (morphProgress >= 1) {
        for (let s = 0; s < STREAMER_COUNT; s++) {
          const idx = streamerIndices[s];
          const target = streamerTargets[s];
          // Ping-pong: 0→1 (fly out) then 1→0 (fly back), period ~4-6s per particle
          const period = 7 + (s % 4); // slower cycle
          const phase = ((elapsed + streamerPhaseOffsets[s]) % period) / period;
          const t = phase < 0.5 ? phase * 2 : 2 - phase * 2;
          const easeT = t * t * (3 - 2 * t);

          const cx = posAttr.getX(idx);
          const cy = posAttr.getY(idx);
          const cz = posAttr.getZ(idx);

          posAttr.setXYZ(
            idx,
            THREE.MathUtils.lerp(cx, target.x, easeT * 0.5),
            THREE.MathUtils.lerp(cy, target.y, easeT * 0.5),
            THREE.MathUtils.lerp(cz, target.z, easeT * 0.5),
          );
        }
      }

      posAttr.needsUpdate = true;

      // Line morph
      const linePosAttr = lineGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < lineCount; i++) {
        const breathe = morphProgress >= 1 ? Math.sin(elapsed * 0.4 + i * 0.04) * 0.02 : 0;
        const s = 1 + breathe;
        linePosAttr.setXYZ(
          i,
          THREE.MathUtils.lerp(lineStartPos[i * 3], lineTargets[i * 3] * s, ease),
          THREE.MathUtils.lerp(lineStartPos[i * 3 + 1], lineTargets[i * 3 + 1] * s, ease),
          THREE.MathUtils.lerp(lineStartPos[i * 3 + 2], lineTargets[i * 3 + 2] * s, ease),
        );
      }
      linePosAttr.needsUpdate = true;
      lineMat.opacity = ease * 0.12;

      // Slow rotation + mouse tilt
      const targetRotY = elapsed * 0.08 + mouse.x * 0.35;
      const targetRotX = Math.sin(elapsed * 0.06) * 0.15 + mouse.y * 0.2;

      points.rotation.y += (targetRotY - points.rotation.y) * 0.015;
      points.rotation.x += (targetRotX - points.rotation.x) * 0.015;
      lineLoop.rotation.copy(points.rotation);

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    }

    animate();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      themeObserver.disconnect();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="particle-hero-container"
      aria-hidden="true"
    />
  );
}
