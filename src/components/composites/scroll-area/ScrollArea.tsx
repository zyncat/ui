'use client';

import './scroll-area.css';

import { useImperativeHandle, useRef, type CSSProperties, type ReactNode, type Ref } from 'react';

import { motionFor } from '../../../tokens/motion-tokens';
import { useScrollEdges } from '../../internal/hooks/use-scroll-edges';
import { Icon } from '../../internal/icon/Icon';
import { activationProps, type ActivateOn } from '../../internal/utils/activation';
import { cx } from '../../internal/utils/cx';

const SIDES = ['start', 'end'] as const;

const scrollBehavior = (el: Element): ScrollBehavior => (motionFor(el).reduced ? 'auto' : 'smooth');

export interface ScrollAreaProps {
  /** Scroll direction. `'x'` lays the children out as a rail, one item each, with a paging door
   *  on each faded edge for a mouse. @default 'y' */
  axis?: 'x' | 'y';
  /** `'fade'` fades an edge while content hides past it. `'depth'` also shrinks each child as it
   *  crosses a faded edge; pass the items as direct children. @default 'fade' */
  variant?: 'fade' | 'depth';
  /** With `axis="x"`, sizes the row to the scroller instead of to its items: `flex: 1` children
   *  share its width down to their `min-width` and then scroll, and every child fills its height.
   *  For a board or a toolbar. @default false */
  fill?: boolean;
  /** Names the scroller as a region landmark. Omit for an unnamed scroller. */
  ariaLabel?: string;
  /** The element that scrolls: a virtualizer's `getScrollElement`, an IntersectionObserver's
   *  `root`, or `scrollTo` for a jump. */
  ref?: Ref<HTMLDivElement>;
  /** When a rail's edge door pages: on `pointerdown` (snappier) or on `click`. @default 'pointerdown' */
  activateOn?: ActivateOn;
  /** Extra class(es) merged onto the root. */
  className?: string;
  /** Inline styles merged onto the root. A `'y'` scroller takes its height or max-height here. */
  style?: CSSProperties;
  /** The scrolled content. */
  children?: ReactNode;
}

export function ScrollArea({
  axis = 'y',
  variant = 'fade',
  fill = false,
  ariaLabel,
  ref,
  activateOn = 'pointerdown',
  className,
  style,
  children,
}: ScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => viewportRef.current!, []);

  useScrollEdges(
    viewportRef,
    (edges, el) => {
      const start = axis === 'x' ? edges.left : edges.top;
      const end = axis === 'x' ? edges.right : edges.bottom;
      el.dataset.edges = `${start ? 'start' : ''} ${end ? 'end' : ''}`.trim();
      el.tabIndex = start || end ? 0 : -1;
    },
    { content: true },
  );

  const page = (side: (typeof SIDES)[number], door: Element) => {
    const el = viewportRef.current;
    if (!el) return;
    const step = el.clientWidth - 2 * door.clientWidth;
    el.scrollBy({ left: side === 'end' ? step : -step, behavior: scrollBehavior(el) });
  };

  return (
    <div
      className={cx(
        'zc-scroll-area',
        `zc-scroll-area--${axis}`,
        variant === 'depth' && 'zc-scroll-area--depth',
        axis === 'x' && fill && 'zc-scroll-area--fill',
        className,
      )}
      style={style}
    >
      <div
        ref={viewportRef}
        className="zc-scroll-area__viewport"
        role={ariaLabel ? 'region' : undefined}
        aria-label={ariaLabel}
        onFocus={(e) => {
          if (e.target === e.currentTarget || !e.target.matches(':focus-visible')) return;
          e.target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: scrollBehavior(e.currentTarget) });
        }}
      >
        <div className="zc-scroll-area__content">{children}</div>
      </div>
      {axis === 'x' &&
        SIDES.map((side) => (
          <div
            key={side}
            className="zc-scroll-area__door"
            data-side={side}
            aria-hidden
            {...activationProps((e) => page(side, e.currentTarget), { on: activateOn, holdFocus: true })}
          >
            <span className="zc-scroll-area__chip">
              <Icon name={side === 'start' ? 'caret-left' : 'caret-right'} size="sm" />
            </span>
          </div>
        ))}
    </div>
  );
}
