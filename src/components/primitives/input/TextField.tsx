'use client';

import './input.css';

import { useId, useRef } from 'react';
import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react';

import type { DataAttributes } from '../../../dom-props';
import { Icon } from '../../internal/icon/Icon';
import { IconSlot } from '../../internal/icon/IconSlot';
import { cx } from '../../internal/utils/cx';
import {
  FieldLabel,
  FieldMessage,
  fieldMessageId,
  joinIds,
  resolveFieldMessage,
  type FieldMessagingProps,
} from './field-chrome';

type TextFieldNative = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  | 'placeholder'
  | 'value'
  | 'onChange'
  | 'disabled'
  | 'readOnly'
  | 'maxLength'
  | 'minLength'
  | 'hidden'
  | 'pattern'
  | 'onKeyDown'
>;

interface TextFieldOwnProps extends FieldMessagingProps, TextFieldNative {
  /** Leading icon - your own icon node (sized to the control). Decorative. */
  leadingIcon?: ReactNode;
  /** Show a clear button when there's a value. */
  clearable?: boolean;
  /** Control height: the `--control-height-*` step of the same name, md by default. */
  size?: 'sm' | 'md' | 'lg';
  /** Extra class(es) merged onto the field root. */
  className?: string;
  /** Inline styles merged onto the field root. */
  style?: CSSProperties;
  /** Available text like types */
  type?: 'text' | 'search' | 'email' | 'url' | 'password';
}

export interface TextFieldProps extends TextFieldOwnProps {
  /** Standard <input> attributes (name, autoComplete, maxLength, aria-*, ...) forwarded to the input. */
  htmlProps?: Omit<InputHTMLAttributes<HTMLInputElement>, keyof TextFieldOwnProps | 'size'> & DataAttributes;
}

export function TextField({
  label,
  helper,
  error,
  warning,
  success,
  leadingIcon,
  clearable,
  size,
  value,
  htmlProps,
  className,
  style,
  optional,
  ...rest
}: TextFieldProps) {
  const { state, msg, msgIcon } = resolveFieldMessage(error, warning, success, helper);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoId = useId();
  const msgId = fieldMessageId(rest.id ?? autoId, msg);
  const showClear = clearable && value && !rest.disabled && !rest.readOnly;

  function clear() {
    const el = inputRef.current;
    if (!el) return;
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setValue.call(el, '');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus();
  }
  const cls = cx(
    'zc-fld',
    size === 'sm' ? 'zc-fld--sm' : size === 'lg' ? 'zc-fld--lg' : '',
    leadingIcon && 'zc-fld--has-lead',
    showClear && 'zc-fld--has-action',
    state,
    className,
  );

  return (
    <div className={cls} style={style}>
      <FieldLabel id={rest.id} label={label} required={rest.required} optional={optional} />
      <div className="zc-fld__control">
        {leadingIcon && (
          <span className="zc-fld__icon zc-fld__icon--lead">
            <IconSlot size={size}>{leadingIcon}</IconSlot>
          </span>
        )}
        <input
          ref={inputRef}
          className="zc-fld__input"
          value={value}
          aria-invalid={error ? true : undefined}
          {...rest}
          {...htmlProps}
          aria-describedby={joinIds(msgId, htmlProps?.['aria-describedby'])}
        />
        {showClear && (
          <button type="button" className="zc-fld__action" aria-label="Clear" onClick={clear}>
            <Icon name="close" size={size} />
          </button>
        )}
      </div>
      <FieldMessage id={msgId} message={msg} icon={msgIcon} />
    </div>
  );
}
