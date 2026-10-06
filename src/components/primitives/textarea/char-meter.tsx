'use client';

import { cx } from '../../internal/utils/cx';

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
    <span className={cx('zc-txa__count', state)}>{over || remaining <= warnAt ? remaining : `${count} / ${max}`}</span>
  );
}
