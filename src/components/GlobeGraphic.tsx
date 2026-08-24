'use client';

import dynamic from 'next/dynamic';
import styles from './GlobeGraphic.module.css';

/*
 * A holographic, particle-based 3D globe — the visual for "digital and
 * physical markets interacting" in the Research panel. The actual WebGL
 * work lives in GlobeCanvas, loaded client-only: a canvas has nothing
 * useful to server-render, and this keeps three.js out of the server
 * bundle and off the initial-load critical path.
 */
const GlobeCanvas = dynamic(() => import('./GlobeCanvas'), {
  ssr: false,
  loading: () => null,
});

export default function GlobeGraphic({ className }: { className?: string }) {
  return (
    <div className={`${styles.wrap} ${className ?? ''}`} aria-hidden="true">
      <GlobeCanvas />
    </div>
  );
}
