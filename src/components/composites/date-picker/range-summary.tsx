'use client';

import './range-summary.css';

import { animate } from '../../../engine';
import { Motion } from '../../../motion/element';
import { motionFor } from '../../../tokens/motion-tokens';
import { Icon } from '../../internal/icon/Icon';
import { Badge } from '../../primitives/badge/Badge';
import { displayDay, tzLabel } from './date-utils';
import { drpDays } from './range-presets';
import type { RangePanel } from './use-range-panel';

function dateIn(el: HTMLElement) {
  const motion = motionFor(el);
  return animate(el, { y: [motion.dist.sm, 0], opacity: [0, 1], timing: motion.t.enter });
}

interface TileProps {
  role: string;
  day: string | null;
  active: boolean;
}

function Tile({ role, day, active }: TileProps) {
  return (
    <span className={'zc-drp__tile' + (active ? ' zc-is-active' : '')}>
      <span className="zc-drp__tileRole">{role}</span>
      <Motion
        as="span"
        className={'zc-drp__tileDate' + (day ? '' : ' zc-is-empty')}
        animate={dateIn}
        deps={[day]}
        initial={false}
      >
        {displayDay(day) || (active ? 'Pick a day' : 'Not set')}
      </Motion>
    </span>
  );
}

interface RangeSummaryProps {
  panel: RangePanel;
  title: string;
  timezone?: string;
}

export function RangeSummary({ panel, title, timezone }: RangeSummaryProps) {
  const { lo, hi, anchor, provisional } = panel;
  const end = provisional && lo === hi ? null : hi;
  const total = lo && end ? drpDays(lo, end) : 0;
  const endMoving = provisional && lo === anchor;
  return (
    <div className="zc-drp__summary">
      <div className="zc-drp__head">
        <span className="zc-drp__heading">
          <span className="zc-drp__title">{title}</span>
          {timezone ? <span className="zc-drp__tz">{tzLabel(timezone)}</span> : null}
        </span>
        {total ? <Badge value={total + (total === 1 ? ' day' : ' days')} pill /> : null}
      </div>
      <div className="zc-drp__tiles" aria-live="polite">
        <Tile role="Start" day={lo} active={!endMoving} />
        <Icon name="caret-right" size="sm" className="zc-drp__arrow" />
        <Tile role="End" day={end} active={endMoving} />
      </div>
    </div>
  );
}
