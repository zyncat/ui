'use client';

import './select.css';

import type { HTMLAttributes, ReactNode } from 'react';

import type { DataAttributes } from '../../../dom-props';
import type { DisableableAnimation } from '../../../motion/timing';
import { useControllable } from '../../internal/hooks/use-controllable';
import type { MenuSize, MenuWeight } from '../../internal/menu/highlight';
import type { ActivateOn } from '../../internal/utils/activation';
import { cx } from '../../internal/utils/cx';
import {
  ListboxPanel,
  SelectTrigger,
  useListbox,
  type CustomTrigger,
  type SelectGroup,
  type SelectOption,
  type SelectTriggerHtmlProps,
} from './core';

export type { SelectOption, SelectGroup } from './core';

export interface SelectProps {
  /** The choices - a flat `SelectOption[]`, or `SelectGroup[]` to render labeled sections. @default [] */
  options: SelectOption[] | SelectGroup[];
  /** Controlled value - matches an option's `value`, or `null` for none. Omit for uncontrolled (use `defaultValue`). */
  value?: string | null;
  /** Initial value when uncontrolled. @default null */
  defaultValue?: string | null;
  /** Fires on commit - gets the new `value` and its full `SelectOption`. Committing closes the menu. */
  onChange?: (value: string, option: SelectOption) => void;
  /** Trigger text when nothing is selected. @default 'Select an option' */
  placeholder?: string;
  /** Trigger height, type and padding. The menu follows it unless `menuSize` overrides. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Menu density on its own - row type, row padding and the filter field. A row carrying a
   *  description sits one step taller than a plain one at every step. @default the `size` value */
  menuSize?: MenuSize;
  /** Weight of every option label in the menu. @default 'medium' */
  weight?: MenuWeight;
  /** Disabled - trigger is inert and the menu cannot open. @default false */
  disabled?: boolean;
  /** Danger ring + border. @default false */
  invalid?: boolean;
  /** Skeleton rows in the menu; trigger reads "Loading...". @default false */
  loading?: boolean;
  /** Type-to-filter field pinned above the list. @default false */
  searchable?: boolean;
  /** Placeholder for the `searchable` filter input. @default 'Filter options' */
  searchPlaceholder?: string;
  /** Hue of the highlight that travels between options: the neutral wash, or the accent wash with
   *  accent ink on the active option. @default 'neutral' */
  highlight?: 'neutral' | 'accent';
  /** Short accent bar on the leading edge of the highlight, marking the active option. @default false */
  rail?: boolean;
  /** Your own icon node pinned before the trigger label; else the selected option's icon. */
  leadingIcon?: ReactNode;
  /** Base id for the trigger/menu/list ids and a11y wiring; auto-generated if omitted. */
  id?: string;
  /** Accessible name for the trigger and listbox - supply when there is no visible label. */
  ariaLabel?: string;
  /** Standard <div> attributes (className, style, data-*, ...) forwarded to the select root. */
  htmlProps?: HTMLAttributes<HTMLDivElement> & DataAttributes;
  /** Whether the trigger and the options fire on `pointerdown` (snappier) or wait for `click`.
   *  @default 'pointerdown' */
  activateOn?: ActivateOn;
  /** Menu open/close timing - motion tokens only, or `null` to disable. @default duration 'base' + ease 'entrance'/'exit' */
  animation?: DisableableAnimation;
  /** Standard <button> attributes (className, style, aria-*, data-*, ...) merged onto the trigger.
   *  `onClick` and `onKeyDown` run before the built-in open/close and arrow-key handling, which
   *  cannot be replaced - the trigger is the combobox. Ignored when `trigger` replaces it. */
  triggerProps?: SelectTriggerHtmlProps;
  /** Your own element in place of the built-in trigger. It is cloned with the combobox wiring - role,
   *  aria, open/close, arrow keys, and the anchor the menu measures - so it must render one focusable
   *  element that forwards its props and ref. Pass a function to read `{ open, selected }`. */
  trigger?: CustomTrigger<SelectOption | null>;
  /** Show check icon on selected value */
  showCheck?: boolean;
}

export function Select({
  options = [],
  value: controlledValue,
  defaultValue = null,
  onChange,
  placeholder = 'Select an option',
  size = 'md',
  menuSize = size,
  disabled = false,
  invalid = false,
  loading = false,
  searchable = false,
  searchPlaceholder = 'Filter options',
  highlight = 'neutral',
  rail = false,
  weight = 'medium',
  leadingIcon = null,
  id,
  ariaLabel,
  htmlProps,
  activateOn = 'pointerdown',
  animation,
  triggerProps,
  trigger,
  showCheck = true,
}: SelectProps) {
  const [value, setValue] = useControllable<string | null, SelectOption>(controlledValue, defaultValue, onChange);

  const lb = useListbox({
    options,
    disabled,
    loading,
    searchable,
    id,
    idPrefix: 'select-',
    isSelected: (v) => v === value && value != null,
    onCommit: (opt) => setValue(opt.value, opt),
    closeOnCommit: true,
  });

  const selected = lb.flat.find((o) => o.value === value) || null;
  const isPlaceholder = !loading && !selected;
  const customTrigger = typeof trigger === 'function' ? trigger({ open: lb.open, selected }) : trigger;

  return (
    <div
      {...htmlProps}
      className={cx('zc-select', htmlProps?.className)}
      data-size={size}
      data-custom-trigger={customTrigger ? 'true' : undefined}
      data-open={lb.open ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-invalid={invalid ? 'true' : undefined}
      data-loading={loading ? 'true' : undefined}
    >
      <SelectTrigger
        lb={lb}
        node={customTrigger}
        disabled={disabled}
        invalid={invalid}
        ariaLabel={ariaLabel}
        leading={leadingIcon || (selected && selected.icon) || null}
        text={loading ? 'Loading...' : isPlaceholder ? placeholder : selected.label}
        isPlaceholder={isPlaceholder}
        activateOn={activateOn}
        {...triggerProps}
      />
      <ListboxPanel
        lb={lb}
        loading={loading}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        ariaLabel={ariaLabel}
        highlight={highlight}
        rail={rail}
        size={menuSize}
        weight={weight}
        activateOn={activateOn}
        animation={animation}
        {...(!showCheck && { check: () => null })}
      />
    </div>
  );
}
