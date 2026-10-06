'use client';

import { Motion } from '../../../motion/element';
import { UIMotion } from '../../../tokens/motion-tokens';
import { activationProps, type ActivateOn } from '../../internal/utils/activation';
import { col, MONTHS, toKey } from './date-utils';
import type { RangePanel } from './use-range-panel';

const CAP_FLIP = { timing: UIMotion.t.settle };

interface RangeDayProps {
  panel: RangePanel;
  d: Date;
  viewMonth: number;
  months: number;
  activateOn?: ActivateOn;
}

export function RangeDay({ panel, d, viewMonth, months, activateOn }: RangeDayProps) {
  const {
    lo,
    hi,
    provisional,
    anchor,
    focusKey,
    inBounds,
    pickDay,
    setHoverKey,
    gridGlide,
    capLoId,
    capHiId,
    todayKey,
  } = panel;
  const key = toKey(d);
  const out = d.getMonth() !== viewMonth;
  if (out && months === 1) return <span aria-hidden="true"></span>;
  const disabled = !inBounds(key);
  const dayCol = col(d);

  const isLo = lo && key === lo;
  const isHi = hi && key === hi;
  const single = lo && hi && lo === hi;
  const inRange = lo && hi && key >= lo && key <= hi;
  const loGhost = provisional && isLo && lo !== anchor;
  const hiGhost = provisional && isHi && !single && hi !== anchor;

  const band = inRange && !single;
  const fadeL = band && months === 1 && !isLo && d.getDate() === 1;
  const fadeR =
    band && months === 1 && !isHi && new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() === d.getDate();
  const extL = band && !isLo && dayCol !== 0 && !fadeL;
  const extR = band && !isHi && dayCol !== 6 && !fadeR;

  const capHere = months === 1 || !out;
  const loCap = isLo && capHere;
  const hiCap = isHi && !single && capHere;

  const cls = ['zc-dtp__day'];
  if (out) cls.push('zc-is-out');
  if (inRange) cls.push('zc-is-in-range');
  if ((loGhost || hiGhost) && capHere) cls.push('zc-is-cap-ghost');
  else if (loCap || hiCap) cls.push('zc-is-cap');

  const bandCls = ['zc-drp__band'];
  if (extL) bandCls.push('zc-drp__band--extL');
  if (extR) bandCls.push('zc-drp__band--extR');
  if (fadeL) bandCls.push('zc-drp__band--fadeL');
  else if (!extL) bandCls.push('zc-drp__band--roundL');
  if (fadeR) bandCls.push('zc-drp__band--fadeR');
  else if (!extR) bandCls.push('zc-drp__band--roundR');

  return (
    <button
      type="button"
      role="gridcell"
      data-key={key}
      className={cls.join(' ')}
      disabled={disabled}
      tabIndex={key === focusKey ? 0 : -1}
      aria-label={MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear()}
      aria-selected={isLo || isHi || undefined}
      {...activationProps<HTMLButtonElement>(() => pickDay(key), { on: activateOn })}
      onPointerEnter={(e) => {
        setHoverKey(key);
        if (!anchor && !disabled) gridGlide.enter(e.currentTarget);
        else gridGlide.leave();
      }}
    >
      {band ? <span className={bandCls.join(' ')} aria-hidden="true"></span> : null}
      {loCap ? (
        <Motion
          as="span"
          layoutId={capLoId}
          layoutTransition={CAP_FLIP}
          className={'zc-drp__cap' + (loGhost ? ' zc-drp__cap--ghost' : '')}
          aria-hidden="true"
        />
      ) : null}
      {hiCap ? (
        <Motion
          as="span"
          layoutId={capHiId}
          layoutTransition={CAP_FLIP}
          className={'zc-drp__cap' + (hiGhost ? ' zc-drp__cap--ghost' : '')}
          aria-hidden="true"
        />
      ) : null}
      <span className="zc-dtp__num">{d.getDate()}</span>
      {key === todayKey ? <span className="zc-dtp__dot" aria-hidden="true"></span> : null}
    </button>
  );
}
