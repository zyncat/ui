import type { HTMLAttributes, ReactNode } from 'react';

import type { DataAttributes } from '../../../dom-props';
import type { ActivateOn } from '../../internal/utils/activation';

export type TableAlign = 'start' | 'end' | 'center';
export type TableHideBelow = 'sm' | 'md';

export interface TableColumn<Row = any> {
  /** Unique column id; also the default data accessor (row[key]). */
  key: string;
  /** Header cell content; omit for a header-less column (e.g. an actions column). */
  label?: ReactNode;
  /** Cell + header alignment. Default 'start'. */
  align?: TableAlign;
  /** Mono + tabular numerals (timestamps, counts, IDs - section E). */
  mono?: boolean;
  /** Identity emphasis: strong text, medium weight. */
  strong?: boolean;
  /** The one greedy column - absorbs slack width. Others size to content. */
  grow?: boolean;
  /** Share of the table's width this column takes, e.g. '30%'. A grow column takes what the shares leave;
   *  when the table is too narrow, the cells' content widths win. */
  width?: `${number}%`;
  /** Header becomes a sort control. Sort is local; asc - desc, no third state. */
  sortable?: boolean;
  /** Sort accessor: a row property name, or a function. Defaults to row[key]. */
  sortBy?: string | ((row: Row) => unknown);
  /** Collapse this column below a container breakpoint (30rem / 42rem). */
  hideBelow?: TableHideBelow;
  /** Custom cell renderer. Defaults to row[key]. */
  render?: (row: Row) => ReactNode;
}

export interface TableSort {
  /** `key` of the column being sorted by. */
  key: string;
  /** Sort direction - `asc` or `desc`. */
  dir: 'asc' | 'desc';
}

export interface TableProps<Row = any> {
  /** Column defs, rendered left to right. */
  columns: TableColumn<Row>[];
  /** The row data; sorted locally per the active sort before render. */
  rows: Row[];
  /** Row identity property. Default 'id'. Must be unique and stable. */
  rowKey?: string;
  /** Accessible name for the <table>. */
  ariaLabel?: string;

  /** Checkbox column + bulk bar. Selection is a Set of row keys, owned here. */
  selectable?: boolean;
  /** Fires with the selected row keys after every selection change. */
  onSelectionChange?: (keys: Array<string | number>) => void;
  /** Rendered in the bulk bar between the count and the built-in Clear. */
  bulkActions?: (keys: Array<string | number>, clear: () => void) => ReactNode;
  /** Per-row checkbox aria-label. Default 'Select row'. */
  selectionLabel?: (row: Row) => string;

  /** Initial sort; sorting stays local and uncontrolled after that. */
  defaultSort?: TableSort | null;
  /** Notification only - fires after the local sort updates. */
  onSortChange?: (sort: TableSort) => void;

  /** A row's details, unfolding full width under it from its disclosure button or a click on the
   *  row. A falsy return leaves that row without details. */
  renderDetail?: (row: Row) => ReactNode;
  /** Keys of the rows whose details are open. Omit to let the table own it. */
  expanded?: Array<string | number>;
  /** Fires with the open row keys after every toggle. */
  onExpandedChange?: (keys: Array<string | number>) => void;
  /** `single` closes the open row as another opens. Default 'multiple'. */
  expandMode?: 'single' | 'multiple';

  /** Row rhythm. Default 'cozy' (46px rows); 'compact' is 38px. */
  density?: 'cozy' | 'compact';
  /** Pin checkbox + first column under horizontal overflow. Default true. */
  pinFirst?: boolean;

  /** Rows recede and go inert (list-fetch convention). */
  loading?: boolean;
  /** Shown when rows is empty and not loading. Default 'Nothing to show'. */
  empty?: ReactNode;
  /** Footer strip - pagination, summaries. */
  footer?: ReactNode;

  /** Makes rows clickable. A click on the checkbox cell, or on a link, button, field or label in a
   *  cell, stays with it. */
  onRowClick?: (row: Row) => void;
  /** Whether a sortable header fires on `pointerdown` (snappier) or waits for `click`. @default 'pointerdown' */
  activateOn?: ActivateOn;
  /** Size the table here - the internal scroller absorbs the constraint. */
  className?: string;
  /** Standard <div> attributes (style, data-*, aria-*, ...) forwarded to the table wrapper. */
  htmlProps?: Omit<HTMLAttributes<HTMLDivElement>, 'className'> & DataAttributes;
}
