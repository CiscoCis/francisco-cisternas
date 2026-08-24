'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/*
 * The actual WebGL work behind GlobeGraphic. Split into its own file so it
 * can be `next/dynamic`-imported with `ssr: false` — three.js has nothing
 * useful to server-render, and this keeps it off the critical path.
 *
 * A holographic "globe made of data": particles on a Fibonacci-lattice
 * sphere, a sparse neighbour mesh, slow rotation, an always-on idle wobble
 * (amplified on hover), cursor-pull, and a latitude-coordinated ripple on
 * click — a gathered swell rather than each particle moving independently,
 * which reads as a chaotic rattle instead of a natural motion.
 *
 * Colours are normal-blended, not additive: additive blending only glows
 * against a dark backdrop, and on this site's white background it just
 * washes out.
 */

const PARTICLE_COUNT = 900;
const RADIUS = 1;

/** Deep blue and a visual teal — the two colours asked for, scoped to
 *  this graphic (the teal is brighter than the site's --teal token, tuned
 *  for visibility as small points on white rather than as a text/UI colour). */
const PALETTE = [
  0x0d3b7a, // deep blue
  0x14c9b7, // teal
];

function fibonacciSphere(count: number, radius: number): Float32Array {
  const pts = new Float32Array(count * 3);
  const offset = 2 / count;
  const increment = Math.PI * (3 - Math.sqrt(5)); // golden angle
  for (let i = 0; i < count; i++) {
    const y = i * offset - 1 + offset / 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * increment;
    pts[i * 3] = Math.cos(phi) * r * radius;
    pts[i * 3 + 1] = y * radius;
    pts[i * 3 + 2] = Math.sin(phi) * r * radius;
  }
  return pts;
}

