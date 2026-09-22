'use client';

import './date-picker.css';

import { useEffect, useState } from 'react';

import { useControllable } from '../../internal/hooks/use-controllable';
import { Popover } from '../popover/Popover';
import { DtpPanel } from './calendar-panel';
import { displayDay, pad } from './date-utils';
import { FieldShell, FieldTrigger, type DateFieldBaseProps } from './field-shell';
import { disp12, TimeSegments } from './time-core';

interface DateTimeParts {
  date: string | null;
  time: string | null;
}

function displayTime(t: string, format?: '24h' | '12h'): string {
  if (format !== '12h') return t;
  const p = t.split(':').map(Number);
  const mer = p[0] >= 12 ? 'PM' : 'AM';
  return disp12(p[0]) + ':' + pad(p[1]) + ' ' + mer;
}
function dttfSplit(v: string | null | undefined): DateTimeParts {
  if (!v) return { date: null, time: null };
  const i = v.indexOf('T');
  return i < 0 ? { date: v, time: null } : { date: v.slice(0, i), time: v.slice(i + 1) };
}

export interface DateTimeFieldProps extends DateFieldBaseProps {
  /** Controlled value, 'YYYY-MM-DDTHH:mm'. */
  value?: string | null;
  /** Uncontrolled initial value, 'YYYY-MM-DDTHH:mm'. Use instead of `value`. @default null */
  defaultValue?: string | null;
  /** Fires once both date and time are set, with 'YYYY-MM-DDTHH:mm' (an incomplete half never commits). */
  onChange?: (value: string) => void;
  /** Trigger text shown when no value is picked. @default 'Pick date & time' */
  placeholder?: string;
  /** IANA timezone (e.g. 'Europe/Riga') - display context, shown in the footer. */
  timezone?: string;
  /** Lower bound - 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm', inclusive. */
  min?: string;
  /** Upper bound - 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm', inclusive. */
  max?: string;
  /** Time display only; storage stays 24h. Default '24h'. */
  format?: '24h' | '12h';
  /** ↑/↓ step granularity in minutes (typing is exact). Default 5. */
  minuteStep?: number;
}

export function DateTimeField({
  value,
  defaultValue = null,
  onChange,
  label,
  placeholder = 'Pick date & time',
  timezone,
  min,
  max,
  format = '24h',
  minuteStep = 5,
  required = false,
  invalid = false,
  message,
  disabled = false,
  size = 'md',
  className = '',
  htmlProps,
  activateOn = 'pointerdown',
  animation,
}: DateTimeFieldProps) {
  const [val, commit] = useControllable<string | null>(
    value,
    defaultValue,
    onChange as ((next: string | null) => void) | undefined,
  );
  const parts = dttfSplit(val);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendDate, setPendDate] = useState<string | null>(null);
  const [pendTime, setPendTime] = useState<string | null>(null);
  useEffect(() => {
    setPendDate(null);
    setPendTime(null);
  }, [val]);

  const date = pendDate != null ? pendDate : parts.date;
  const time = pendTime != null ? pendTime : parts.time;

  const minL = dttfSplit(min);
  const maxL = dttfSplit(max);
  const minTime = date && date === minL.date ? minL.time : null;
  const maxTime = date && date === maxL.date ? maxL.time : null;

  function commitIf(d: string | null, t: string | null) {
    if (!d || !t) return;
    let tt = t;
    if (minL.time && d === minL.date && tt < minL.time) tt = minL.time;
    if (maxL.time && d === maxL.date && tt > maxL.time) tt = maxL.time;
    if (tt !== t) setPendTime(tt);
    const next = d + 'T' + tt;
    if (next !== val) commit(next);
  }
  function handleDate(d: string) {
    setPendDate(d);
    commitIf(d, time);
  }
  function handleTime(t: string) {
    setPendTime(t);
    commitIf(date, t);
  }

  const display = date ? displayDay(date) + ', ' + (time ? displayTime(time, format) : '--:--') : null;
  const trigger = <FieldTrigger display={display} placeholder={placeholder} disabled={disabled} />;

  return (
    <FieldShell
      variant="zc-dtf"
      label={label}
      required={required}
      invalid={invalid}
      message={message}
      icon="calendar"
      size={size}
      className={className}
      htmlProps={htmlProps}
    >
      <Popover
        trigger={trigger}
        side="bottom"
        align="start"
        activateOn={activateOn}
        animation={animation}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
      >
        <DtpPanel
          val={date}
          commit={handleDate}
          close={() => setPickerOpen(false)}
          min={minL.date}
          max={maxL.date}
          timezone={timezone}
          label={label}
          activateOn={activateOn}
          slot={
            <div className="zc-dtp__time">
              <span className="zc-dtp__timeLabel">Time</span>
              <span className="zc-dtp__timeHint" aria-hidden="true">
                <kbd>↑</kbd>
                <kbd>↓</kbd>
              </span>
              <TimeSegments
                value={time}
                onCommit={handleTime}
                format={format}
                minuteStep={minuteStep}
                min={minTime}
                max={maxTime}
                ariaLabel="Time"
              />
            </div>
          }
        />
      </Popover>
    </FieldShell>
  );
}
