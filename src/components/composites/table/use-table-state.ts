'use client';

import { useMemo, useRef, useState } from 'react';

import type { TableColumn, TableSort } from './types';

function tblCompare(a: unknown, b: unknown) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

export function useSort<Row>(
  rows: Row[],
  columns: TableColumn<Row>[],
  defaultSort: TableSort | null,
  onSortChange?: (sort: TableSort) => void,
) {
  const [sort, setSort] = useState<TableSort | null>(defaultSort);

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

  return { sort, sortedRows, cycleSort };
}

export function useSelection<Row>(
  rows: Row[],
  keyOf: (row: Row) => string | number,
  onSelectionChange?: (keys: Array<string | number>) => void,
) {
  const [selected, setSelected] = useState<Set<string | number>>(() => new Set());
  const lastIdxRef = useRef(-1);
  const shiftRef = useRef(false);

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(keyOf(r)));
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
    if (!allSelected) rows.forEach((r) => next.add(keyOf(r)));
    commitSelection(next);
  }
  function toggleRow(idx: number) {
    const next = new Set(selected);
    const on = !next.has(keyOf(rows[idx]));
    if (shiftRef.current && lastIdxRef.current >= 0 && lastIdxRef.current !== idx) {
      const lo = Math.min(lastIdxRef.current, idx);
      const hi = Math.max(lastIdxRef.current, idx);
      for (let i = lo; i <= hi; i++) {
        const k = keyOf(rows[i]);
        if (on) next.add(k);
        else next.delete(k);
      }
    } else if (on) {
      next.add(keyOf(rows[idx]));
    } else {
      next.delete(keyOf(rows[idx]));
    }
    lastIdxRef.current = idx;
    shiftRef.current = false;
    commitSelection(next);
  }

  return { selected, allSelected, someSelected, shiftRef, clearSelection, toggleAll, toggleRow };
}

export type Selection = ReturnType<typeof useSelection>;
