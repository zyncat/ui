'use client';

import './date-picker.css';

import type { PointerEvent } from 'react';

import { useControllable } from '../../internal/hooks/use-controllable';
import { FieldShell, type DateFieldBaseProps } from './field-shell';
import { TimeSegments } from './time-core';

export interface TimeFieldProps extends DateFieldBaseProps {
  /** Controlled value, canonical 'HH:mm' (24h). */
  value?: string | null;
  /** Uncontrolled initial value, 'HH:mm' (24h). Use instead of `value`. @default null */
  defaultValue?: string | null;
  /** Fires live - the instant both segments exist. */
  onChange?: (value: string) => void;
  /** Field label rendered above the box; also the segments' `aria-label` fallback. */
  label?: string;
  /** Display only; storage stays 24h. Default '24h'. */
  format?: '24h' | '12h';
  /** ↑/↓ step granularity in minutes (typing is exact). Default 5. */
  minuteStep?: number;
  /** Lower bound 'HH:mm' - saturates, never errors. */
  min?: string;
  /** Upper bound 'HH:mm' - saturates, never errors. */
  max?: string;
}

export function TimeField({
  value,
  defaultValue = null,
  onChange,
  label,
  format = '24h',
  minuteStep = 5,
  min,
  max,
  required = false,
  invalid = false,
  message,
  disabled = false,
  size = 'md',
  className = '',
  htmlProps,
}: TimeFieldProps) {
  const [val, commit] = useControllable(value, defaultValue, onChange);

  function onBoxPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (disabled || (e.target as HTMLElement).closest('.zc-tsg__seg')) return;
    e.preventDefault();
    const seg = e.currentTarget.querySelector('.zc-tsg__seg') as HTMLElement | null;
    if (seg) seg.focus();
  }

  return (
    <FieldShell
      variant="zc-tfd"
      label={label}
      required={required}
      invalid={invalid}
      message={message}
      icon="clock"
      size={size}
      className={className}
      htmlProps={htmlProps}
    >
      <div
        className={'zc-fld__input zc-tfd__box' + (disabled ? ' zc-is-disabled' : '')}
        onPointerDown={onBoxPointerDown}
      >
        <TimeSegments
          value={val}
          onCommit={commit}
          format={format}
          minuteStep={minuteStep}
          min={min}
          max={max}
          disabled={disabled}
          ariaLabel={label || 'Time'}
        />
      </div>
    </FieldShell>
  );
}
