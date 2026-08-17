'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';

/**
 * Fires once when the element first crosses into view.
 *
 * This is the engine behind <Reveal />, <StaggerText /> and the GoldRibbon draw.
 * Deliberately not Framer Motion: these run on nearly every section including
 * above the fold, so the entry animation has to cost ~0 KB on the LCP path.
 * The hook only flips a data attribute — the animation itself is CSS.
 */
export function useInView<T extends Element>(options?: {
  rootMargin?: string;
  threshold?: number;
}): { ref: RefObject<T | null>; inView: boolean } {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  // Commits slightly before the element enters, so a fast scroll can't outrun
  // the observer and leave a band of the page blank.
  const rootMargin = options?.rootMargin ?? '0px 0px -10% 0px';
  const threshold = options?.threshold ?? 0;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // No IntersectionObserver, or reduced motion: show content immediately
    // rather than leaving it stuck at opacity 0.
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setInView(true);
      return;
    }

    // Already scrolled past — the element is above the viewport top and will
    // never intersect again on a downward scroll. Deep links and restored scroll
    // positions land here, and without this the content stays hidden for good.
    if (element.getBoundingClientRect().bottom <= 0) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref, inView };
}
