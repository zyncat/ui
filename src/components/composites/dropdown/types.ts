import type { HTMLAttributes, ReactNode, RefObject } from 'react';

import type { DataAttributes } from '../../../dom-props';
import { normalizeCollection, type NormalizedGroup } from '../../internal/collection/collection';
import type { MenuHighlight, MenuSize, MenuWeight } from '../../internal/menu/highlight';
import type { ActivateOn } from '../../internal/utils/activation';

export interface DropdownItem {
  /** Unique id - what `onSelect` receives, and what identifies this row's open submenu. */
  id: string;
  /** Primary row text. */
  label: ReactNode;
  /** Optional secondary line under the label. */
  description?: string;
  /** Your own icon node shown before the label. */
  icon?: ReactNode;
  /** Keyboard hint shown at the trailing edge, mono. Display only - you still bind the key. */
  shortcut?: string;
  /** Destructive action - the row reads in the danger hue. @default false */
  danger?: boolean;
  /** Not selectable - skipped by arrow keys and typeahead, and marked `aria-disabled`. @default false */
  disabled?: boolean;
  /** Marks the row as the current value of a single-choice group: accent ink with a check at rest, and
   *  `menuitemradio` semantics. Leave undefined for plain action rows. */
  selected?: boolean;
  /** Nested menu. The row opens it instead of committing, and can nest again without limit. */
  items?: DropdownItem[] | DropdownGroup[];
  /** Your own panel body, opened from this row in place of a submenu. Nothing inside it commits the menu -
   *  drive dismissal with `open`/`onOpenChange`. */
  content?: ReactNode;
  /** Text used for typeahead. Required when `label` is not a string. */
  searchText?: string;
  /** Fires when this row commits, before the menu's own `onSelect`. */
  onSelect?: () => void;
}

export interface DropdownGroup {
  /** Section heading rendered above the rows; omit for an unlabeled but still divided group. */
  label?: string;
  /** The rows in this section. */
  items: DropdownItem[];
}

export type DropdownItems = DropdownItem[] | DropdownGroup[];

export const normalize = (source: DropdownItems): { groups: NormalizedGroup<DropdownItem>[]; flat: DropdownItem[] } =>
  normalizeCollection<DropdownItem, DropdownGroup>(source, {
    isGroup: (entry): entry is DropdownGroup => !('id' in entry),
    itemsOf: (group) => group.items,
    labelOf: (group) => group.label,
  });

export const itemText = (item: DropdownItem): string =>
  item.searchText ?? (typeof item.label === 'string' ? item.label : item.id);

export const submenuOf = (item: DropdownItem): DropdownItems | null =>
  item.items && item.items.length > 0 ? item.items : null;

export const hasContent = (item: DropdownItem): boolean => item.content != null;

export type LevelPopup = 'menu' | 'dialog';

export const popupOf = (item: DropdownItem): LevelPopup | null =>
  hasContent(item) ? 'dialog' : submenuOf(item) ? 'menu' : null;

export const opensLevel = (item: DropdownItem): boolean => popupOf(item) != null;

export const ROOT_LEVEL = 'root';
export const levelKey = (depth: number, ownerId: string) => depth + ':' + ownerId;

const NO_ROWS: DropdownItem[] = [];

export interface Level {
  key: string;
  items: DropdownItems;
  content?: ReactNode;
  owner: DropdownItem | null;
  ownerIdx: number;
}

export function resolveLevels(items: DropdownItems, path: string[]): Level[] {
  const levels: Level[] = [{ key: ROOT_LEVEL, items, owner: null, ownerIdx: -1 }];
  for (const id of path) {
    const { flat } = normalize(levels[levels.length - 1].items);
    const ownerIdx = flat.findIndex((item) => item.id === id);
    if (ownerIdx < 0) break;
    const owner = flat[ownerIdx];
    const sub = submenuOf(owner);
    const key = levelKey(levels.length, id);
    if (hasContent(owner)) levels.push({ key, items: NO_ROWS, content: owner.content, owner, ownerIdx });
    else if (sub) levels.push({ key, items: sub, owner, ownerIdx });
    else break;
  }
  return levels;
}

export type SeedFocus = 'first' | 'last' | 'selected' | 'none';

export interface MenuChain {
  levels: Level[];
  menuId: string;
  activateOn?: ActivateOn;
  side: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
  highlight: MenuHighlight;
  rail: boolean;
  size: MenuSize;
  weight: MenuWeight;
  ariaLabel?: string;
  htmlProps?: HTMLAttributes<HTMLDivElement> & DataAttributes;
  seed: { key: string; focus: SeedFocus };
  hoverDepth: { current: number };
  refFor: (key: string) => RefObject<HTMLElement>;
  openSub: (depth: number, item: DropdownItem, focus: SeedFocus) => void;
  closeSub: (depth: number) => void;
  cancel: (depth: number) => void;
  dismiss: (returnFocus: boolean) => void;
  select: (item: DropdownItem) => void;
}
