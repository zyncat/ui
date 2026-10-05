'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

import { animate, set } from '../../../engine';
import { motionFor } from '../../../tokens/motion-tokens';
import { useScrollEdges } from '../../internal/hooks/use-scroll-edges';

const TABS_EDGE_PAD = 24;

export function useInk(listRef: RefObject<HTMLDivElement | null>, value: string | null | undefined, count: number) {
  const inkRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const placedRef = useRef(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  const place = (animated: boolean) => {
    const list = listRef.current,
      ink = inkRef.current;
    const el = valueRef.current != null ? tabRefs.current[valueRef.current] : null;
    if (!list || !ink) return;
    if (!el) {
      ink.style.opacity = '0';
      placedRef.current = false;
      return;
    }
    const next = { x: el.offsetLeft, w: el.offsetWidth };
    ink.style.opacity = '1';

    const motion = motionFor(list);

    if (!animated || !placedRef.current || motion.reduced) {
      set(ink, { x: [next.x], width: [next.w] });
    } else {
      const lr = list.getBoundingClientRect();
      const ir = ink.getBoundingClientRect();
      const cur = { x: ir.left - lr.left + list.scrollLeft, w: ir.width };
      if (Math.abs(cur.x - next.x) > 0.5 || Math.abs(cur.w - next.w) > 0.5) {
        const dir = next.x + next.w / 2 >= cur.x + cur.w / 2 ? 1 : -1;
        const span = dir === 1 ? next.x + next.w - cur.x : cur.x + cur.w - next.x;
        const lead = dir === 1 ? cur.x : next.x;
        animate(ink, {
          x: [cur.x, lead, next.x],
          width: [cur.w, span, next.w],
          timing: {
            duration: motion.dur.slow,
            times: [0, 0.55, 1],
            ease: [motion.ease.standard, motion.ease.entrance],
          },
        });
      }
    }
    placedRef.current = true;
  };

  const syncEdges = useScrollEdges(listRef, (edges, el) => {
    el.dataset.fade = ((edges.left ? 'start ' : '') + (edges.right ? 'end' : '')).trim();
  });

  useLayoutEffect(() => {
    place(true);
    const l = listRef.current,
      el = value != null ? tabRefs.current[value] : null;
    if (l && el && l.scrollWidth > l.clientWidth) {
      const behavior: ScrollBehavior = motionFor(l).reduced ? 'auto' : 'smooth';
      if (el.offsetLeft < l.scrollLeft + TABS_EDGE_PAD) {
        l.scrollTo({ left: el.offsetLeft - TABS_EDGE_PAD, behavior });
      } else if (el.offsetLeft + el.offsetWidth > l.scrollLeft + l.clientWidth - TABS_EDGE_PAD) {
        l.scrollTo({ left: el.offsetLeft + el.offsetWidth - l.clientWidth + TABS_EDGE_PAD, behavior });
      }
    }
  }, [value]);

  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => {
      place(false);
      syncEdges();
    });
    if (listRef.current) ro.observe(listRef.current);
    Object.values(tabRefs.current).forEach((el) => el && ro.observe(el));
    syncEdges();
    return () => ro.disconnect();
  }, [count]); // eslint-disable-line react-hooks/exhaustive-deps

  return { inkRef, tabRefs };
}
