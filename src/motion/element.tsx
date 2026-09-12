'use client';

import { createElement, useCallback, useRef, type ReactNode, type Ref } from 'react';

import { useFlip, type FlipTuning } from './flip';
import { usePresence } from './presence-context';
import { useMotion, type MotionSpecs } from './use-motion';

export interface MotionProps extends MotionSpecs {
  /** Tag for the element this renders. @default 'div' */
  as?: string;
  /** FLIP this element from its previous box on every render. Implied by `layoutId`. */
  layout?: boolean;
  /** FLIP from whatever element last held this id, so the box travels between nodes. */
  layoutId?: string;
  /** Tunes whichever layout animation is active; ignored without `layout` or `layoutId`. */
  layoutTransition?: FlipTuning;
  ref?: Ref<HTMLElement | null>;
  children?: ReactNode;
  [prop: string]: unknown;
}

export function Motion({
  as = 'div',
  animate,
  exit,
  initial,
  deps,
  layout,
  layoutId,
  layoutTransition,
  ref,
  children,
  ...rest
}: MotionProps) {
  const { isPresent } = usePresence();
  const flipRef = useFlip<HTMLElement>(layoutId ?? null, layoutTransition, !!layoutId || !!layout);
  const host = useRef<HTMLElement | null>(null);
  const forwarded = useRef(ref);
  forwarded.current = ref;

  useMotion(host, { animate, exit, initial, deps });

  const attach = useCallback(
    (el: HTMLElement | null) => {
      host.current = el;
      flipRef.current = el;
      const outer = forwarded.current;
      if (typeof outer === 'function') outer(el);
      else if (outer) outer.current = el;
    },
    [flipRef],
  );

  return createElement(as, { ...rest, 'data-exiting': isPresent ? undefined : 'true', ref: attach }, children);
}
