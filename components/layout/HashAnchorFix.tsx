'use client';

import { useEffect } from 'react';

/**
 * Re-lands a deep link on its target after the page has finished settling.
 *
 * The browser scrolls to `#accessories` as soon as it parses the element — before
 * fonts swap, before lazy images decode, and before `content-visibility: auto`
 * sections above the target render for the first time. All of that grows the
 * document underneath the landing position, so the section drifts off-screen and
 * the page appears to have ignored the hash.
 *
 * So: scroll once on the next paint, then once more on `load`, when fonts and
 * images have settled. Both are instant (`behavior: 'auto'`) — a smooth animation
 * here would visibly fight the browser's own initial jump.
 *
 * If the reader scrolls before `load` fires, the second correction is abandoned.
 * Yanking someone back to an anchor they have already scrolled away from is worse
 * than landing slightly off.
 *
 * Renders nothing.
 */
export function HashAnchorFix() {
  useEffect(() => {
    const raw = window.location.hash;
    if (raw.length < 2) return;

    let id: string;
    try {
      id = decodeURIComponent(raw.slice(1));
    } catch {
      // A malformed hash is not worth throwing over.
      return;
    }

    const target = document.getElementById(id);
    if (!target) return;

    const land = () => target.scrollIntoView({ behavior: 'auto', block: 'start' });

    let cancelled = false;
    const onUserScroll = () => {
      cancelled = true;
    };

    // Two frames: the first commits the current layout, the second runs after it
    // has painted.
    const outer = window.requestAnimationFrame(() => {
      const inner = window.requestAnimationFrame(land);
      frames.push(inner);
    });
    const frames: number[] = [outer];

    const onLoad = () => {
      if (!cancelled) land();
    };

    // `wheel`/`touchstart` catch intent even before the scroll position moves.
    window.addEventListener('wheel', onUserScroll, { passive: true, once: true });
    window.addEventListener('touchstart', onUserScroll, { passive: true, once: true });
    window.addEventListener('keydown', onUserScroll, { once: true });

    if (document.readyState === 'complete') {
      // Already loaded (client-side nav): the next-paint pass is enough.
    } else {
      window.addEventListener('load', onLoad, { once: true });
    }

    return () => {
      for (const frame of frames) window.cancelAnimationFrame(frame);
      window.removeEventListener('wheel', onUserScroll);
      window.removeEventListener('touchstart', onUserScroll);
      window.removeEventListener('keydown', onUserScroll);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  return null;
}
