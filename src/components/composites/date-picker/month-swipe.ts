'use client';

import type { PointerEvent } from 'react';

import { animate, set, startDrag } from '../../../engine';
import { motionFor } from '../../../tokens/motion-tokens';
import { canTurn } from './date-utils';
import type { RangePanel } from './use-range-panel';

const INTENT_PX = 8;
const TURN_PX = 56;
const TURN_VELOCITY = 400;
const RESIST = 0.4;
const EDGE_RESIST = 0.15;

export function monthSwipe({ view, nav, gridGlide }: RangePanel, min?: string, max?: string) {
  return function onPointerDown(e: PointerEvent<HTMLElement>) {
    const grid = e.currentTarget.querySelector<HTMLElement>('.zc-dtp__days');
    if (e.pointerType !== 'touch' || !e.isPrimary || !grid) return;
    const dirOf = (dx: number) => (dx < 0 ? 1 : -1);
    const turnable = (dx: number) => canTurn(view.y, view.m, dirOf(dx), min, max);
    let along = false;
    const stop = startDrag(e, {
      onMove({ offset }) {
        if (!along) {
          if (Math.max(Math.abs(offset.x), Math.abs(offset.y)) < INTENT_PX) return;
          if (Math.abs(offset.x) <= Math.abs(offset.y)) return stop();
          along = true;
          gridGlide.leave();
        }
        set(grid, { x: [offset.x * (turnable(offset.x) ? RESIST : EDGE_RESIST)] });
      },
      onEnd({ offset, velocity }) {
        if (!along) return;
        const flung = Math.abs(velocity.x) > TURN_VELOCITY && Math.sign(velocity.x) === Math.sign(offset.x);
        if ((flung || Math.abs(offset.x) > TURN_PX) && turnable(offset.x)) nav(dirOf(offset.x));
        else animate(grid, { x: [0], timing: { ...motionFor(grid).t.settle, release: true } });
      },
    });
  };
}
