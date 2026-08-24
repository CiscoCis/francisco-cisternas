'use client';

import { useEffect, useRef, ElementType, ReactNode, CSSProperties } from 'react';

// The hidden state lives behind `html.js-reveal`, added only once this code
// runs, so content never depends on animation to be readable with JS off.
// Reveals once and stops observing (no re-animating on scroll-back-up).
// Only transform and opacity are animated, so this stays on the compositor.

// 'trigger' is a no-op variant: it takes the `is-in` class on entering the
// viewport but applies no visual change of its own, for driving a bespoke
// animation on a descendant without also fading the wrapper.
type Variant = 'item' | 'group' | 'image' | 'trigger';

const CLASS: Record<Variant, string> = {
  item: 'reveal',
  group: 'reveal-group',
  image: 'reveal-img',
  trigger: 'reveal-trigger',
};

interface Props {
  children: ReactNode;
  /** 'item' — one block. 'group' — stagger the children. 'image' — settle. */
  variant?: Variant;
  /** Extra delay in ms, for ordering two blocks that share a viewport. */
  delay?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

export default function Reveal({
  children,
  variant = 'item',
  delay = 0,
  as: Tag = 'div',
  className = '',
  style,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    document.documentElement.classList.add('js-reveal');

    // No IntersectionObserver (or reduced motion): show it and move on.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Also reveal if already scrolled past (above the viewport): a
          // hash-link landing or restored scroll position moves the page
          // without the intervening frames the observer would otherwise
          // see, which would leave everything above it stuck invisible.
          const passed = entry.boundingClientRect.bottom < 0;
          if (!entry.isIntersecting && !passed) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      },
      {
        // Fire before the element reaches the fold, so the movement has
        // finished by the time it's properly in view.
        rootMargin: reduce ? '0px' : '0px 0px -12% 0px',
        threshold: 0.08,
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${CLASS[variant]}${className ? ` ${className}` : ''}`}
      style={delay ? { ...style, ['--rd' as string]: `${delay}ms` } : style}
    >
      {children}
    </Tag>
  );
}
