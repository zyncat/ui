'use client';

import './input.css';

import { useId } from 'react';
import type { CSSProperties, InputHTMLAttributes } from 'react';

import type { DataAttributes } from '../../../dom-props';
import { useHoldRepeat } from '../../internal/hooks/use-hold-repeat';
import { Icon } from '../../internal/icon/Icon';
import { cx } from '../../internal/utils/cx';
import {
  FieldLabel,
  FieldMessage,
  fieldMessageId,
  joinIds,
  type FieldCoreMessagingProps,
  type FieldIdProps,
} from './field-chrome';
import { useNumberValue } from './use-number-value';

interface NumberFieldOwnProps extends FieldIdProps, FieldCoreMessagingProps {
  /** Unit suffix shown inside the field (e.g. "days", "%"). */
  unit?: string;
  /** Minimum value - steps and committed typing clamp up to this; the decrease stepper disables here. @default 0 */
  min?: number;
  /** Maximum value - steps and committed typing clamp down to this; the increase stepper disables here. @default Infinity */
  max?: number;
  /** Amount added/removed per ArrowUp/ArrowDown press and per minus/plus click; holding a button repeats it. Decimals work. @default 1 */
  step?: number;
  /** Controlled numeric value. Omit for uncontrolled (use `defaultValue`). */
  value?: number | string;
  /** Uncontrolled initial value. Use instead of `value`. @default 0 */
  defaultValue?: number;
  /** Called with the next clamped number. */
  onChange?: (value: number) => void;
  /** Disabled - the input and both steppers go inert. */
  disabled?: boolean;
  /** Control height: sm - md (default) - lg. */
  size?: 'sm' | 'md' | 'lg';
  /** Extra class(es) merged onto the field root. */
  className?: string;
  /** Inline styles merged onto the field root. */
  style?: CSSProperties;
}

export interface NumberFieldProps extends NumberFieldOwnProps {
  /** Standard <input> attributes (name, aria-*, ...) forwarded to the input. */
  htmlProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    keyof NumberFieldOwnProps | 'size' | 'value' | 'onChange' | 'min' | 'max' | 'step'
  > &
    DataAttributes;
}

const STEPPERS = [
  { direction: -1, label: 'Decrease', icon: 'minus' },
  { direction: 1, label: 'Increase', icon: 'plus' },
] as const;
const ARROW_STEP: Partial<Record<string, 1 | -1>> = { ArrowUp: 1, ArrowDown: -1 };

export function NumberField({
  id,
  label,
  helper,
  error,
  unit,
  min = 0,
  max = Infinity,
  step = 1,
  value,
  defaultValue = 0,
  onChange,
  disabled,
  size,
  className = '',
  style,
  htmlProps,
}: NumberFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const message = error || helper;
  const msgId = fieldMessageId(fieldId, message);
  const { v, text, commit, stepBy, type } = useNumberValue({ value, defaultValue, onChange, min, max, step });
  const holdStep = useHoldRepeat(stepBy);
  const cls = cx(
    'zc-fld',
    'zc-numf',
    size === 'sm' ? 'zc-fld--sm' : size === 'lg' ? 'zc-fld--lg' : '',
    error && 'zc-is-error',
    className,
  );

  return (
    <div className={cls} style={style}>
      <FieldLabel id={fieldId} label={label} />
      <div
        className="zc-fld__control"
        style={{ '--numf-len': text.length, '--numf-unit-len': unit?.length } as CSSProperties}
      >
        <input
          id={fieldId}
          className="zc-fld__input"
          type="text"
          inputMode="decimal"
          role="spinbutton"
          aria-valuenow={v}
          aria-valuemin={min}
          aria-valuemax={max === Infinity ? undefined : max}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          value={text}
          onChange={(e) => type(e.target.value)}
          onBlur={() => commit(v)}
          onKeyDown={(e) => {
            const direction = ARROW_STEP[e.key];
            if (direction) {
              e.preventDefault();
              stepBy(direction);
            }
            if (e.key === 'Enter') commit(v);
          }}
          {...htmlProps}
          aria-describedby={joinIds(msgId, htmlProps?.['aria-describedby'])}
        />
        {unit && <span className="zc-numf__unit">{unit}</span>}
        {STEPPERS.map(({ direction, label, icon }) => (
          <button
            key={icon}
            type="button"
            tabIndex={-1}
            className={`zc-numf__step zc-numf__step--${icon}`}
            aria-label={label}
            disabled={disabled || (direction > 0 ? v >= max : v <= min)}
            {...holdStep(direction)}
          >
            <Icon name={icon} size="sm" />
          </button>
        ))}
      </div>
      <FieldMessage id={msgId} message={message} icon={error ? 'warning-circle' : null} />
    </div>
  );
}
