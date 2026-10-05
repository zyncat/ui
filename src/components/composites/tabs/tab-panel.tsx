'use client';

import { useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

import type { DataAttributes } from '../../../dom-props';
import { Motion } from '../../../motion/element';
import { resolveMotionTiming } from '../../../motion/motion-timing';
import { type DisableableAnimation } from '../../../motion/timing';
import { cx } from '../../internal/utils/cx';

const TABS_ENTER_X = 20;

interface TabPanelOwnProps {
  /** The active tab's value - changing it cuts to the new content. */
  tab: string;
  /** Same `name` as the paired Tabs - wires role/id/aria-labelledby. */
  name?: string;
  /** Direction of travel from Tabs' onChange; 0 = plain fade. */
  dir?: -1 | 0 | 1;
  /** Panel content - only this inner node animates in on `tab` change; the root chrome stays static. */
  children?: ReactNode;
  /** Entrance timing for the inner content - motion tokens only, or `null` to disable.
   *  @default duration 'base' + ease 'entrance' */
  animation?: DisableableAnimation;
  /** Extra class(es) merged onto the root. */
  className?: string;
  /** Inline styles merged onto the root. */
  style?: CSSProperties;
}

export interface TabPanelProps extends TabPanelOwnProps {
  /** Standard <div> attributes (data-*, aria-*, ...) forwarded to the root. */
  htmlProps?: Omit<HTMLAttributes<HTMLDivElement>, keyof TabPanelOwnProps> & DataAttributes;
}

const TABPANEL_TIMING = {
  open: { duration: 'base', ease: 'entrance' },
  close: { duration: 'base', ease: 'entrance' },
} as const;

export function TabPanel({ tab, name, dir = 0, className = '', style, children, animation, htmlProps }: TabPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const enter = resolveMotionTiming(animation, TABPANEL_TIMING, panelRef.current).open;

  return (
    <Motion
      ref={panelRef}
      layout
      layoutTransition={{ size: 'morph', timing: enter }}
      role="tabpanel"
      tabIndex={0}
      id={name ? `${name}-panel-${tab}` : undefined}
      aria-labelledby={name ? `${name}-tab-${tab}` : undefined}
      className={cx('zc-tab-panel', className)}
      style={style}
      {...htmlProps}
    >
      <Motion className="zc-tab-panel__inner" animate={{ x: [dir * TABS_ENTER_X, 0], timing: enter }} deps={[tab]}>
        {children}
      </Motion>
    </Motion>
  );
}
