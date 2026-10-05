'use client';

import { useEffect, useRef, type RefObject } from 'react';

import { useGlide } from '../../../motion/glide';
import { useScrollEdges } from '../../internal/hooks/use-scroll-edges';

export function useRowGlide(scrollRef: RefObject<HTMLDivElement | null>) {
  const tableRef = useRef<HTMLTableElement>(null);
  const hoveredRef = useRef<HTMLElement | null>(null);
  const glide = useGlide(scrollRef);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return undefined;
    const follow = new ResizeObserver(() => glide.enter(hoveredRef.current));
    follow.observe(table);
    return () => follow.disconnect();
  }, [glide]);

  function hoverRow(row: Element | null) {
    hoveredRef.current = row instanceof HTMLElement ? row : null;
    glide.enter(hoveredRef.current);
  }
  function leaveRows() {
    hoveredRef.current = null;
    glide.leave();
  }

  return { tableRef, glide, hoverRow, leaveRows };
}

export function useEdgeAttributes(
  scrollRef: RefObject<HTMLDivElement | null>,
  wrapRef: RefObject<HTMLDivElement | null>,
) {
  useScrollEdges(
    scrollRef,
    (edges, el) => {
      const w = wrapRef.current;
      if (!w) return;
      const set = (attr: string, on: boolean) => {
        if (on) w.setAttribute(attr, '');
        else w.removeAttribute(attr);
      };
      set('data-scrolled', el.scrollTop > 0);
      set('data-y-scroll', el.scrollHeight > el.clientHeight);
      set('data-x-back', edges.left);
      set('data-x-more', edges.right);
    },
    { content: true },
  );
}
