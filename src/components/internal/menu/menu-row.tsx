'use client';

import './menu-surface.css';

import type { HTMLAttributes, ReactNode, Ref } from 'react';

import type { DataAttributes } from '../../../dom-props';
import { cx } from '../utils/cx';

export interface MenuRowProps extends HTMLAttributes<HTMLDivElement>, DataAttributes {
  ref?: Ref<HTMLDivElement>;
  icon?: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
}

export function MenuRow({ ref, icon, label, description, trailing, className, ...rest }: MenuRowProps) {
  return (
    <div ref={ref} className={cx('zc-menu-row', className)} {...rest}>
      {icon && <span className="zc-menu-row__icon">{icon}</span>}
      <span className="zc-menu-row__text">
        <span className="zc-menu-row__label">{label}</span>
        {description && <span className="zc-menu-row__desc">{description}</span>}
      </span>
      {trailing}
    </div>
  );
}
