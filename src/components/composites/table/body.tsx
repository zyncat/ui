'use client';

import { Fragment, useId, type MouseEvent, type PointerEventHandler, type ReactNode } from 'react';

import { Motion } from '../../../motion/element';
import { Presence } from '../../../motion/presence';
import { UIMotion } from '../../../tokens/motion-tokens';
import { Checkbox } from '../../primitives/checkbox/Checkbox';
import { DetailRow, DetailToggle, rowNameId, useExpanded } from './detail';
import type { TableColumn, TableProps } from './types';
import type { Selection } from './use-table-state';

const ROW_MOTION = {
  layout: true,
  layoutTransition: { timing: UIMotion.t.layout },
  animate: { opacity: [0, 1], y: [UIMotion.dist.sm, 0], timing: UIMotion.t.enter },
  exit: { opacity: [0], y: [UIMotion.dist.sm], timing: UIMotion.t.exit },
};
const PRESS_OWNERS = 'a, button, input, select, textarea, label, tr';

type TableBodyProps<Row> = Pick<
  TableProps<Row>,
  'columns' | 'selectionLabel' | 'renderDetail' | 'expanded' | 'onExpandedChange' | 'empty' | 'onRowClick'
> &
  Required<Pick<TableProps<Row>, 'selectable' | 'expandMode' | 'loading'>> & {
    rows: Row[];
    keyOf: (row: Row) => string | number;
    mods: (col: TableColumn<Row>, i: number) => string[];
    selection: Selection;
    checkCellCls: string;
    checkSize: 'sm' | 'md';
    toggleSize: 'xs' | 'sm';
    hoverRow: (row: Element | null) => void;
    leaveRows: () => void;
  };

export function TableBody<Row>({
  rows,
  keyOf,
  columns,
  mods,
  selectable,
  selection,
  selectionLabel,
  checkCellCls,
  checkSize,
  toggleSize,
  renderDetail,
  expanded,
  onExpandedChange,
  expandMode,
  loading,
  empty,
  onRowClick,
  hoverRow,
  leaveRows,
}: TableBodyProps<Row>) {
  const uid = useId();
  const [openKeys, toggleDetail] = useExpanded(expanded, onExpandedChange, expandMode);
  const colCount = columns.length + (selectable ? 1 : 0) + (renderDetail ? 1 : 0);
  const showEmpty = !loading && rows.length === 0;
  const enterRow: PointerEventHandler<HTMLElement> = (e) => hoverRow(e.currentTarget);
  const enterDetail: PointerEventHandler<HTMLElement> = (e) => hoverRow(e.currentTarget.previousElementSibling);

  function pressRow(e: MouseEvent<HTMLElement>, row: Row, detailKey: string | number | null) {
    if (!(e.target instanceof Element) || e.target.closest(PRESS_OWNERS) !== e.currentTarget) return;
    if (detailKey != null) toggleDetail(detailKey);
    if (onRowClick) onRowClick(row);
  }

  return (
    <tbody onPointerLeave={leaveRows}>
      <Presence initial={false} mode={showEmpty ? 'wait' : 'sync'}>
        {showEmpty && (
          <Motion as="tr" key="empty" {...ROW_MOTION}>
            <td colSpan={colCount} className="zc-tbl__emptyCell">
              {empty != null ? empty : 'Nothing to show'}
            </td>
          </Motion>
        )}
        {rows.map((row, idx) => {
          const k = keyOf(row);
          const isSel = selection.selected.has(k);
          const detail = renderDetail ? renderDetail(row) : null;
          const open = openKeys.includes(k);
          const id = `${uid}${idx}`;
          return (
            <Fragment key={k}>
              <Motion
                as="tr"
                {...ROW_MOTION}
                className="zc-tbl__row"
                data-selected={isSel ? '' : undefined}
                data-expandable={detail ? '' : undefined}
                onClick={
                  onRowClick || detail ? (e: MouseEvent<HTMLElement>) => pressRow(e, row, detail ? k : null) : undefined
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
                          selection.shiftRef.current = e.shiftKey;
                        },
                      }}
                      onChange={() => selection.toggleRow(idx)}
                    />
                  </td>
                ) : null}
                {columns.map((c, i) => (
                  <td
                    key={c.key}
                    id={detail && i === 0 ? rowNameId(id) : undefined}
                    className={mods(c, i)
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
                <DetailRow id={id} open={open} span={colCount} motion={ROW_MOTION} onPointerEnter={enterDetail}>
                  {detail}
                </DetailRow>
              ) : null}
            </Fragment>
          );
        })}
      </Presence>
    </tbody>
  );
}
