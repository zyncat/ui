'use client';

import { useLayoutEffect, useRef } from 'react';

import { GlidePill, useGlide } from '../../../motion/glide';
import { useScrollEdges } from '../../internal/hooks/use-scroll-edges';
import { activationProps, type ActivateOn } from '../../internal/utils/activation';
import { add, MONTHS, pad, parse, today, toKey } from './date-utils';

/** A date range as wall-clock 'YYYY-MM-DD' endpoints, inclusive. */
export interface DateRange {
  /** Range start, inclusive - `'YYYY-MM-DD'`. */
  start: string;
  /** Range end, inclusive - `'YYYY-MM-DD'`. Never before `start`. */
  end: string;
}

export interface DrpPreset {
  id: string;
  label: string;
  start: string;
  end: string;
}

function drpDisplay(key: string, withYear: boolean): string {
  const d = parse(key);
  const mon = MONTHS[d.getMonth()].slice(0, 3);
  return mon + ' ' + pad(d.getDate()) + (withYear ? ', ' + d.getFullYear() : '');
}
export function drpRangeText(start: string, end: string): string {
  const sameYear = parse(start).getFullYear() === parse(end).getFullYear();
  const curYear = new Date().getFullYear();
  const startYr = !sameYear || parse(start).getFullYear() !== curYear;
  const endYr = parse(end).getFullYear() !== curYear;
  return drpDisplay(start, startYr) + ' - ' + drpDisplay(end, endYr);
}
export const drpDays = (start: string, end: string): number => Math.round((+parse(end) - +parse(start)) / 86400000) + 1;

function drpPresets(): DrpPreset[] {
  const t = today();
  const now = new Date();
  const firstThis = toKey(new Date(now.getFullYear(), now.getMonth(), 1));
  const firstPrev = toKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const lastPrev = toKey(new Date(now.getFullYear(), now.getMonth(), 0));
  const jan1 = toKey(new Date(now.getFullYear(), 0, 1));
  return [
    { id: 'today', label: 'Today', start: t, end: t },
    { id: 'yest', label: 'Yesterday', start: add(t, -1), end: add(t, -1) },
    { id: '7d', label: 'Last 7 days', start: add(t, -6), end: t },
    { id: '30d', label: 'Last 30 days', start: add(t, -29), end: t },
    { id: 'mtd', label: 'This month', start: firstThis, end: t },
    { id: 'lastm', label: 'Last month', start: firstPrev, end: lastPrev },
    { id: '90d', label: 'Last 90 days', start: add(t, -89), end: t },
    { id: 'ytd', label: 'Year to date', start: jan1, end: t },
  ];
}

interface RangePresetsProps {
  draft: DateRange | null;
  fits: (p: DrpPreset) => boolean;
  onPick: (p: DrpPreset) => void;
  activateOn?: ActivateOn;
}

export function RangePresets({ draft, fits, onPick, activateOn }: RangePresetsProps) {
  const presetsRef = useRef<HTMLDivElement>(null);
  const presetGlide = useGlide(presetsRef);
  const presets = drpPresets();
  useLayoutEffect(() => {
    const strip = presetsRef.current;
    const chip = strip && strip.querySelector<HTMLElement>('.zc-is-active');
    if (strip && chip) strip.scrollLeft = chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2;
  }, []);
  useScrollEdges(presetsRef, (edges, el) => {
    el.dataset.fade = ((edges.left ? 'start ' : '') + (edges.right ? 'end' : '')).trim();
  });
  function presetActive(p: DrpPreset): boolean {
    return draft && draft.start === p.start && draft.end === p.end;
  }

  return (
    <div
      className="zc-drp__presets"
      role="group"
      aria-label="Quick ranges"
      ref={presetsRef}
      onPointerLeave={presetGlide.leave}
    >
      {presets.map((p) => (
        <button
          key={p.id}
          type="button"
          className={'zc-drp__preset' + (presetActive(p) ? ' zc-is-active' : '')}
          disabled={!fits(p)}
          onPointerEnter={(e) => (e.currentTarget.disabled ? presetGlide.leave() : presetGlide.enter(e.currentTarget))}
          {...activationProps<HTMLButtonElement>(() => onPick(p), { on: activateOn })}
        >
          {p.label}
        </button>
      ))}
      <GlidePill className="zc-drp__presetGlide" glide={presetGlide} />
    </div>
  );
}