/** A soft round glow, generated once rather than shipped as an asset. */
function glowTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.85)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export default function GlobeCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // No WebGL — the graphic is purely decorative, so just skip it.
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    host.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', (e) =>
      e.preventDefault()
    );

    // Fades in on mount rather than popping — matters most when the panel
    // this sits in is switched away from and back to.
    host.style.opacity = '0';
    host.style.transition = 'opacity 500ms ease';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 10);
    camera.position.z = 2.7;

    const base = fibonacciSphere(PARTICLE_COUNT, RADIUS);
    const positions = new Float32Array(base);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const wobblePhase = new Float32Array(PARTICLE_COUNT);
    const wobbleFreq = new Float32Array(PARTICLE_COUNT);

    const tmpColor = new THREE.Color();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const hex = PALETTE[i % PALETTE.length];
      tmpColor.setHex(hex).offsetHSL(0, 0, (Math.random() - 0.5) * 0.12);
      colors[i * 3] = tmpColor.r;
      colors[i * 3 + 1] = tmpColor.g;
      colors[i * 3 + 2] = tmpColor.b;
      wobblePhase[i] = Math.random() * Math.PI * 2;
      wobbleFreq[i] = 2.2 + Math.random() * 2.4;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.078,
      map: glowTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const linePositions: number[] = [];
    const NEIGHBOUR_DIST =
      ((2 * Math.PI * RADIUS) / Math.sqrt(PARTICLE_COUNT)) * 1.2;
    for (let i = 0; i < PARTICLE_COUNT; i += 7) {
      let bestJ = -1;
      let bestD = Infinity;
      for (let j = 0; j < PARTICLE_COUNT; j++) {
        if (j === i) continue;
        const dx = base[i * 3] - base[j * 3];
        const dy = base[i * 3 + 1] - base[j * 3 + 1];
        const dz = base[i * 3 + 2] - base[j * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < bestD) {
          bestD = d;
          bestJ = j;
        }
      }
      if (bestJ !== -1 && bestD < NEIGHBOUR_DIST) {
        linePositions.push(
          base[i * 3], base[i * 3 + 1], base[i * 3 + 2],
          base[bestJ * 3], base[bestJ * 3 + 1], base[bestJ * 3 + 2]
        );
      }
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(linePositions), 3)
    );
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x6d5b96,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    /* ---- interaction state --------------------------------------------- */
    let hovered = false;
    let hoverT = 0; // eased 0..1, amplifies wobble + drives cursor-pull
    const pointerNDC = new THREE.Vector2(2, 2); // off-canvas until first move
    const raycaster = new THREE.Raycaster();
    const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const cursorPoint = new THREE.Vector3();
    let cursorValid = false;

    // A click sends a brief pulse (1, decaying to 0 over ~0.6s) through the
    // wobble below — a vibration, not a displacement of its own.
    let clickPulse = 0;

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNDC, camera);
      cursorValid = !!raycaster.ray.intersectPlane(interactionPlane, cursorPoint);
    };

    const onPointerMove = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);
    const onPointerEnter = () => {
      hovered = true;
    };
    const onPointerLeave = () => {
      hovered = false;
      cursorValid = false;
    };
    const onClick = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);
      clickPulse = 1;
    };

    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerenter', onPointerEnter);
    host.addEventListener('pointerleave', onPointerLeave);
    host.addEventListener('pointerdown', onClick);

    // Sized to whatever box GlobeGraphic.module.css gives the host, rather
    // than a fixed pixel size.
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width <= 0 || height <= 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    ro.observe(host);

    // Positions are rebuilt from `base` every frame (rotate, then wobble,
    // then cursor-pull) rather than transforming the mesh, so nothing here
    // needs to invert a rotation matrix to compare against the cursor.
    let frame = 0;
    let rotation = 0;
    let last = performance.now();
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const rotated = new THREE.Vector3();
    const cos = Math.cos;
    const sin = Math.sin;
    let fadedIn = false;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      rotation += dt * 0.22;

      hoverT += ((hovered ? 1 : 0) - hoverT) * Math.min(1, dt * 5);
      if (clickPulse > 0) clickPulse = Math.max(0, clickPulse - dt * 0.7);

      const c = cos(rotation);
      const s = sin(rotation);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const bx = base[i * 3];
        const by = base[i * 3 + 1];
        const bz = base[i * 3 + 2];

        // Rotate around Y.
        rotated.set(bx * c + bz * s, by, -bx * s + bz * c);

        // Idle breathing — small and always on, so the field is never
        // perfectly still. Hover amplifies it further.
        const wobbleAmp = 0.006 + 0.05 * hoverT;
        let wob =
          1 +
          wobbleAmp * Math.sin(now * 0.001 * wobbleFreq[i] + wobblePhase[i]);

        // Wave ripples by latitude (`by`) — every particle at the same
        // height moves together, in a coordinated swell.
        if (clickPulse > 0.001) {
          wob +=
            0.018 *
            clickPulse *
            Math.sin(now * 0.0011 - by * 2.1);
        }
        rotated.multiplyScalar(wob);

        // Pull toward the cursor's position at the sphere's depth.
        if (hoverT > 0.001 && cursorValid) {
          const dx = cursorPoint.x - rotated.x;
          const dy = cursorPoint.y - rotated.y;
          const dz = cursorPoint.z - rotated.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const influence = 1.3;
          if (dist < influence) {
            const strength = (1 - dist / influence) * 0.3 * hoverT;
            rotated.x += dx * strength;
            rotated.y += dy * strength;
            rotated.z += dz * strength;
          }
        }

        posAttr.array[i * 3] = rotated.x;
        posAttr.array[i * 3 + 1] = rotated.y;
        posAttr.array[i * 3 + 2] = rotated.z;
      }
      posAttr.needsUpdate = true;

      // Echo the vibration on the connecting mesh via its transform-level
      // scale rather than a second per-vertex pass over its geometry.
      const lineScale = 1 + 0.006 * clickPulse;
      lines.scale.setScalar(lineScale);
      lines.rotation.y = rotation;

      renderer.render(scene, camera);

      if (!fadedIn) {
        fadedIn = true;
        host.style.opacity = '1';
      }

      frame = requestAnimationFrame(tick);
    };

    if (reduceMotion) {
      renderer.render(scene, camera);
      host.style.opacity = '1';
    } else {
      frame = requestAnimationFrame(tick);
    }

    // Pause the loop whenever there's no point rendering: the tab isn't
    // visible, or — since this panel stays mounted rather than unmounting
    // when the visitor switches tabs (see ResearchPublications.tsx, where
    // tearing down/recreating this WebGL context on every switch corrupted
    // the sticky header's backdrop-filter compositing in Chrome) — this
    // panel itself is hidden or scrolled off-screen. A `hidden` ancestor
    // collapses the element's box the same way scrolling away does, so one
    // IntersectionObserver covers both cases.
    let elementVisible = true;
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const start = () => {
      if (reduceMotion || frame || document.hidden || !elementVisible) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        elementVisible = entry.isIntersecting;
        if (elementVisible) start();
        else stop();
      },
      { threshold: 0 }
    );
    io.observe(host);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisibility);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerenter', onPointerEnter);
      host.removeEventListener('pointerleave', onPointerLeave);
      host.removeEventListener('pointerdown', onClick);
      ro.disconnect();
      io.disconnect();
      geometry.dispose();
      material.map?.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={hostRef} style={{ width: '100%', height: '100%' }} />;
}
