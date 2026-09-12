'use client';

import './menu-surface.css';

import type { HTMLAttributes, ReactNode, Ref } from 'react';

import type { DataAttributes } from '../../../dom-props';
import { Motion } from '../../../motion/element';
import type { MotionSpecs } from '../../../motion/use-motion';
import { UIMotion } from '../../../tokens/motion-tokens';
import { cx } from '../utils/cx';

const FADE_STAGGER = 0.06;

function collapseMotion(): MotionSpecs {
  const size = { duration: UIMotion.dur.slow, ease: UIMotion.ease.entrance };
  return {
    animate: [
      { height: [0, 'auto'], timing: size },
      { opacity: [0, 1], timing: { ...size, delay: FADE_STAGGER } },
    ],
    exit: [
      { height: [0], timing: size },
      { opacity: [0], timing: { duration: UIMotion.dur.base, ease: UIMotion.ease.standard } },
    ],
  };
}

export function MenuGroupLabel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Motion className={cx('zc-menu-group-label', className)} {...collapseMotion()}>
      {children}
    </Motion>
  );
}

export interface MenuRowProps extends HTMLAttributes<HTMLDivElement>, DataAttributes {
  ref?: Ref<HTMLDivElement>;
  icon?: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
}

export function MenuRow({ ref, icon, label, description, trailing, className, ...rest }: MenuRowProps) {
  return (
    <Motion
      ref={ref as Ref<HTMLElement | null>}
      className={cx('zc-menu-row', className)}
      {...collapseMotion()}
      {...rest}
      data-desc={description ? 'true' : undefined}
    >
      {icon && <span className="zc-menu-row__icon">{icon}</span>}
      <span className="zc-menu-row__text">
        <span className="zc-menu-row__label">{label}</span>
        {description && <span className="zc-menu-row__desc">{description}</span>}
      </span>
      {trailing}
    </Motion>
  );
}
