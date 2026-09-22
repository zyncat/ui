'use client';

import './date-picker.css';

import { useState } from 'react';

import { useControllable } from '../../internal/hooks/use-controllable';
import { Popover } from '../popover/Popover';
import { DtpPanel } from './calendar-panel';
import { displayDay } from './date-utils';
import { FieldShell, FieldTrigger, type DateFieldBaseProps } from './field-shell';

export interface DateFieldProps extends DateFieldBaseProps {
  /** Controlled value, 'YYYY-MM-DD'. */
  value?: string | null;
  /** Uncontrolled initial value, 'YYYY-MM-DD'. Use instead of `value`. @default null */
  defaultValue?: string | null;
  /** Fires on each day pick (commit is live), with the picked 'YYYY-MM-DD'. */
  onChange?: (value: string) => void;
  /** Trigger text shown when no date is picked. @default 'Pick a date' */
  placeholder?: string;
  /** IANA timezone name (e.g. 'Europe/Riga') - display context only, shown with its GMT offset in the footer. */
  timezone?: string;
  /** Earliest pickable date, 'YYYY-MM-DD', inclusive. */
  min?: string;
  /** Latest pickable date, 'YYYY-MM-DD', inclusive. */
  max?: string;
}

export function DateField({
  value,
  defaultValue = null,
  onChange,
  label,
  placeholder = 'Pick a date',
  timezone,
  min,
  max,
  required = false,
  invalid = false,
  message,
  disabled = false,
  size = 'md',
  className = '',
  htmlProps,
  activateOn = 'pointerdown',
  animation,
}: DateFieldProps) {
  const [val, commit] = useControllable(value, defaultValue, onChange);
  const [pickerOpen, setPickerOpen] = useState(false);
  const trigger = <FieldTrigger display={displayDay(val)} placeholder={placeholder} disabled={disabled} />;

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
          val={val}
          commit={commit}
          close={() => setPickerOpen(false)}
          min={min}
          max={max}
          timezone={timezone}
          label={label}
          activateOn={activateOn}
        />
      </Popover>
    </FieldShell>
  );
}
