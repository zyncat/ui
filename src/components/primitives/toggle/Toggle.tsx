'use client';

import './toggle.css';

import {
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

import type { DataAttributes } from '../../../dom-props';
import { useControllable } from '../../internal/hooks/use-controllable';
import { cx } from '../../internal/utils/cx';
import { SwitchGlyph } from './switch-glyph';

interface ToggleOwnProps {
  /** Controlled checked state. Omit for uncontrolled (use `defaultChecked`). */
  checked?: boolean;
  /** Uncontrolled initial state. */
  defaultChecked?: boolean;
  /** Disabled - inert and de-emphasized (faded track, retains its position). */
  disabled?: boolean;
  /** Track size: `md` 36x20 - `sm` 28x16 for dense settings/table rows. @default 'md' */
  size?: 'sm' | 'md';
  /** Label text beside the track. */
  label?: ReactNode;
  /** Optional secondary line under the label (settings rows). */
  description?: ReactNode;
  /** Fires on flip - read `e.target.checked`. */
  onChange?: ChangeEventHandler<HTMLInputElement>;
  /** Extra class(es) merged onto the root label. */
  className?: string;
  /** Inline styles merged onto the root label. */
  style?: CSSProperties;
}

export interface ToggleProps extends ToggleOwnProps {
  /** Standard <input> attributes (name, value, required, aria-*, ...) forwarded to the switch input. */
  htmlProps?: Omit<InputHTMLAttributes<HTMLInputElement>, keyof ToggleOwnProps | 'type'> & DataAttributes;
}

export function Toggle({
  checked,
  defaultChecked = false,
  disabled = false,
  size = 'md',
  label,
  description,
  className = '',
  style,
  onChange,
  htmlProps,
}: ToggleProps) {
  const [isOn, setOn] = useControllable(checked, !!defaultChecked);

  const cls = cx('zc-sw', size === 'sm' && 'zc-sw--sm', disabled && 'zc-sw--disabled', className);

  const [pressed, setPressed] = useState(false);
  function press(on: boolean) {
    return () => {
      if (!disabled) setPressed(on);
    };
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setOn(e.target.checked);
    if (onChange) onChange(e);
  }

  return (
    <label
      className={cls}
      style={style}
      onPointerDown={press(true)}
      onPointerUp={press(false)}
      onPointerLeave={press(false)}
      onPointerCancel={press(false)}
    >
      <SwitchGlyph
        pressed={pressed}
        disabled={disabled}
        checked={isOn}
        onChange={handleChange}
        {...htmlProps}
        defaultChecked={undefined}
      />
      {label || description ? (
        <span className="zc-sw__text">
          {label ? <span className="zc-sw__label">{label}</span> : null}
          {description ? <span className="zc-sw__desc">{description}</span> : null}
        </span>
      ) : null}
    </label>
  );
}
