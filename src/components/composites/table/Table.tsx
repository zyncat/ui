'use client';

import './table.css';

import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent,
  type PointerEventHandler,
  type ReactNode,
} from 'react';

import type { DataAttributes } from '../../../dom-props';
import { Motion } from '../../../motion/element';
import { GlidePill, useGlide } from '../../../motion/glide';
import { UIMotion } from '../../../tokens/motion-tokens';
import { useScrollEdges } from '../../internal/hooks/use-scroll-edges';
import { Icon } from '../../internal/icon/Icon';
import { activationProps, type ActivateOn } from '../../internal/utils/activation';
import { cx } from '../../internal/utils/cx';
import { DigitStrip } from '../../primitives/badge/digit-strip';
import { Button } from '../../primitives/button/Button';
import { Checkbox } from '../../primitives/checkbox/Checkbox';
import { DetailRow, DetailToggle, rowNameId, useExpanded } from './detail';

const ROW_FLIP = { timing: UIMotion.t.layout };
const PRESS_OWNERS = 'a, button, input, select, textarea, label, tr';

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

function tblCompare(a: unknown, b: unknown) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

export function Table<Row = any>({
  columns = [],
  rows = [],
  rowKey = 'id',
  ariaLabel,
  selectable = false,
  onSelectionChange,
  bulkActions,
  selectionLabel,
  defaultSort = null,
  onSortChange,
  renderDetail,
  expanded,
  onExpandedChange,
  expandMode = 'multiple',
  density = 'cozy',
  pinFirst = true,
  loading = false,
  empty,
  footer,
  onRowClick,
  activateOn = 'pointerdown',
  className = '',
  htmlProps,
}: TableProps<Row>) {
  const [sort, setSort] = useState<TableSort | null>(defaultSort);
  const [selected, setSelected] = useState<Set<string | number>>(() => new Set());
  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const hoveredRef = useRef<HTMLElement | null>(null);
  const lastIdxRef = useRef(-1);
  const shiftRef = useRef(false);
  const lastCountRef = useRef(0);
  const uid = useId();
  const glide = useGlide(scrollRef);
  const [openKeys, toggleDetail] = useExpanded(expanded, onExpandedChange, expandMode);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return undefined;
    const follow = new ResizeObserver(() => glide.enter(hoveredRef.current));
    follow.observe(table);
    return () => follow.disconnect();
  }, [glide]);

  function hoverRow(row: Element | null) {
    hoveredRef.current = row instanceof HTMLElement ? row : null;
    glide.enter(hoveredRef.current);
  }
  function leaveRows() {
    hoveredRef.current = null;
    glide.leave();
  }
  const enterRow: PointerEventHandler<HTMLElement> = (e) => hoverRow(e.currentTarget);
  const enterDetail: PointerEventHandler<HTMLElement> = (e) => hoverRow(e.currentTarget.previousElementSibling);

  function pressRow(e: MouseEvent<HTMLElement>, row: Row, detailKey: string | number | null) {
    if (!(e.target instanceof Element) || e.target.closest(PRESS_OWNERS) !== e.currentTarget) return;
    if (detailKey != null) toggleDetail(detailKey);
    if (onRowClick) onRowClick(row);
  }

  const keyOf = (row: Row): string | number => (row as Record<string, string | number>)[rowKey];

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const get =
      typeof col.sortBy === 'function'
        ? col.sortBy
        : col.sortBy
          ? (r: Row) => (r as Record<string, unknown>)[col.sortBy as string]
          : (r: Row) => (r as Record<string, unknown>)[col.key];
    const dir = sort.dir === 'desc' ? -1 : 1;
    return rows.slice().sort((a, b) => dir * tblCompare(get(a), get(b)));
  }, [rows, columns, sort]);

  function cycleSort(col: TableColumn<Row>) {
    const next: TableSort =
      sort && sort.key === col.key
        ? { key: col.key, dir: sort.dir === 'asc' ? 'desc' : 'asc' }
        : { key: col.key, dir: 'asc' };
    setSort(next);
    if (onSortChange) onSortChange(next);
  }

  const allSelected = sortedRows.length > 0 && sortedRows.every((r) => selected.has(keyOf(r)));
  const someSelected = selected.size > 0 && !allSelected;

  function commitSelection(next: Set<string | number>) {
    setSelected(next);
    if (onSelectionChange) onSelectionChange(Array.from(next));
  }
  function clearSelection() {
    lastIdxRef.current = -1;
    commitSelection(new Set());
  }
  function toggleAll() {
    const next = new Set<string | number>();
    if (!allSelected) sortedRows.forEach((r) => next.add(keyOf(r)));
    commitSelection(next);
  }
  function toggleRow(idx: number) {
    const next = new Set(selected);
    const on = !next.has(keyOf(sortedRows[idx]));
    if (shiftRef.current && lastIdxRef.current >= 0 && lastIdxRef.current !== idx) {
      const lo = Math.min(lastIdxRef.current, idx);
      const hi = Math.max(lastIdxRef.current, idx);
      for (let i = lo; i <= hi; i++) {
        const k = keyOf(sortedRows[i]);
        if (on) next.add(k);
        else next.delete(k);
      }
    } else if (on) {
      next.add(keyOf(sortedRows[idx]));
    } else {
      next.delete(keyOf(sortedRows[idx]));
    }
    lastIdxRef.current = idx;
    shiftRef.current = false;
    commitSelection(next);
  }

  useScrollEdges(
    scrollRef,
    (edges, el) => {
      const w = wrapRef.current;
      if (!w) return;
      const set = (attr: string, on: boolean) => {
        if (on) w.setAttribute(attr, '');
        else w.removeAttribute(attr);
      };
      set('data-scrolled', el.scrollTop > 0);
      set('data-y-scroll', el.scrollHeight > el.clientHeight);
      set('data-x-back', edges.left);
      set('data-x-more', edges.right);
    },
    { content: true },
  );

  function cellMods(col: TableColumn<Row>, i: number) {
    const a: string[] = [];
    if (col.align === 'end') a.push('zc-tbl__cell--end');
    if (col.align === 'center') a.push('zc-tbl__cell--center');
    if (col.grow) a.push('zc-tbl__cell--grow');
    if (col.hideBelow) a.push('zc-tbl__cell--hide-' + col.hideBelow);
    if (pinFirst && i === 0) {
      a.push('zc-tbl__cell--pin', 'zc-tbl__cell--pinEdge');
      if (selectable) a.push('zc-tbl__cell--pinOff');
    }
    return a;
  }

  const colCount = columns.length + (selectable ? 1 : 0) + (renderDetail ? 1 : 0);
  const showEmpty = !loading && sortedRows.length === 0;
  const checkCellCls = 'zc-tbl__cell--check' + (pinFirst ? ' zc-tbl__cell--pin' : '');

  const checkSize = density === 'compact' ? 'sm' : 'md';
  const toggleSize = density === 'compact' ? 'xs' : 'sm';
  const bulkOpen = selectable && selected.size > 0;
  if (selected.size > 0) lastCountRef.current = selected.size;

  const rootCls = cx(
    'zc-tbl',
    density === 'compact' && 'zc-tbl--compact',
    pinFirst && 'zc-tbl--pin',
    loading && 'zc-tbl--loading',
    onRowClick && 'zc-tbl--clickable',
    className,
  );

  return (
    <div ref={wrapRef} className={rootCls} {...htmlProps}>
      {selectable ? (
        <div
          className="zc-tbl__bulk"
          data-open={bulkOpen ? '' : undefined}
          aria-hidden={bulkOpen ? undefined : true}
          role="toolbar"
          aria-label="Selection actions"
        >
          <Checkbox
            className="zc-tbl__cbx"
            size={checkSize}
            checked={allSelected}
            indeterminate={someSelected}
            htmlProps={{ 'aria-label': 'Select all rows' }}
            onChange={toggleAll}
          />
          <span className="zc-tbl__bulkCount" aria-live="polite" aria-atomic="true">
            <DigitStrip value={bulkOpen ? selected.size : lastCountRef.current} />
            <span> selected</span>
          </span>
          <span className="zc-tbl__bulkSpacer"></span>
          {bulkActions ? bulkActions(Array.from(selected), clearSelection) : null}
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            Clear
          </Button>
        </div>
      ) : null}

      <div className="zc-tbl__viewport">
        <div className="zc-tbl__scroll" ref={scrollRef}>
          <table ref={tableRef} className="zc-tbl__table" aria-label={ariaLabel} aria-busy={loading || undefined}>
            <thead>
              <tr>
                {selectable ? (
                  <th scope="col" className={checkCellCls}>
                    <Checkbox
                      className="zc-tbl__cbx"
                      size={checkSize}
                      checked={allSelected}
                      indeterminate={someSelected}
                      htmlProps={{ 'aria-label': 'Select all rows' }}
                      onChange={toggleAll}
                    />
                  </th>
                ) : null}
                {columns.map((c, i) => {
                  const active = sort && sort.key === c.key;
                  const cls = (c.sortable ? ['zc-tbl__cell--sortable'] : []).concat(cellMods(c, i));
                  return (
                    <th
                      key={c.key}
                      scope="col"
                      className={cls.join(' ')}
                      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      {c.sortable ? (
                        <button
                          type="button"
                          className="zc-tbl__sort"
                          {...activationProps<HTMLButtonElement>(() => cycleSort(c), { on: activateOn })}
                        >
                          <span className="zc-tbl__sortLbl">{c.label}</span>
                          <span
                            className={
                              'zc-tbl__sortIcon' +
                              (active ? ' zc-is-on' : '') +
                              (active && sort.dir === 'desc' ? ' zc-is-desc' : '')
                            }
                            aria-hidden="true"
                          >
                            <Icon name="arrow-up" size="sm" />
                          </span>
                        </button>
                      ) : c.label != null ? (
                        <span className="zc-tbl__hLbl">{c.label}</span>
                      ) : null}
                    </th>
                  );
                })}
                {renderDetail ? <th scope="col" className="zc-tbl__cell--toggle" /> : null}
              </tr>
            </thead>
            <tbody onPointerLeave={leaveRows}>
              {showEmpty ? (
                <tr>
                  <td colSpan={colCount} className="zc-tbl__emptyCell">
                    {empty != null ? empty : 'Nothing to show'}
                  </td>
                </tr>
              ) : (
                sortedRows.map((row, idx) => {
                  const k = keyOf(row);
                  const isSel = selected.has(k);
                  const detail = renderDetail ? renderDetail(row) : null;
                  const open = openKeys.includes(k);
                  const id = `${uid}${idx}`;
                  return (
                    <Fragment key={k}>
                      <Motion
                        as="tr"
                        layout
                        layoutTransition={ROW_FLIP}
                        className="zc-tbl__row"
                        data-selected={isSel ? '' : undefined}
                        data-expandable={detail ? '' : undefined}
                        onClick={
                          onRowClick || detail
                            ? (e: MouseEvent<HTMLElement>) => pressRow(e, row, detail ? k : null)
                            : undefined
                        }
                        onPointerEnter={enterRow}
                      >
                        {selectable ? (
                          <td className={checkCellCls} onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              className="zc-tbl__cbx"
                              size={checkSize}
                              checked={isSel}
                              htmlProps={{
                                'aria-label': selectionLabel ? selectionLabel(row) : 'Select row',
                                onClick: (e) => {
                                  shiftRef.current = e.shiftKey;
                                },
                              }}
                              onChange={() => toggleRow(idx)}
                            />
                          </td>
                        ) : null}
                        {columns.map((c, i) => (
                          <td
                            key={c.key}
                            id={detail && i === 0 ? rowNameId(id) : undefined}
                            className={cellMods(c, i)
                              .concat(c.mono ? ['zc-tbl__cell--mono'] : [])
                              .concat(c.strong ? ['zc-tbl__cell--strong'] : [])
                              .join(' ')}
                          >
                            {c.render ? c.render(row) : (row as Record<string, ReactNode>)[c.key]}
                          </td>
                        ))}
                        {renderDetail ? (
                          <td className="zc-tbl__cell--toggle">
                            {detail ? (
                              <DetailToggle id={id} open={open} size={toggleSize} onToggle={() => toggleDetail(k)} />
                            ) : null}
                          </td>
                        ) : null}
                      </Motion>
                      {detail ? (
                        <DetailRow id={id} open={open} span={colCount} flip={ROW_FLIP} onPointerEnter={enterDetail}>
                          {detail}
                        </DetailRow>
                      ) : null}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
          <GlidePill className="zc-tbl__glide" glide={glide} />
        </div>
        <div className="zc-tbl__edge zc-tbl__edge--l" aria-hidden="true"></div>
        <div className="zc-tbl__edge zc-tbl__edge--r" aria-hidden="true"></div>
      </div>

      {footer ? <div className="zc-tbl__foot">{footer}</div> : null}
    </div>
  );
}
