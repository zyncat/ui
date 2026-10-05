'use client';

import './table-detail.css';

import type { PointerEventHandler, ReactNode } from 'react';

import { Motion, type MotionProps } from '../../../motion/element';
import { useControllable } from '../../internal/hooks/use-controllable';
import { Icon } from '../../internal/icon/Icon';
import { Button, type ButtonSize } from '../../primitives/button/Button';
import { Collapse, type CollapseAnimation } from '../../primitives/collapse/Collapse';

type RowKey = string | number;

const NONE_OPEN: RowKey[] = [];
const DETAIL_MOTION: CollapseAnimation = { duration: { close: 'base' }, ease: { close: 'exit' } };

export const rowNameId = (id: string) => `${id}-n`;

export function useExpanded(
  value: RowKey[] | undefined,
  onChange: ((keys: RowKey[]) => void) | undefined,
  mode: 'single' | 'multiple',
) {
  const [open, setOpen] = useControllable(value, NONE_OPEN, onChange);
  const toggle = (key: RowKey) =>
    setOpen(open.includes(key) ? open.filter((k) => k !== key) : mode === 'single' ? [key] : [...open, key]);
  return [open, toggle] as const;
}

interface DetailToggleProps {
  id: string;
  open: boolean;
  size: ButtonSize;
  onToggle: () => void;
}

export function DetailToggle({ id, open, size, onToggle }: DetailToggleProps) {
  return (
    <Button
      variant="ghost"
      size={size}
      iconOnly
      className="zc-tbl__toggle"
      id={`${id}-t`}
      aria-label="Details"
      aria-labelledby={`${id}-t ${rowNameId(id)}`}
      aria-expanded={open}
      aria-controls={`${id}-d`}
      onClick={onToggle}
    >
      <Icon name="caret-down" />
    </Button>
  );
}

interface DetailRowProps {
  id: string;
  open: boolean;
  span: number;
  motion: Pick<MotionProps, 'layout' | 'layoutTransition' | 'animate' | 'exit'>;
  onPointerEnter: PointerEventHandler<HTMLElement>;
  children: ReactNode;
}

export function DetailRow({ id, open, span, motion, onPointerEnter, children }: DetailRowProps) {
  return (
    <Motion as="tr" {...motion} className="zc-tbl__detail" onPointerEnter={onPointerEnter}>
      <td colSpan={span}>
        <Collapse open={open} animation={DETAIL_MOTION} htmlProps={{ id: `${id}-d` }}>
          <div className="zc-tbl__detailBody">{children}</div>
        </Collapse>
      </td>
    </Motion>
  );
}
