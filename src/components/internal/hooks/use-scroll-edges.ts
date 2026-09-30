'use client';

import { useCallback, useEffect, useRef, type RefObject } from 'react';

export interface ScrollEdges {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export function useScrollEdges(
  ref: RefObject<HTMLElement | null>,
  onChange: (edges: ScrollEdges, el: HTMLElement) => void,
  { content = false }: { content?: boolean } = {},
): () => void {
  const cb = useRef(onChange);
  cb.current = onChange;
  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cb.current(
      {
        top: el.scrollTop > 1,
        bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 1,
        left: el.scrollLeft > 1,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
      },
      el,
    );
  }, [ref]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    const ro = new ResizeObserver(sync);
    const mo = new MutationObserver(sync);
    ro.observe(el);
    if (content && el.firstElementChild) {
      ro.observe(el.firstElementChild);
      mo.observe(el.firstElementChild, { childList: true, subtree: true });
    }
    return () => {
      el.removeEventListener('scroll', sync);
      ro.disconnect();
      mo.disconnect();
    };
  }, [sync, content]);
  return sync;
}
