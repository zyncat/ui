'use client';

import './tag.css';
import '../collapse/collapse.css';

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

import type { DataAttributes } from '../../../dom-props';
import { useControllable } from '../../internal/hooks/use-controllable';
import { IconSlot } from '../../internal/icon/IconSlot';
import { cx } from '../../internal/utils/cx';

interface ToggleTagOwnProps {
  /** Chip content; the label shown beside the tick or `icon`. */
  children: ReactNode;
  /** Controlled selected value. Omit for uncontrolled. */
  selected?: boolean;
  /** Uncontrolled initial value. */
  defaultSelected?: boolean;
  /** Fires with the next value on every toggle. */
  onChange?: (selected: boolean) => void;
  /** Your own icon node; replaces the tick. Selected state reads from the wash. */
  icon?: ReactNode | null;
  /** Optional result count - rendered with tabular figures. */
  count?: ReactNode;
  /** 'md' sits on `--control-height-sm`; 'sm' is 24px, for dense rows. @default 'md' */
  size?: 'md' | 'sm';
  /** Disable the button, blocking toggles. @default false */
  disabled?: boolean;
  /** Extra class(es) merged onto the root element. */
  className?: string;
  /** Inline styles merged onto the root element. */
  style?: CSSProperties;
}

/** ToggleTag - the on/off filter chip (<button aria-pressed>). */
export interface ToggleTagProps extends ToggleTagOwnProps {
  /** Standard <button> attributes forwarded to the chip. */
  htmlProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ToggleTagOwnProps> & DataAttributes;
}

function ToggleTagTick({ selected }: { selected: boolean }) {
  return (
    <span
      className="zc-tag__check zc-collapse"
      data-axis="width"
      data-open={selected ? 'true' : 'false'}
      aria-hidden="true"
    >
      <span className="zc-collapse__inner">
        <svg viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6.5 L5 9 L9.5 3.5"
            pathLength="1"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}

export function ToggleTag({
  children,
  selected: selectedProp,
  defaultSelected = false,
  onChange,
  icon = null,
  count = null,
  size = 'md',
  disabled = false,
  className = '',
  style,
  htmlProps,
}: ToggleTagProps) {
  const [selected, setSelected] = useControllable(selectedProp, defaultSelected, onChange);
  const toggle = () => setSelected(!selected);

  const cls = cx('zc-tag', 'zc-tag--toggle', size === 'sm' && 'zc-tag--sm', className);

  return (
    <button
      type="button"
      className={cls}
      style={style}
      aria-pressed={selected}
      disabled={disabled}
      onClick={toggle}
      {...htmlProps}
    >
      {icon ? (
        <span className="zc-tag__icon">
          <IconSlot size="sm">{icon}</IconSlot>
        </span>
      ) : (
        <ToggleTagTick selected={selected} />
      )}
      <span className="zc-tag__label">{children}</span>
      {count != null && <span className="zc-tag__count">{count}</span>}
    </button>
  );
}
