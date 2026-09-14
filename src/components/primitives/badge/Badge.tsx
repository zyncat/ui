'use client';

import './badge.css';

import { useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

import type { DataAttributes } from '../../../dom-props';
import { cx } from '../../internal/utils/cx';
import { DigitStrip } from './digit-strip';
import { MorphLabel } from './morph-label';
import { useGlintOnChange } from './use-glint-on-change';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type BadgeAnimation = 'auto' | 'roll' | 'morph' | 'none';

interface BadgeOwnProps {
  /** The chip's content. Changing it animates in place. */
  value: string | number;
  /**
   * How a `value` change animates: `roll` spins each digit, `morph` re-letters the word.
   * `auto` rolls numbers and morphs text - name one to override a formatted figure like "1,024".
   * @default 'auto'
   */
  animate?: BadgeAnimation;
  /** Status hue. @default 'neutral' */
  tone?: BadgeTone;
  /** Surface: a flat toned fill, the frosted chip, or a hairline outline. @default 'soft' */
  variant?: 'soft' | 'glass' | 'outline';
  /** Chip density - `sm` is 20px for table rows and inline use. @default 'md' */
  size?: 'sm' | 'md';
  /** Sweep a sheen across the chip when `value` changes - for a state that has landed. */
  glint?: boolean;
  /** Leading status dot. */
  dot?: boolean;
  /** Dot pulses (implies dot) - for in-progress status. */
  live?: boolean;
  /** Fully-rounded shape. */
  pill?: boolean;
  /** Optional leading <Icon> (overrides dot if both set). */
  icon?: ReactNode;
  /** Extra class(es) merged onto the chip. */
  className?: string;
  /** Inline styles merged onto the chip. */
  style?: CSSProperties;
}

export interface BadgeProps extends BadgeOwnProps {
  /** Standard <span> attributes (aria-*, data-*, title, ...) forwarded to the chip. */
  htmlProps?: Omit<HTMLAttributes<HTMLSpanElement>, keyof BadgeOwnProps | 'children'> & DataAttributes;
}

export function Badge({
  value,
  animate = 'auto',
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  glint = false,
  dot = false,
  live = false,
  pill = false,
  icon = null,
  className = '',
  style,
  htmlProps,
}: BadgeProps) {
  const chipRef = useRef<HTMLSpanElement>(null);
  const text = String(value);
  const figure = animate === 'roll' || (animate !== 'morph' && typeof value === 'number');
  const isGlass = variant === 'glass';

  useGlintOnChange(chipRef, text, glint);

  const cls = cx(
    isGlass && 'zc-glass zc-glass--interactive',
    'zc-badge',
    `zc-badge--${tone}`,
    !isGlass && `zc-badge--${variant}`,
    size !== 'md' && `zc-badge--${size}`,
    pill && 'zc-badge--pill',
    figure && 'zc-badge--num',
    className,
  );

  const label = animate === 'none' ? text : figure ? <DigitStrip value={text} /> : <MorphLabel label={text} />;

  return (
    <span className={cls} style={style} ref={chipRef} {...htmlProps}>
      {(dot || live) && !icon ? (
        <span className={`zc-badge__dot${live ? ' zc-badge__dot--live' : ''}`} aria-hidden="true" />
      ) : null}
      {icon ? (
        <span className="zc-badge__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="zc-badge__label">{label}</span>
    </span>
  );
}
