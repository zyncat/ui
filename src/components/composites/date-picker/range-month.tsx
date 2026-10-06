'use client';

import { Icon } from '../../internal/icon/Icon';
import { activationProps, type ActivateOn } from '../../internal/utils/activation';
import { canTurn, DOW, grid, MONTHS, toKey } from './date-utils';
import { MonthJump } from './month-jump';
import { RangeDay } from './range-day';
import type { RangePanel } from './use-range-panel';

interface RangeMonthProps {
  panel: RangePanel;
  offset: number;
  withPrev: boolean;
  withNext: boolean;
  min?: string;
  max?: string;
  months: number;
  activateOn?: ActivateOn;
}

export function RangeMonth({ panel, offset, withPrev, withNext, min, max, months, activateOn }: RangeMonthProps) {
  const { view, viewIdx, navDir, nav, jumpToMonth } = panel;
  const base = new Date(view.y, view.m + offset, 1);
  const y = base.getFullYear(),
    m = base.getMonth();
  const cells = grid(y, m);
  return (
    <div className="zc-dtp__cal">
      <div className="zc-drp__mhead">
        {withPrev ? (
          <button
            type="button"
            className="zc-dtp__nav"
            aria-label="Previous month"
            disabled={!canTurn(y, m, -1, min, max)}
            {...activationProps<HTMLButtonElement>(() => nav(-1), { on: activateOn })}
          >
            <Icon name="caret-left" size="sm" />
          </button>
        ) : null}
        <MonthJump
          y={y}
          m={m}
          min={min}
          max={max}
          activateOn={activateOn}
          onPick={(py, pm) => jumpToMonth(py, pm, offset)}
        />
        {withNext ? (
          <button
            type="button"
            className="zc-dtp__nav"
            aria-label="Next month"
            disabled={!canTurn(y, m, 1, min, max)}
            {...activationProps<HTMLButtonElement>(() => nav(1), { on: activateOn })}
          >
            <Icon name="caret-right" size="sm" />
          </button>
        ) : null}
      </div>
      <div className="zc-dtp__dow" aria-hidden="true">
        {DOW.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div
        className="zc-dtp__days"
        role="grid"
        aria-label={MONTHS[m] + ' ' + y}
        key={'days-' + viewIdx + '-' + offset}
        data-enter={navDir || undefined}
      >
        {cells.map((d) => (
          <RangeDay key={toKey(d)} panel={panel} d={d} viewMonth={m} months={months} activateOn={activateOn} />
        ))}
      </div>
    </div>
  );
}
