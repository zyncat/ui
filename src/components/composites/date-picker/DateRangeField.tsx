'use client';

import './date-picker.css';

import { useState } from 'react';

import { useControllable } from '../../internal/hooks/use-controllable';
import { useMediaQuery } from '../../internal/hooks/use-media-query';
import { Popover } from '../popover/Popover';
import { Sheet } from '../sheet/Sheet';
import { FieldShell, FieldTrigger, type DateFieldBaseProps } from './field-shell';
import { DrpPanel } from './range-panel';
import { drpRangeText, type DateRange } from './range-presets';

export type { DateRange };

const NARROW_VIEWPORT = '(max-width: 640px)';

export interface DateRangeFieldProps extends DateFieldBaseProps {
  /** Controlled value - both endpoints, or null when empty. */
  value?: DateRange | null;
  /** Uncontrolled initial range. Use instead of `value`. @default null */
  defaultValue?: DateRange | null;
  /** Fires on Done with the range the panel shows, when it differs from the current one.
   *  Closing the panel any other way discards the pick. */
  onChange?: (value: DateRange) => void;
  /** Trigger text shown when no range is picked. @default 'Pick a date range' */
  placeholder?: string;
  /** IANA timezone (e.g. 'Europe/Riga') - display context, shown in the footer. */
  timezone?: string;
  /** Earliest pickable date, 'YYYY-MM-DD', inclusive. */
  min?: string;
  /** Latest pickable date, 'YYYY-MM-DD', inclusive. */
  max?: string;
  /** Longest pickable range in days, inclusive. After the first day pick, days further away disable, and so do quick picks that run longer. */
  maxDays?: number;
}

export function DateRangeField({
  value,
  defaultValue = null,
  onChange,
  label,
  ariaLabel,
  placeholder = 'Pick a date range',
  timezone,
  min,
  max,
  maxDays,
  required = false,
  invalid = false,
  message,
  disabled = false,
  size = 'md',
  className = '',
  htmlProps,
  activateOn = 'pointerdown',
  animation,
}: DateRangeFieldProps) {
  const [val, commit] = useControllable(value, defaultValue, onChange);

  const narrow = useMediaQuery(NARROW_VIEWPORT);
  const [pickerOpen, setPickerOpen] = useState(false);

  const display = val && val.start && val.end ? drpRangeText(val.start, val.end) : null;
  const trigger = <FieldTrigger display={display} placeholder={placeholder} disabled={disabled} />;
  const panel = (
    <DrpPanel
      value={val}
      commit={commit}
      close={() => setPickerOpen(false)}
      min={min}
      max={max}
      maxDays={maxDays}
      timezone={timezone}
      label={label}
      months={narrow ? 1 : 2}
      layout={narrow ? 'sheet' : 'popover'}
      activateOn={activateOn}
    />
  );

  return (
    <FieldShell
      variant="zc-dtf"
      label={label}
      ariaLabel={ariaLabel}
      required={required}
      invalid={invalid}
      message={message}
      icon="calendar"
      size={size}
      className={className}
      htmlProps={htmlProps}
    >
      {narrow ? (
        <Sheet
          trigger={trigger}
          side="bottom"
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          activateOn={activateOn}
          animation={animation}
        >
          {panel}
        </Sheet>
      ) : (
        <Popover
          trigger={trigger}
          side="bottom"
          align="start"
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          activateOn={activateOn}
          animation={animation}
        >
          {panel}
        </Popover>
      )}
    </FieldShell>
  );
}
