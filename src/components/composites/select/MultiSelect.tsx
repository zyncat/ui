'use client';

import './select.css';

import type { HTMLAttributes, ReactNode } from 'react';

import type { DataAttributes } from '../../../dom-props';
import type { DisableableAnimation } from '../../../motion/timing';
import { useControllable } from '../../internal/hooks/use-controllable';
import type { MenuSize, MenuWeight } from '../../internal/menu/highlight';
import type { ActivateOn } from '../../internal/utils/activation';
import { cx } from '../../internal/utils/cx';
import { CheckGlyph } from '../../primitives/checkbox/check-glyph';
import { ListboxPanel, SelectTrigger, useListbox, type SelectGroup, type SelectOption } from './core';

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
  /** Whether the trigger and the options fire on `pointerdown` (snappier) or wait for `click`.
   *  @default 'pointerdown' */
  activateOn?: ActivateOn;
  /** Menu open/close timing - motion tokens only, or `null` to disable. @default duration 'base' + ease 'entrance'/'exit' */
  animation?: DisableableAnimation;
}

function CheckboxTick({ checked, size }: { checked: boolean; size: MenuSize }) {
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
  leadingIcon = null,
  id,
  ariaLabel,
  htmlProps,
  activateOn = 'pointerdown',
  animation,
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

  return (
    <div
      {...htmlProps}
      className={cx('zc-select', htmlProps?.className)}
      data-multiple="true"
      data-size={size}
      data-open={lb.open ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-invalid={invalid ? 'true' : undefined}
      data-loading={loading ? 'true' : undefined}
    >
      <SelectTrigger
        lb={lb}
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
        activateOn={activateOn}
        animation={animation}
        check={(sel) => <CheckboxTick checked={sel} size={menuSize} />}
      />
    </div>
  );
}
