'use client';

import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';

import { animate, set, startDrag, type PanInfo } from '../../../engine';
import { UIMotion } from '../../../tokens/motion-tokens';

const SM = UIMotion;

const DISMISS_RATIO = 0.4;
const DISMISS_VELOCITY = 500;
const INTENT_PX = 4;
const TOUCH_INTENT_PX = 8;
const STRETCH_MAX = 0.06;

function findScrollable(node: EventTarget | null, stop: HTMLElement | null): HTMLElement | null {
  let el = node instanceof Element ? node : null;
  while (el && el !== stop) {
    const s = getComputedStyle(el);
    if (
      /(auto|scroll)/.test(s.overflowY + s.overflowX) &&
      (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)
    )
      return el as HTMLElement;
    el = el.parentElement;
  }
  return null;
}

function sheetScrim(panel: HTMLElement | null): HTMLElement | null {
  return panel?.parentElement?.querySelector<HTMLElement>('.zc-overlay-scrim') ?? null;
}

function sheetSpan(panel: HTMLElement, side: 'right' | 'bottom'): number {
  return side === 'bottom' ? panel.offsetHeight : panel.offsetWidth;
}

export function useSheetDrag({
  side,
  panelRef,
  enabled,
  requestClose,
}: {
  side: 'right' | 'bottom';
  panelRef: RefObject<HTMLElement>;
  enabled: boolean;
  requestClose: () => void;
}) {
  const axis = side === 'bottom' ? 'y' : 'x';
  const savedUserSelect = useRef<string | null>(null);
  const span = useRef(1);
  const dragging = useRef(false);

  useEffect(() => {
    const panel = panelRef.current;
    if (!enabled || !panel) return undefined;
    const holdPan = (e: TouchEvent) => {
      if (dragging.current) e.preventDefault();
    };
    panel.addEventListener('touchmove', holdPan, { passive: false });
    return () => panel.removeEventListener('touchmove', holdPan);
  }, [enabled, panelRef]);

  function suspendSelection() {
    const sel = window.getSelection();
    if (sel) sel.removeAllRanges();
    savedUserSelect.current = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
  }
  function restoreSelection() {
    if (savedUserSelect.current === null) return;
    document.body.style.userSelect = savedUserSelect.current;
    savedUserSelect.current = null;
  }
  useEffect(() => restoreSelection, []); // eslint-disable-line react-hooks/exhaustive-deps

  function paint(el: HTMLElement, travel: number, stretch: number) {
    const stretched: [number, number] = axis === 'y' ? [1, stretch] : [stretch, 1];
    set(el, { x: [axis === 'y' ? 0 : travel], y: [axis === 'y' ? travel : 0], scale: [stretched] });
    const scrim = sheetScrim(el);
    if (scrim) set(scrim, { opacity: [1 - Math.min(Math.max(travel / span.current, 0), 1)] });
  }

  function onPointerDown(e: ReactPointerEvent) {
    if (e.button !== 0 || !e.isPrimary) return;
    const startX = e.clientX,
      startY = e.clientY;
    const intent = e.pointerType === 'touch' ? TOUCH_INTENT_PX : INTENT_PX;
    const scrollable = findScrollable(e.target, panelRef.current);

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX,
        dy = ev.clientY - startY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < intent) return;
      cleanup();
      const along = axis === 'y' ? dy : dx;
      const cross = axis === 'y' ? dx : dy;
      if (Math.abs(along) <= Math.abs(cross)) return;
      if (scrollable) {
        if (along < 0) return;
        if (axis === 'y' ? scrollable.scrollTop > 0 : scrollable.scrollLeft > 0) return;
      }
      if (!panelRef.current) return;
      span.current = sheetSpan(panelRef.current, side);
      suspendSelection();
      dragging.current = true;
      startDrag(ev, { onMove: onDrag, onEnd: onDragEnd });
    };

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', cleanup);
      window.removeEventListener('pointercancel', cleanup);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', cleanup);
    window.addEventListener('pointercancel', cleanup);
  }

  function onDrag(info: PanInfo) {
    const el = panelRef.current;
    if (!el) return;
    const o = info.offset[axis];
    paint(el, Math.max(o, 0), o < 0 ? 1 + Math.min(-o / span.current, 1) * STRETCH_MAX : 1);
  }

  function onDragEnd(info: PanInfo) {
    dragging.current = false;
    restoreSelection();
    const el = panelRef.current;
    if (!el) return;
    if (info.offset[axis] > span.current * DISMISS_RATIO || info.velocity[axis] > DISMISS_VELOCITY) {
      requestClose();
      return;
    }
    const settle = { ...SM.t.settle, release: true };
    animate(el, { x: [0], y: [0], scale: [[1, 1]], timing: settle });
    const scrim = sheetScrim(el);
    if (scrim) animate(scrim, { opacity: [1], timing: settle });
  }

  return enabled ? { onPointerDown, 'data-drag': '' } : {};
}
