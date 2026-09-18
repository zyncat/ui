'use client';

import type { CSSProperties } from 'react';

import { cx } from '../../internal/utils/cx';

const RING_C = (2 * Math.PI * 7).toFixed(2);

export interface CharMeterProps {
  count: number;
  max: number;
  warnAt: number;
}

export function CharMeter({ count, max, warnAt }: CharMeterProps) {
  const over = Math.max(count - max, 0);
  const remaining = max - count;
  const state = over ? 'zc-is-over' : remaining <= warnAt ? 'zc-is-near' : '';

  return (
    <span className={cx('zc-txa__meter', state)}>
      <span className="zc-txa__count">{over || remaining <= warnAt ? remaining : `${count} / ${max}`}</span>
      <svg
        className="zc-txa__ring"
        viewBox="0 0 16 16"
        aria-hidden="true"
        style={{ '--txa-ring-c': RING_C, '--txa-ring-p': Math.min(count / max, 1) } as CSSProperties}
      >
        <circle className="zc-txa__ring-trk" cx="8" cy="8" r="7" />
        <circle className="zc-txa__ring-prg" cx="8" cy="8" r="7" />
      </svg>
    </span>
  );
}
