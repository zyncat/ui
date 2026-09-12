import type { ReactNode } from 'react';

import { normalizeCollection, type NormalizedGroup as CollectionGroup } from '../../../internal/collection/collection';

export interface SelectOption {
  /** The stored value - what `onChange` returns and `value` matches; must be unique. */
  value: string;
  /** Primary row text, and the trigger label once selected; also matched by `searchable`. */
  label: ReactNode;
  /** Optional secondary line under the label; also matched by `searchable`. */
  description?: string;
  /** Your own icon node shown before the label. */
  icon?: ReactNode;
  /** Not selectable - skipped by keyboard nav and typeahead, and marked `aria-disabled`. @default false */
  disabled?: boolean;
  /** Text used for `searchable` filtering and typeahead. Required when `label` is not a string. */
  searchText?: string;
}
export interface SelectGroup {
  /** Section heading rendered above the options; omit for an unlabeled group. */
  label?: string;
  /** The options in this section. */
  options: SelectOption[];
}

export type NormalizedGroup = CollectionGroup<SelectOption>;

export interface ListRow {
  option: SelectOption;
  index: number;
}
export interface ListSection {
  key: string;
  label?: string;
  rows: ListRow[];
}

export const normalize = (
  options: SelectOption[] | SelectGroup[],
): { groups: NormalizedGroup[]; flat: SelectOption[] } =>
  normalizeCollection<SelectOption, SelectGroup>(options, {
    isGroup: (entry): entry is SelectGroup => Array.isArray((entry as SelectGroup).options),
    itemsOf: (group) => group.options,
    labelOf: (group) => group.label,
  });

export const optionText = (o: SelectOption): string =>
  o.searchText ?? (typeof o.label === 'string' ? o.label : o.value);

export const matches = (o: SelectOption, q: string) =>
  !q || (optionText(o) + ' ' + (o.description || '')).toLowerCase().includes(q.toLowerCase());
