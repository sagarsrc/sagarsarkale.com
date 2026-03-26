'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Lemniscate of Bernoulli (infinity curve) parametric function
function infinityPoint(t: number, scale: number = 1.5): THREE.Vector3 {
  const denom = 1 + Math.sin(t) * Math.sin(t);
  const x = (scale * Math.cos(t)) / denom;
  const y = (scale * Math.sin(t) * Math.cos(t)) / denom;
  return new THREE.Vector3(x, y, 0);
}

// Generate points along the infinity curve with 3D depth variation
function generateInfinityPoints(count: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  // Main curve points
  for (let i = 0; i < count * 0.6; i++) {
    const t = (i / (count * 0.6)) * Math.PI * 2;
    const p = infinityPoint(t, 1.8);
    // Add slight z-variation for 3D depth
    p.z = Math.sin(t * 2) * 0.3;
    points.push(p);
  }
  // Fill volume — points scattered near the curve surface
  for (let i = 0; i < count * 0.4; i++) {
    const t = Math.random() * Math.PI * 2;
    const p = infinityPoint(t, 1.8);
    const offset = 0.15;
    p.x += (Math.random() - 0.5) * offset;
    p.y += (Math.random() - 0.5) * offset;
    p.z = Math.sin(t * 2) * 0.3 + (Math.random() - 0.5) * offset;
    points.push(p);
  }
  return points;
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
      // WebGL not available — fail silently
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 4.5;

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Check WebGL context
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
      return isDark ? new THREE.Color(0x475569) : new THREE.Color(0x94a3b8);
    }

    const PARTICLE_COUNT = 300;
    const shapePoints = generateInfinityPoints(PARTICLE_COUNT);

    // Scattered starting positions
    const scatteredPositions = shapePoints.map(() => new THREE.Vector3(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
    ));

    // Particle geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const particleOpacities = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = scatteredPositions[i].x;
      positions[i * 3 + 1] = scatteredPositions[i].y;
      positions[i * 3 + 2] = scatteredPositions[i].z;
      sizes[i] = Math.random() * 4 + 2;
      particleOpacities[i] = Math.random() * 0.5 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aOpacity', new THREE.BufferAttribute(particleOpacities, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: getAccentColor() },
        uMutedColor: { value: getMutedColor() },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aOpacity;
        varying float vOpacity;
        varying float vDepth;
        uniform float uPixelRatio;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vDepth = -mvPosition.z;
          vOpacity = aOpacity;
          gl_PointSize = aSize * uPixelRatio * (3.5 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uMutedColor;
        varying float vOpacity;
        varying float vDepth;

        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;

          float glow = 1.0 - smoothstep(0.0, 0.5, d);
          glow = pow(glow, 1.8);

          float depthMix = smoothstep(3.0, 6.0, vDepth);
          vec3 color = mix(uColor, uMutedColor, depthMix * 0.6);

          gl_FragColor = vec4(color, glow * vOpacity * 0.9);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Wireframe edges along the infinity curve
    const curveLineCount = 120;
    const curveLinePositions = new Float32Array(curveLineCount * 3);
    const curveLineTargets = new Float32Array(curveLineCount * 3);
    for (let i = 0; i < curveLineCount; i++) {
      const t = (i / curveLineCount) * Math.PI * 2;
      const p = infinityPoint(t, 1.8);
      p.z = Math.sin(t * 2) * 0.3;
      curveLineTargets[i * 3] = p.x;
      curveLineTargets[i * 3 + 1] = p.y;
      curveLineTargets[i * 3 + 2] = p.z;
      // Scatter start
      curveLinePositions[i * 3] = (Math.random() - 0.5) * 8;
      curveLinePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      curveLinePositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }

    // Build line indices to connect consecutive points in a loop
    const lineIndices: number[] = [];
    for (let i = 0; i < curveLineCount; i++) {
      lineIndices.push(i, (i + 1) % curveLineCount);
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(curveLinePositions, 3));
    lineGeo.setIndex(lineIndices);

    const lineMat = new THREE.LineBasicMaterial({
      color: getMutedColor(),
      transparent: true,
      opacity: 0,
    });

    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineSegments);

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

    // Theme observer
    const themeObserver = new MutationObserver(() => {
      material.uniforms.uColor.value = getAccentColor();
      material.uniforms.uMutedColor.value = getMutedColor();
      lineMat.color = getMutedColor();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    function animate() {
      const elapsed = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsed;

      // Morph in over 2.5s
      morphProgress = Math.min(1, elapsed / 2.5);
      const ease = 1 - Math.pow(1 - morphProgress, 3);

      // Flow animation: particles drift along the curve after morphing
      const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const start = scatteredPositions[i];
        const baseTarget = shapePoints[i];

        // After morph, add a flowing motion along the curve
        let target = baseTarget;
        if (morphProgress >= 1) {
          // Compute a phase offset per particle for the flow
          const phase = (i / PARTICLE_COUNT) * Math.PI * 2;
          const flowT = phase + elapsed * 0.3;
          const flowPoint = infinityPoint(flowT, 1.8);
          flowPoint.z = Math.sin(flowT * 2) * 0.3;

          // Blend between assigned position and flowing position
          const flowStrength = 0.15;
          target = new THREE.Vector3(
            baseTarget.x + (flowPoint.x - baseTarget.x) * flowStrength,
            baseTarget.y + (flowPoint.y - baseTarget.y) * flowStrength,
            baseTarget.z + (flowPoint.z - baseTarget.z) * flowStrength,
          );
        }

        // Breathe
        const breathe = morphProgress >= 1 ? Math.sin(elapsed * 0.6 + i * 0.05) * 0.02 : 0;
        const scale = 1 + breathe;

        posAttr.setXYZ(
          i,
          THREE.MathUtils.lerp(start.x, target.x * scale, ease),
          THREE.MathUtils.lerp(start.y, target.y * scale, ease),
          THREE.MathUtils.lerp(start.z, target.z * scale, ease),
        );
      }
      posAttr.needsUpdate = true;

      // Morph curve lines
      const linePosAttr = lineGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < curveLineCount; i++) {
        const breathe = morphProgress >= 1 ? Math.sin(elapsed * 0.6 + i * 0.05) * 0.02 : 0;
        const scale = 1 + breathe;
        linePosAttr.setXYZ(
          i,
          THREE.MathUtils.lerp(curveLinePositions[i * 3], curveLineTargets[i * 3] * scale, ease),
          THREE.MathUtils.lerp(curveLinePositions[i * 3 + 1], curveLineTargets[i * 3 + 1] * scale, ease),
          THREE.MathUtils.lerp(curveLinePositions[i * 3 + 2], curveLineTargets[i * 3 + 2] * scale, ease),
        );
      }
      linePosAttr.needsUpdate = true;
      lineMat.opacity = ease * 0.15;

      // Rotation — slow auto-rotate + mouse tilt
      const targetRotY = elapsed * 0.12 + mouse.x * 0.4;
      const targetRotX = Math.sin(elapsed * 0.08) * 0.15 + mouse.y * 0.25;

      points.rotation.y += (targetRotY - points.rotation.y) * 0.02;
      points.rotation.x += (targetRotX - points.rotation.x) * 0.02;
      lineSegments.rotation.copy(points.rotation);

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
