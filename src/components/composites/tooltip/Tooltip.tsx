'use client';

import './tooltip.css';

import {
  Fragment,
  useEffect,
  useId,
  useRef,
  type FocusEvent,
  type HTMLAttributes,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import type { DataAttributes } from '../../../dom-props';
import { usePresence } from '../../../motion/presence-context';
import { useControllable } from '../../internal/hooks/use-controllable';
import { cx } from '../../internal/utils/cx';
import { TooltipHost } from './tooltip-host';
import { CLOSE_GRACE, OPEN_DELAY, store, useHostElection, type Placement } from './tooltip-store';

export interface TooltipProps {
  /** The hint - a string or small node; never interactive content. */
  content: ReactNode;
  /** Optional keyboard hint, rendered as small metadata ("⌘↩", "S"). */
  shortcut?: string | null;
  /** Preferred side; flips automatically when out of viewport room. */
  placement?: Placement;
  /** Controlled visibility - shows with no hover or focus, and stays until you clear it.
   *  Omit to stay uncontrolled. One bubble shows at a time: the newest wins, and the ones
   *  under it come back when it leaves. */
  open?: boolean;
  /** Initial state when uncontrolled. Default false. */
  defaultOpen?: boolean;
  /** Fires whenever hover, focus, or Escape asks for a new state. Pair with `open` for controlled use. */
  onOpenChange?: (open: boolean) => void;
  /** Suppress the tooltip entirely (trigger renders untouched). */
  disabled?: boolean;
  /** ms before a cold hover shows; warm hovers + focus are instant. Default 350. */
  openDelay?: number;
  /** ms the bubble lingers after leaving (bridges moving to a neighbour). Default 140. */
  closeDelay?: number;
  /** Stable id for this trigger's store entry - lets overlapping triggers race safely under
   *  the one shared tooltip host. Not rendered to the DOM. Auto-generated when omitted. */
  id?: string;
  /** Exactly one element. */
  children: ReactElement;
  /** Standard <span> attributes forwarded to the anchor wrapper. */
  htmlProps?: HTMLAttributes<HTMLSpanElement> & DataAttributes;
}

export function Tooltip({
  content,
  shortcut = null,
  placement = 'top',
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  openDelay = OPEN_DELAY,
  closeDelay = CLOSE_GRACE,
  id,
  children,
  htmlProps,
}: TooltipProps) {
  const wrapRef = useRef<HTMLSpanElement | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | 0>(0);
  const autoId = useId();
  const myId = id || 'tip-' + autoId;
  const isHost = useHostElection();
  const { isPresent } = usePresence();
  const [open, setOpen] = useControllable(controlledOpen, defaultOpen, onOpenChange);

  useEffect(() => {
    if (!open || disabled || !isPresent) return undefined;
    store.open({
      id: myId,
      content,
      shortcut,
      placement,
      anchor: () => (wrapRef.current?.firstElementChild as HTMLElement) ?? null,
      dismiss: () => setOpen(false),
    });
    return () => store.close(myId, closeDelay);
  }, [open, disabled, isPresent, content, shortcut, placement, closeDelay, myId, setOpen]);

  useEffect(() => {
    if (!isPresent) store.close(myId, 0);
  }, [isPresent, myId]);

  useEffect(
    () => () => {
      clearTimeout(openTimer.current);
      store.close(myId, 0);
    },
    [myId],
  );

  function show(immediate: boolean, from: EventTarget) {
    clearTimeout(openTimer.current);
    if (disabled || !wrapRef.current?.firstElementChild || !wrapRef.current.contains(from as Node)) return;
    if (immediate || store.isWarm()) setOpen(true);
    else openTimer.current = setTimeout(() => setOpen(true), openDelay);
  }
  function hide() {
    clearTimeout(openTimer.current);
    setOpen(false);
  }

  const onEnter = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') show(false, e.target);
  };
  const onFocusIn = (e: FocusEvent) => {
    if ((e.target as HTMLElement).matches(':focus-visible')) show(true, e.target);
  };

  return (
    <Fragment>
      <span
        {...htmlProps}
        ref={wrapRef}
        className={cx('zc-tooltip-anchor', htmlProps?.className)}
        onPointerEnter={onEnter}
        onPointerLeave={hide}
        onPointerDown={hide}
        onClick={hide}
        onFocus={onFocusIn}
        onBlur={hide}
      >
        {children}
      </span>
      {isHost && <TooltipHost />}
    </Fragment>
  );
}
