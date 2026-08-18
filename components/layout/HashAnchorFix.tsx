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

  /**
   * The same correction, for in-page anchor clicks.
   *
   * A long jump drifts for the same reason a deep link does: the browser picks a
   * scroll target using the ESTIMATED heights that `content-visibility: auto`
   * reports for sections it hasn't rendered yet, then those sections render at
   * their real heights while the smooth scroll is still in flight and the target
   * moves out from under it. Measured on the hero's link to #social — the longest
   * jump on the page — it landed 472px short.
   *
   * It self-corrects after one full pass of the page, because
   * `contain-intrinsic-size: auto` remembers real heights once measured. That is
   * exactly why it only bites the first time and is easy to miss.
   *
   * So: wait for the scroll to actually stop, then re-land once if it drifted.
   * Aborts if the reader takes over.
   */
  useEffect(() => {
    let frame = 0;

    const onHashChange = () => {
      const raw = window.location.hash;
      if (raw.length < 2) return;

      let target: HTMLElement | null = null;
      try {
        target = document.getElementById(decodeURIComponent(raw.slice(1)));
      } catch {
        return;
      }
      if (!target) return;

      let taken = false;
      const takeOver = () => {
        taken = true;
      };
      window.addEventListener('wheel', takeOver, { passive: true, once: true });
      window.addEventListener('touchstart', takeOver, { passive: true, once: true });

      let lastY = Number.NaN;
      let stillFor = 0;

      const settle = () => {
        if (taken) return;

        const y = window.scrollY;
        if (y === lastY) stillFor += 1;
        else {
          stillFor = 0;
          lastY = y;
        }

        // ~6 frames of no movement means the smooth scroll has finished.
        if (stillFor < 6) {
          frame = window.requestAnimationFrame(settle);
          return;
        }

        // `scrollIntoView({ block: 'start' })` honours scroll-margin-top, so a
        // correct landing puts the element exactly that far from the top.
        const expected = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        if (Math.abs(target.getBoundingClientRect().top - expected) > 8) {
          target.scrollIntoView({ behavior: 'auto', block: 'start' });
        }

        window.removeEventListener('wheel', takeOver);
        window.removeEventListener('touchstart', takeOver);
      };

      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(settle);
    };

    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  return null;
}
