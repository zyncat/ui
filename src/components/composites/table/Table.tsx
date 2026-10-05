'use client';

import './table.css';

import { useRef } from 'react';

import { GlidePill } from '../../../motion/glide';
import { cx } from '../../internal/utils/cx';
import { DigitStrip } from '../../primitives/badge/digit-strip';
import { Button } from '../../primitives/button/Button';
import { Checkbox } from '../../primitives/checkbox/Checkbox';
import { TableBody } from './body';
import { cellMods, TableHead } from './head';
import type { TableColumn, TableProps } from './types';
import { useEdgeAttributes, useRowGlide } from './use-scroller';
import { useSelection, useSort } from './use-table-state';

export type { TableAlign, TableColumn, TableHideBelow, TableProps, TableSort } from './types';

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
  const { sort, sortedRows, cycleSort } = useSort(rows, columns, defaultSort, onSortChange);
  const keyOf = (row: Row): string | number => (row as Record<string, string | number>)[rowKey];
  const selection = useSelection(sortedRows, keyOf, onSelectionChange);
  const { selected, allSelected, someSelected, toggleAll, clearSelection } = selection;
  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);
  const { tableRef, glide, hoverRow, leaveRows } = useRowGlide(scrollRef);
  useEdgeAttributes(scrollRef, wrapRef);

  const mods = (c: TableColumn<Row>, i: number) => cellMods(c, i, pinFirst, selectable);
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
    columns.some((c) => c.width) && columns.some((c) => c.grow) && 'zc-tbl--shares',
    className,
  );
  const selectAll = selectable ? (
    <Checkbox
      className="zc-tbl__cbx"
      size={checkSize}
      checked={allSelected}
      indeterminate={someSelected}
      htmlProps={{ 'aria-label': 'Select all rows' }}
      onChange={toggleAll}
    />
  ) : null;

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
          {selectAll}
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
            <TableHead
              columns={columns}
              sort={sort}
              onSort={cycleSort}
              activateOn={activateOn}
              mods={mods}
              selectAll={selectAll}
              checkCellCls={checkCellCls}
              toggleColumn={!!renderDetail}
            />
            <TableBody
              rows={sortedRows}
              keyOf={keyOf}
              columns={columns}
              mods={mods}
              selectable={selectable}
              selection={selection}
              selectionLabel={selectionLabel}
              checkCellCls={checkCellCls}
              checkSize={checkSize}
              toggleSize={toggleSize}
              renderDetail={renderDetail}
              expanded={expanded}
              onExpandedChange={onExpandedChange}
              expandMode={expandMode}
              loading={loading}
              empty={empty}
              onRowClick={onRowClick}
              hoverRow={hoverRow}
              leaveRows={leaveRows}
            />
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
