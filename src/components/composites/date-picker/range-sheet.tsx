'use client';

import './date-picker.css';
import './range-sheet.css';
import './range-sheet-days.css';

import { useLayoutEffect, useRef, type RefObject } from 'react';

import { animate, type Playback } from '../../../engine';
import { GlidePill } from '../../../motion/glide';
import { motionFor } from '../../../tokens/motion-tokens';
import type { ActivateOn } from '../../internal/utils/activation';
import { Button } from '../../primitives/button/Button';
import { monthSwipe } from './month-swipe';
import { RangeMonth } from './range-month';
import { RangePresets } from './range-presets';
import { RangeSummary } from './range-summary';
import { useRangePanel, type RangeOptions } from './use-range-panel';

interface DrpSheetProps extends Omit<RangeOptions, 'months'> {
  title: string;
  timezone?: string;
  activateOn?: ActivateOn;
}

function useHeightGlide(ref: RefObject<HTMLElement | null>, viewIdx: number) {
  const settled = useRef(0);
  const flight = useRef<Playback | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = flight.current ? el.offsetHeight : settled.current;
    flight.current?.stop();
    settled.current = el.offsetHeight;
    if (!from || from === settled.current) return;
    const glide = animate(el, { height: [from, 'auto'], timing: motionFor(el).t.settle });
    flight.current = glide;
    glide?.finished.then(() => {
      if (flight.current === glide) flight.current = null;
    });
  }, [ref, viewIdx]);
}

export function DrpSheet({ value, commit, close, min, max, maxDays, title, timezone, activateOn }: DrpSheetProps) {
  const panel = useRangePanel({ value, commit, close, min, max, maxDays, months: 1 });
  const { anchor, setHoverKey, daysRef, onGridKeyDown, gridGlide } = panel;
  useHeightGlide(daysRef, panel.viewIdx);
  return (
    <div className="zc-drp zc-drp--sheet" role="dialog" aria-label={title}>
      <RangeSummary panel={panel} title={title} timezone={timezone} />
      <RangePresets draft={panel.draft} fits={panel.fits} onPick={panel.applyPreset} activateOn={activateOn} />
      <div
        className="zc-drp__months"
        ref={daysRef}
        onKeyDown={onGridKeyDown}
        onPointerDown={monthSwipe(panel, min, max)}
        onPointerLeave={() => {
          if (anchor) setHoverKey(anchor);
          gridGlide.leave();
        }}
      >
        <RangeMonth panel={panel} offset={0} withPrev withNext min={min} max={max} months={1} activateOn={activateOn} />
        <GlidePill className="zc-dtp__hover" glide={gridGlide} />
      </div>
      <div className="zc-drp__foot">
        <Button variant="secondary" size="xl" fullWidth onClick={panel.done}>
          Done
        </Button>
      </div>
    </div>
  );
}
