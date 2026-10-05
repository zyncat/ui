'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';

import { useGlide } from '../../../motion/glide';
import { add, clampKey, parse, today, toKey, within } from './date-utils';
import { drpDays, type DateRange, type DrpPreset } from './range-presets';
import { useDayFocus } from './use-day-focus';
import { useMonthView } from './use-month-view';

export interface RangeOptions {
  value: DateRange | null;
  commit: (value: DateRange) => void;
  close: () => void;
  min?: string;
  max?: string;
  maxDays?: number;
  months: number;
}

export function useRangePanel({ value, commit, close, min, max, maxDays, months }: RangeOptions) {
  const seedKey = (value && value.start) || today();
  const seed = parse(seedKey);
  const { view, setView, viewIdx, nav, navDir, jumpToMonth } = useMonthView(seed);

  const [draft, setDraft] = useState(value);
  const [anchor, setAnchor] = useState<string | null>(null);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [focusKey, setFocusKey] = useState<string>(seedKey);

  const daysRef = useRef<HTMLDivElement>(null);
  const armFocus = useDayFocus(daysRef, focusKey, viewIdx);

  const uid = useId();
  const gridGlide = useGlide(daysRef);
  const capLoId = 'drp-cap-lo-' + uid;
  const capHiId = 'drp-cap-hi-' + uid;

  const floor = anchor && maxDays ? clampKey(add(anchor, 1 - maxDays), min, max) : min;
  const ceil = anchor && maxDays ? clampKey(add(anchor, maxDays - 1), min, max) : max;
  const inBounds = (key: string): boolean => within(key, floor, ceil);
  const fits = (p: DrpPreset): boolean =>
    within(p.start, min, max) && within(p.end, min, max) && !(maxDays && drpDays(p.start, p.end) > maxDays);

  let lo: string | null = null,
    hi: string | null = null,
    provisional = false;
  if (anchor) {
    const other = clampKey(hoverKey || anchor, floor, ceil);
    lo = anchor < other ? anchor : other;
    hi = anchor < other ? other : anchor;
    provisional = true;
  } else if (draft && draft.start && draft.end) {
    lo = draft.start;
    hi = draft.end;
  }

  function pickDay(key: string) {
    if (!inBounds(key)) return;
    if (!anchor) {
      setAnchor(key);
      setHoverKey(key);
    } else {
      const start = anchor < key ? anchor : key;
      const end = anchor < key ? key : anchor;
      setAnchor(null);
      setHoverKey(null);
      setDraft({ start: start, end: end });
    }
  }

  function applyPreset(p: DrpPreset) {
    setAnchor(null);
    setHoverKey(null);
    const d = parse(p.start);
    setView({ y: d.getFullYear(), m: d.getMonth() });
    setFocusKey(p.start);
    setDraft({ start: p.start, end: p.end });
  }

  function done() {
    if (lo && hi && !(value && value.start === lo && value.end === hi)) commit({ start: lo, end: hi });
    close();
  }

  function moveFocus(deltaDays: number, deltaMonths = 0) {
    const d = parse(focusKey);
    if (deltaMonths) d.setMonth(d.getMonth() + deltaMonths);
    if (deltaDays) d.setDate(d.getDate() + deltaDays);
    const key = toKey(d);
    armFocus();
    setFocusKey(key);
    if (anchor) setHoverKey(key);
    const idx = d.getFullYear() * 12 + d.getMonth();
    const last = viewIdx + (months - 1);
    if (idx < viewIdx) setView({ y: d.getFullYear(), m: d.getMonth() });
    else if (idx > last) {
      const back = new Date(d.getFullYear(), d.getMonth() - (months - 1), 1);
      setView({ y: back.getFullYear(), m: back.getMonth() });
    }
  }
  function onGridKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const k = e.key;
    if (k === 'ArrowLeft') moveFocus(-1);
    else if (k === 'ArrowRight') moveFocus(1);
    else if (k === 'ArrowUp') moveFocus(-7);
    else if (k === 'ArrowDown') moveFocus(7);
    else if (k === 'PageUp') moveFocus(0, -1);
    else if (k === 'PageDown') moveFocus(0, 1);
    else if (k === 'Enter' || k === ' ') pickDay(focusKey);
    else if (k === 'Escape' && anchor) {
      setAnchor(null);
      setHoverKey(null);
    } else return;
    e.preventDefault();
  }

  return {
    view,
    viewIdx,
    navDir,
    nav,
    jumpToMonth,
    draft,
    anchor,
    focusKey,
    setHoverKey,
    daysRef,
    gridGlide,
    capLoId,
    capHiId,
    inBounds,
    fits,
    lo,
    hi,
    provisional,
    pickDay,
    applyPreset,
    done,
    onGridKeyDown,
    todayKey: today(),
  };
}

export type RangePanel = ReturnType<typeof useRangePanel>;
