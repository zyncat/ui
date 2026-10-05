'use client';

import type { ReactNode } from 'react';

import { Icon } from '../../internal/icon/Icon';
import { activationProps, type ActivateOn } from '../../internal/utils/activation';
import type { TableColumn, TableSort } from './types';

export function cellMods(col: TableColumn, i: number, pinFirst: boolean, selectable: boolean) {
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

interface TableHeadProps<Row> {
  columns: TableColumn<Row>[];
  sort: TableSort | null;
  onSort: (col: TableColumn<Row>) => void;
  activateOn: ActivateOn;
  mods: (col: TableColumn<Row>, i: number) => string[];
  selectAll: ReactNode;
  checkCellCls: string;
  toggleColumn: boolean;
}

export function TableHead<Row>({
  columns,
  sort,
  onSort,
  activateOn,
  mods,
  selectAll,
  checkCellCls,
  toggleColumn,
}: TableHeadProps<Row>) {
  return (
    <thead>
      <tr>
        {selectAll ? (
          <th scope="col" className={checkCellCls}>
            {selectAll}
          </th>
        ) : null}
        {columns.map((c, i) => {
          const active = sort && sort.key === c.key;
          const cls = (c.sortable ? ['zc-tbl__cell--sortable'] : []).concat(mods(c, i));
          return (
            <th
              key={c.key}
              scope="col"
              className={cls.join(' ')}
              style={c.width ? { width: c.width } : undefined}
              aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
            >
              {c.sortable ? (
                <button
                  type="button"
                  className="zc-tbl__sort"
                  {...activationProps<HTMLButtonElement>(() => onSort(c), { on: activateOn })}
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
        {toggleColumn ? <th scope="col" className="zc-tbl__cell--toggle" /> : null}
      </tr>
    </thead>
  );
}
