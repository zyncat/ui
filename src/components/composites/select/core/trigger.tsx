'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import type { DataAttributes } from '../../../../dom-props';
import { Icon } from '../../../internal/icon/Icon';
import { IconSlot } from '../../../internal/icon/IconSlot';
import { activationProps, type ActivateOn } from '../../../internal/utils/activation';
import { cx } from '../../../internal/utils/cx';
import type { ListboxState } from './use-listbox';

export type SelectTriggerHtmlProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & DataAttributes;

export interface SelectTriggerProps extends SelectTriggerHtmlProps {
  lb: ListboxState;
  invalid?: boolean;
  ariaLabel?: string;
  leading?: ReactNode;
  text?: ReactNode;
  isPlaceholder?: boolean;
  count?: number;
  activateOn?: ActivateOn;
}

export function SelectTrigger({
  lb,
  invalid,
  ariaLabel,
  leading,
  text,
  isPlaceholder,
  count,
  className,
  activateOn,
  onClick,
  onPointerDown,
  onKeyDown,
  ...rest
}: SelectTriggerProps) {
  const { triggerRef, baseId, open, adId, show, requestClose } = lb;
  return (
    <button
      type="button"
      ref={triggerRef}
      id={baseId + '-trigger'}
      className={cx('zc-select__trigger', className)}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={baseId + '-list'}
      aria-activedescendant={adId}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
          e.preventDefault();
          show();
        }
      }}
      {...activationProps<HTMLButtonElement>(
        () => {
          if (triggerRef.current) triggerRef.current.focus({ preventScroll: true });
          if (open) requestClose();
          else show();
        },
        { on: activateOn, holdFocus: true, onPointerDown, onClick },
      )}
      {...rest}
    >
      {leading && (
        <span className="zc-select__leading">
          <IconSlot size="sm">{leading}</IconSlot>
        </span>
      )}
      <span className="zc-select__value" data-placeholder={isPlaceholder ? 'true' : undefined}>
        {text}
      </span>
      {count != null && count > 0 && <span className="zc-select__count">+{count}</span>}
      <span className="zc-select__caret">
        <Icon name="caret-down" size="sm" />
      </span>
    </button>
  );
}
