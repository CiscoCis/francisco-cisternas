'use client';

import { useEffect, useRef, ReactNode } from 'react';

// Moves its child a few pixels against the scroll — enough to feel alive,
// never enough to notice as an effect. Transform only (compositor-only,
// 60fps), one measurement per rAF rather than per scroll event, off under
// `prefers-reduced-motion` and coarse pointers, and stops measuring while
// off-screen. Scrolling itself is never intercepted.

interface Props {
  children: ReactNode;
  /** Pixels of travel across a full viewport of scrolling. Keep it small. */
  distance?: number;
  className?: string;
}

export default function Parallax({
  children,
  distance = 28,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(hover: none) and (pointer: coarse)');
    if (reduce.matches || coarse.matches) return;

    let frame = 0;
    let visible = true;

    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // -1 when the element is just below the fold, +1 when just above it.
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      const clamped = Math.max(-1.2, Math.min(1.2, progress));
      el.style.transform = `translate3d(0, ${(clamped * -distance).toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!visible) return;
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible) onScroll();
        },
        { rootMargin: '120px 0px' }
      );
      io.observe(el);
    }

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      io?.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      el.style.transform = '';
    };
  }, [distance]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
