'use client';

import { useLayoutEffect, type RefObject } from 'react';

const ANCHOR_WIDTH = '--_menu-anchor-width';

export function useAnchorWidth(
  triggerRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel) return undefined;
    if (!enabled || !trigger) {
      panel.style.removeProperty(ANCHOR_WIDTH);
      return undefined;
    }
    const apply = () => panel.style.setProperty(ANCHOR_WIDTH, trigger.getBoundingClientRect().width + 'px');
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(trigger, { box: 'border-box' });
    return () => observer.disconnect();
  }, [enabled, triggerRef, panelRef]);
}
