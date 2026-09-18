'use client';

export interface AnchorMoveTracker {
  resync: () => void;
  stop: () => void;
}

const sameRect = (a: DOMRect, b: DOMRect) =>
  a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height;

export function trackAnchorMove(el: Element, onMove: () => void): AnchorMoveTracker {
  let io: IntersectionObserver | null = null;
  let stopped = false;

  const release = () => {
    io?.disconnect();
    io = null;
  };

  const arm = (silent: boolean, threshold: number) => {
    release();
    if (stopped) return;

    const view = el.ownerDocument.documentElement;
    const rect = el.getBoundingClientRect();
    const { left, top, width, height } = rect;

    if (!silent) onMove();
    if (!width || !height) return;

    const rootMargin = [
      -Math.floor(top),
      -Math.floor(view.clientWidth - (left + width)),
      -Math.floor(view.clientHeight - (top + height)),
      -Math.floor(left),
    ]
      .map((inset) => `${inset}px`)
      .join(' ');

    let settling = true;
    io = new IntersectionObserver(
      (entries) => {
        const ratio = entries[entries.length - 1].intersectionRatio;
        if (ratio !== threshold) {
          if (!settling) arm(false, 1);
          else if (ratio > 0) arm(false, ratio);
          else release();
          return;
        }
        settling = false;
        if (ratio === 1 && !sameRect(rect, el.getBoundingClientRect())) arm(false, 1);
      },
      { root: el.ownerDocument, rootMargin, threshold },
    );
    io.observe(el);
  };

  arm(true, 1);

  return {
    resync: () => {
      if (!io) arm(true, 1);
    },
    stop: () => {
      stopped = true;
      release();
    },
  };
}
