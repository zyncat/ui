'use client';

import './date-picker.css';

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, Ref } from 'react';

import type { DataAttributes } from '../../../dom-props';
import type { DisableableAnimation } from '../../../motion/timing';
import { Icon, type IconName } from '../../internal/icon/Icon';
import type { ActivateOn } from '../../internal/utils/activation';
import { cx } from '../../internal/utils/cx';
import { FieldLabel, FieldMessage } from '../../primitives/input/field-chrome';

export interface DateFieldBaseProps {
  /** Field label rendered above the trigger. */
  label?: string;
  /** Asterisk on the label. @default false */
  required?: boolean;
  /** Danger border + message color (.zc-fld.zc-is-error). @default false */
  invalid?: boolean;
  /** Helper / error text under the field. */
  message?: string;
  /** Disable the field. @default false */
  disabled?: boolean;
  /** Control height, type and padding - the same scale as `TextField`, so a form row can hold one
   *  size throughout. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Extra class on the field shell root. */
  className?: string;
  /** Standard <div> attributes (style, data-*, aria-*, ...) forwarded to the field shell root. */
  htmlProps?: HTMLAttributes<HTMLDivElement> & DataAttributes;
  /** Whether the trigger, the day cells and the panel controls fire on `pointerdown` (snappier) or
   *  wait for `click`. (Not used by TimeField, which is inline.) @default 'pointerdown' */
  activateOn?: ActivateOn;
  /** Popover open/close timing - motion tokens only, or `null` to disable. (Not used by TimeField, which is inline.) */
  animation?: DisableableAnimation;
}

export interface FieldShellProps {
  variant: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  required?: boolean;
  invalid?: boolean;
  message?: ReactNode;
  icon: IconName;
  className?: string;
  htmlProps?: HTMLAttributes<HTMLDivElement> & DataAttributes;
  children?: ReactNode;
}

export function FieldShell({
  variant,
  size,
  label,
  required,
  invalid,
  message,
  icon,
  className,
  htmlProps,
  children,
}: FieldShellProps) {
  const cls = cx(
    'zc-fld',
    variant,
    'zc-fld--has-lead',
    size === 'sm' ? 'zc-fld--sm' : size === 'lg' ? 'zc-fld--lg' : '',
    invalid && 'zc-is-error',
    className,
    htmlProps?.className,
  );
  return (
    <div {...htmlProps} className={cls}>
      <FieldLabel label={label} required={required} />
      <div className="zc-fld__control">
        {children}
        <span className="zc-fld__icon zc-fld__icon--lead" aria-hidden="true">
          <Icon name={icon} size="md" />
        </span>
      </div>
      <FieldMessage message={message ? <span>{message}</span> : null} />
    </div>
  );
}

export function FieldTrigger({
  display,
  placeholder,
  disabled,
  ...rest
}: { display: string | null; placeholder: string; disabled?: boolean } & ButtonHTMLAttributes<HTMLButtonElement> & {
    ref?: Ref<HTMLButtonElement>;
  }) {
  return (
    <button type="button" className="zc-fld__input zc-dtf__trigger" disabled={disabled} {...rest}>
      {display ? (
        <span className="zc-dtf__value">{display}</span>
      ) : (
        <span className="zc-dtf__placeholder">{placeholder}</span>
      )}
    </button>
  );
}
