'use client';

import './collapse.css';

import type { CSSProperties, HTMLAttributes, JSX, ReactNode } from 'react';

import type { DataAttributes } from '../../../dom-props';
import {
  timingVars,
  type AnimationTiming,
  type DirectionalToken,
  type DisableableAnimation,
  type TimingProps,
} from '../../../motion/timing';
import type { DurationToken, EaseToken } from '../../../tokens/motion-scale';
import { cx } from '../../internal/utils/cx';

/** Motion-scale duration tokens - the only values Collapse timing accepts. */
export type CollapseDuration = DurationToken;
/** Motion-scale ease tokens - the only values Collapse timing accepts. */
export type CollapseEase = EaseToken;
/** One token for both directions, or split per direction; an omitted direction keeps its default. */
export type CollapseTiming<Token extends string> = DirectionalToken<Token>;
/** Grouped `{ duration, ease }` timing for the size/fade transition. */
export type CollapseAnimation = AnimationTiming;

interface CollapseOwnProps extends TimingProps {
  /** Open/closed state. Closed content is also removed from the tab order, the accessibility
   *  tree and hit-testing once the exit transition completes; reopening restores it before
   *  the entrance runs. */
  open?: boolean;
  /** Axis to animate. @default 'height' */
  axis?: 'height' | 'width';
  /** Also cross-fade contents while resizing; follows `duration` / `ease`. */
  fade?: boolean;
  /** Class applied to the inner wrapper - the clipping element (`overflow: clip` on the animated
   *  axis). Its padding stays while closed, so content whose focus ring sits flush to the clipped
   *  edge gets its room as `var(--ring-gutter)` of padding on a child. */
  innerClassName?: string;
  /** Size (and fade) transition timing - motion tokens only, each field one token or
   *  `{ open, close }`, e.g. `{ duration: { close: 'fast' }, ease: { close: 'exit' } }`.
   *  `null` disables the transition (open/close snap instantly).
   *  @default duration 'slow' + ease 'entrance' (fade-out: 'base' + 'standard') */
  animation?: DisableableAnimation;
  /** Tag to render as. @default 'div' */
  as?: keyof JSX.IntrinsicElements;
  /** Extra class(es) merged onto the root. */
  className?: string;
  /** Inline styles merged onto the root (composed with the timing custom properties). */
  style?: CSSProperties;
  /** The collapsing content. */
  children?: ReactNode;
}

export interface CollapseProps extends CollapseOwnProps {
  /** Standard <div> attributes (aria-*, data-*, ...) forwarded to the root. */
  htmlProps?: Omit<HTMLAttributes<HTMLDivElement>, keyof CollapseOwnProps> & DataAttributes;
}

export function Collapse({
  open = false,
  axis = 'height',
  fade = false,
  animation,
  className = '',
  innerClassName = '',
  style,
  children,
  as: As = 'div',
  htmlProps,
}: CollapseProps) {
  const cls = cx('zc-collapse', fade && 'zc-collapse--fade', className);

  const vars = timingVars('collapse', animation);

  return (
    <div
      className={cls}
      data-open={open ? 'true' : 'false'}
      data-axis={axis}
      style={vars || style ? ({ ...style, ...vars } as CSSProperties) : undefined}
      {...htmlProps}
    >
      <As className={cx('zc-collapse__inner', innerClassName)} style={vars}>
        {children}
      </As>
    </div>
  );
}
