'use client';

import './date-picker.css';

import { Fragment } from 'react';

import { GlidePill } from '../../../motion/glide';
import type { ActivateOn } from '../../internal/utils/activation';
import { Button } from '../../primitives/button/Button';
import { tzLabel } from './date-utils';
import { RangeMonth } from './range-month';
import { drpDays, drpRangeText, RangePresets } from './range-presets';
import { useRangePanel, type RangeOptions } from './use-range-panel';

const MONTHS_SHOWN = 2;

interface DrpPanelProps extends Omit<RangeOptions, 'months'> {
  timezone?: string;
  label?: string;
  activateOn?: ActivateOn;
}

export function DrpPanel({ value, commit, close, min, max, maxDays, timezone, label, activateOn }: DrpPanelProps) {
  const panel = useRangePanel({ value, commit, close, min, max, maxDays, months: MONTHS_SHOWN });
  const { anchor, setHoverKey, daysRef, onGridKeyDown, gridGlide, lo, hi, done } = panel;
  const renderMonth = (offset: number, withPrev: boolean, withNext: boolean) => (
    <RangeMonth
      key={offset}
      panel={panel}
      offset={offset}
      withPrev={withPrev}
      withNext={withNext}
      min={min}
      max={max}
      months={MONTHS_SHOWN}
      activateOn={activateOn}
    />
  );

  return (
    <div className="zc-drp" role="dialog" aria-label={label || 'Pick a date range'}>
      <div className="zc-drp__body">
        <RangePresets draft={panel.draft} fits={panel.fits} onPick={panel.applyPreset} activateOn={activateOn} />
        <div
          className="zc-drp__months"
          ref={daysRef}
          onKeyDown={onGridKeyDown}
          onPointerLeave={() => {
            if (anchor) setHoverKey(anchor);
            gridGlide.leave();
          }}
        >
          {renderMonth(0, true, false)}
          {renderMonth(1, false, true)}
          <GlidePill className="zc-dtp__hover" glide={gridGlide} />
        </div>
      </div>
      <div className="zc-drp__foot">
        <span className={'zc-drp__readout' + (lo && hi ? '' : ' zc-is-empty')}>
          {lo && hi ? (
            <Fragment>
              {drpRangeText(lo, hi)}{' '}
              <span className="zc-drp__count">
                - {drpDays(lo, hi)} {drpDays(lo, hi) === 1 ? 'day' : 'days'}
              </span>
            </Fragment>
          ) : anchor ? (
            'Pick the end date'
          ) : (
            'Pick a start date'
          )}
        </span>
        {timezone ? <span className="zc-drp__tz">{tzLabel(timezone)}</span> : null}
        <span className="zc-drp__footSpacer"></span>
        <Button variant="secondary" size="sm" onClick={done}>
          Done
        </Button>
      </div>
    </div>
  );
}
