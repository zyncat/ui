'use client';

import './select.css';

import type { HTMLAttributes, ReactNode } from 'react';

import type { DataAttributes } from '../../../dom-props';
import type { DisableableAnimation } from '../../../motion/timing';
import { useControllable } from '../../internal/hooks/use-controllable';
import type { MenuSize, MenuWeight, MenuWidth } from '../../internal/menu/highlight';
import type { ActivateOn } from '../../internal/utils/activation';
import { cx } from '../../internal/utils/cx';
import { CheckGlyph } from '../../primitives/checkbox/check-glyph';
import { SwitchGlyph } from '../../primitives/toggle/switch-glyph';
import {
  ListboxPanel,
  SelectTrigger,
  useListbox,
  type CustomTrigger,
  type SelectGroup,
  type SelectMenuHtmlProps,
  type SelectOption,
} from './core';

export type { SelectOption, SelectGroup } from './core';

export interface MultiSelectProps {
  /** The choices - a flat `SelectOption[]`, or `SelectGroup[]` to render labeled sections. @default [] */
  options: SelectOption[] | SelectGroup[];
  /** Controlled value - the array of selected option `value`s. Omit for uncontrolled (use `defaultValue`). */
  value?: string[];
  /** Initial selection when uncontrolled. @default [] */
  defaultValue?: string[];
  /** Fires with the NEXT array and the option that was toggled. Committing keeps the menu open. */
  onChange?: (value: string[], toggled: SelectOption) => void;
  /** Trigger text when nothing is selected. @default 'Select options' */
  placeholder?: string;
  /** Trigger height, type and padding. The menu follows it unless `menuSize` overrides. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Menu density on its own - row type, row padding, the filter field and the row checkbox. A row
   *  carrying a description sits one step taller than a plain one at every step. @default the `size` value */
  menuSize?: MenuSize;
  /** Weight of every option label in the menu. @default 'medium' */
  weight?: MenuWeight;
  /** Glyph mirroring each option's selected state at the trailing edge: a checkbox, or a switch for a
   *  settings-style menu where every option is an independent on/off. Decoration only - the option
   *  semantics are the same either way. @default 'checkbox' */
  marker?: 'checkbox' | 'switch';
  /** Menu width. `trigger` is never narrower than the trigger, `auto` fits the options, and
   *  `sm` | `md` | `lg` are fixed steps with long labels ellipsizing. @default 'trigger' */
  width?: MenuWidth;
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
  /** Your own icon node pinned before the trigger label; else the sole selected option's icon. */
  leadingIcon?: ReactNode;
  /** Base id for the trigger/menu/list ids and a11y wiring; auto-generated if omitted. */
  id?: string;
  /** Accessible name for the trigger and listbox - supply when there is no visible label. */
  ariaLabel?: string;
  /** Standard <div> attributes (className, style, data-*, ...) forwarded to the select root. */
  htmlProps?: HTMLAttributes<HTMLDivElement> & DataAttributes;
  /** Standard attributes (className, style, data-*, ...) forwarded to the menu panel, which portals
   *  to <body> and inherits nothing from the root. */
  menuProps?: SelectMenuHtmlProps;
  /** Whether the trigger and the options fire on `pointerdown` (snappier) or wait for `click`.
   *  @default 'pointerdown' */
  activateOn?: ActivateOn;
  /** Menu open/close timing - motion tokens only, or `null` to disable. @default duration 'base' + ease 'entrance'/'exit' */
  animation?: DisableableAnimation;
  /** Your own element in place of the built-in trigger. It is cloned with the combobox wiring - role,
   *  aria, open/close, arrow keys, and the anchor the menu measures - so it must render one focusable
   *  element that forwards its props and ref. Pass a function to read `{ open, selected }`. */
  trigger?: CustomTrigger<SelectOption[]>;
}

type MultiSelectMarker = NonNullable<MultiSelectProps['marker']>;

function OptionMarker({ marker, checked, size }: { marker: MultiSelectMarker; checked: boolean; size: MenuSize }) {
  if (marker === 'switch') {
    return (
      <span className={cx('zc-sw', size === 'sm' && 'zc-sw--sm')} aria-hidden="true">
        <SwitchGlyph checked={checked} readOnly tabIndex={-1} />
      </span>
    );
  }
  return (
    <span className={cx('zc-cbx', size === 'sm' && 'zc-cbx--sm')} aria-hidden="true">
      <CheckGlyph checked={checked} readOnly tabIndex={-1} />
    </span>
  );
}

export function MultiSelect({
  options = [],
  value: controlledValue,
  defaultValue = [],
  onChange,
  placeholder = 'Select options',
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
  marker = 'checkbox',
  width = 'trigger',
  leadingIcon = null,
  id,
  ariaLabel,
  htmlProps,
  menuProps,
  activateOn = 'pointerdown',
  animation,
  trigger,
}: MultiSelectProps) {
  const [value, setValue] = useControllable<string[], SelectOption>(
    controlledValue,
    defaultValue,
    onChange as ((next: string[], opt?: SelectOption) => void) | undefined,
  );
  const values = Array.isArray(value) ? value : [];
  const isSelected = (v: string) => values.indexOf(v) !== -1;

  const lb = useListbox({
    options,
    disabled,
    loading,
    searchable,
    id,
    idPrefix: 'mselect-',
    isSelected,
    onCommit: (opt) =>
      setValue(isSelected(opt.value) ? values.filter((v) => v !== opt.value) : [...values, opt.value], opt),
    closeOnCommit: false,
  });

  const selectedOptions = lb.flat.filter((o) => isSelected(o.value));
  const isPlaceholder = !loading && selectedOptions.length === 0;
  const customTrigger = typeof trigger === 'function' ? trigger({ open: lb.open, selected: selectedOptions }) : trigger;

  return (
    <div
      {...htmlProps}
      className={cx('zc-select', htmlProps?.className)}
      data-multiple="true"
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
        leading={leadingIcon || (selectedOptions.length === 1 && selectedOptions[0].icon) || null}
        text={loading ? 'Loading...' : isPlaceholder ? placeholder : selectedOptions[0].label}
        isPlaceholder={isPlaceholder}
        count={selectedOptions.length - 1}
        activateOn={activateOn}
      />
      <ListboxPanel
        lb={lb}
        loading={loading}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        ariaLabel={ariaLabel}
        multiple
        highlight={highlight}
        rail={rail}
        size={menuSize}
        weight={weight}
        width={width}
        activateOn={activateOn}
        animation={animation}
        menuProps={menuProps}
        check={(sel) => <OptionMarker marker={marker} checked={sel} size={menuSize} />}
      />
    </div>
  );
}
