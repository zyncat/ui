'use client';

import './lens.css';

import type { HTMLAttributes, ReactNode } from 'react';

import type { DataAttributes } from '../../../dom-props';
import type { LensStyle } from '../../../tokens/component-styles.generated';
import { cx } from '../../internal/utils/cx';
import { useLens } from './use-lens';

export interface LensOwnProps {
  /** The specimen the glass magnifies. It stays in the accessibility tree; the magnified copy is aria-hidden. */
  children: ReactNode;
  /** How much the glass magnifies, clamped to 1.2-6. @default 2.6 */
  magnification?: number;
  /** Glass radius in pixels, clamped to 60-260. @default 132 */
  radius?: number;
  /** Chromatic fringing at the rim, which strengthens with travel speed. @default true */
  chromatic?: boolean;
  /** Extra class(es) merged onto the stage. */
  className?: string;
  /** Inline styles merged onto the stage. */
  style?: LensStyle;
}

export interface LensProps extends LensOwnProps {
  /** Standard <div> attributes (aria-*, data-*, title, ...) forwarded to the stage. */
  htmlProps?: Omit<HTMLAttributes<HTMLDivElement>, keyof LensOwnProps> & DataAttributes;
}

export function Lens({
  children,
  magnification = 2.6,
  radius = 132,
  chromatic = true,
  className = '',
  style,
  htmlProps,
}: LensProps) {
  const lens = useLens(magnification, radius, chromatic);

  return (
    <div ref={lens.stageRef} className={cx('zc-lens', className)} style={style} tabIndex={0} {...htmlProps}>
      <div ref={lens.contentRef} className="zc-lens__content">
        {children}
      </div>
      <div ref={lens.glassRef} className="zc-lens__glass" aria-hidden="true">
        <div ref={lens.coreRef} className="zc-lens__core" />
        <div ref={lens.rimRef} className="zc-lens__rim" />
        <div ref={lens.fringeRef} className="zc-lens__fringe" />
        <div className="zc-lens__vignette" />
        <div ref={lens.specularRef} className="zc-lens__specular" />
        <div ref={lens.ringRef} className="zc-lens__ring" />
      </div>
    </div>
  );
}
