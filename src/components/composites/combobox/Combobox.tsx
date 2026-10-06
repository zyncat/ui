'use client';

import '../select/select.css';
import './combobox.css';

import type { ReactNode } from 'react';

import type { DisableableAnimation } from '../../../motion/timing';
import type { MenuSize, MenuWeight, MenuWidth } from '../../internal/menu/highlight';
import type { ActivateOn } from '../../internal/utils/activation';
import { ListboxPanel, type SelectGroup, type SelectMenuHtmlProps, type SelectOption } from '../select/core';
import { optionText } from '../select/core/types';
import { useCombobox } from './use-combobox';

export type { SelectOption, SelectGroup } from '../select/core';

export interface ComboboxProps {
  /** The field the list completes: one `input` or `textarea`, or a component rendering one, such as `TextField`
   *  or `Textarea`. Focus stays in it - the arrow keys walk the list and Enter picks. */
  children: ReactNode;
  /** The suggestions - a flat `SelectOption[]`, or `SelectGroup[]` for labeled sections - filtered by the query. */
  options: SelectOption[] | SelectGroup[];
  /** Characters that start a query mid-text, such as `@` for mentions. The list opens when they are typed at the
   *  start of a word, filters on the text up to the caret, and a pick replaces that text. Without a trigger the
   *  whole value is the query. */
  trigger?: string;
  /** The text a pick writes over the query, trigger included. The edit goes through the browser, so undo
   *  restores the query and the field's own `onChange` fires. @default the trigger, the option's text and a
   *  space; the option's text alone without a `trigger` */
  insert?: (option: SelectOption) => string;
  /** Fires after a pick has written its text into the field - gets the option's `value` and the full option. */
  onSelect?: (value: string, option: SelectOption) => void;
  /** Where the list hangs: `caret` from the start of the query, `field` under the whole field.
   *  @default 'caret' with a `trigger`, else 'field' */
  anchor?: 'caret' | 'field';
  /** List width. `trigger` is never narrower than the field, `auto` fits the options, and `sm` | `md` | `lg` are
   *  fixed steps with long labels ellipsizing. @default 'trigger' under the field, 'auto' at the caret */
  width?: MenuWidth;
  /** List density - row type and padding. A row carrying a description sits one step taller. @default 'md' */
  size?: MenuSize;
  /** Weight of every option label. @default 'medium' */
  weight?: MenuWeight;
  /** Hue of the highlight that travels between options: the neutral wash, or the accent wash with accent ink on
   *  the active option. @default 'neutral' */
  highlight?: 'neutral' | 'accent';
  /** Short accent bar on the leading edge of the highlight, marking the active option. @default false */
  rail?: boolean;
  /** Base id for the list and option ids; auto-generated if omitted. */
  id?: string;
  /** Accessible name for the list. */
  ariaLabel?: string;
  /** Standard attributes (className, style, data-*, ...) forwarded to the list panel, which portals to <body>. */
  menuProps?: SelectMenuHtmlProps;
  /** Whether an option picks on `pointerdown` (snappier) or waits for `click`. @default 'pointerdown' */
  activateOn?: ActivateOn;
  /** List open/close timing - motion tokens only, or `null` to disable. @default duration 'base' + ease 'entrance'/'exit' */
  animation?: DisableableAnimation;
}

export function Combobox({
  children,
  options = [],
  trigger,
  insert = (option) => (trigger ? trigger + optionText(option) + ' ' : optionText(option)),
  onSelect,
  anchor = trigger ? 'caret' : 'field',
  width = anchor === 'field' ? 'trigger' : 'auto',
  size = 'md',
  weight = 'medium',
  highlight = 'neutral',
  rail = false,
  id,
  ariaLabel,
  menuProps,
  activateOn = 'pointerdown',
  animation,
}: ComboboxProps) {
  const { lb, caretAnchor, wrapProps } = useCombobox({ options, trigger, insert, onSelect, id });

  return (
    <div {...wrapProps} className="zc-combobox">
      {children}
      <ListboxPanel
        lb={lb}
        anchor={anchor === 'caret' ? caretAnchor : null}
        loading={false}
        searchable={false}
        ariaLabel={ariaLabel}
        highlight={highlight}
        rail={rail}
        size={size}
        weight={weight}
        width={width}
        activateOn={activateOn}
        animation={animation}
        menuProps={menuProps}
      />
    </div>
  );
}
