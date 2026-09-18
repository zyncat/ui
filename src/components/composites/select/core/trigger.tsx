'use client';

import type { ButtonHTMLAttributes, KeyboardEvent, ReactElement, ReactNode } from 'react';

import type { DataAttributes } from '../../../../dom-props';
import { Icon } from '../../../internal/icon/Icon';
import { IconSlot } from '../../../internal/icon/IconSlot';
import { ovCloneTrigger } from '../../../internal/overlay/layer';
import { activationProps, type ActivateOn } from '../../../internal/utils/activation';
import { cx } from '../../../internal/utils/cx';
import type { ListboxState } from './use-listbox';

export type SelectTriggerHtmlProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & DataAttributes;

export type CustomTrigger<Selected> = ReactElement | ((state: { open: boolean; selected: Selected }) => ReactElement);

export interface SelectTriggerProps extends SelectTriggerHtmlProps {
  lb: ListboxState;
  invalid?: boolean;
  ariaLabel?: string;
  leading?: ReactNode;
  text?: ReactNode;
  isPlaceholder?: boolean;
  count?: number;
  activateOn?: ActivateOn;
  node?: ReactElement | null;
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
  disabled,
  node,
  onClick,
  onPointerDown,
  onKeyDown,
  ...rest
}: SelectTriggerProps) {
  const { triggerRef, baseId, open, adId, show, requestClose } = lb;

  const toggle = () => {
    if (triggerRef.current) triggerRef.current.focus({ preventScroll: true });
    if (open) requestClose();
    else show();
  };
  const openOnArrow = (e: KeyboardEvent<HTMLElement>) => {
    if (open || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
    e.preventDefault();
    show();
  };

  if (node)
    return ovCloneTrigger(node, {
      open,
      onPress: toggle,
      onKeyDown: openOnArrow,
      panelId: lb.listId,
      haspopup: 'listbox',
      triggerRef,
      activateOn,
      holdFocus: true,
      attrs: {
        role: 'combobox',
        'aria-activedescendant': adId,
        ...(ariaLabel && { 'aria-label': ariaLabel }),
        ...(invalid && { 'aria-invalid': true }),
        ...(disabled && { 'aria-disabled': true }),
      },
    });

  return (
    <button
      type="button"
      ref={(el) => {
        triggerRef.current = el;
      }}
      id={baseId + '-trigger'}
      className={cx('zc-select__trigger', className)}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={baseId + '-list'}
      aria-activedescendant={adId}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      disabled={disabled}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        openOnArrow(e);
      }}
      {...activationProps<HTMLButtonElement>(toggle, { on: activateOn, holdFocus: true, onPointerDown, onClick })}
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
