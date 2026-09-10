'use client';

import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';

/** When a library-owned trigger fires: on `pointerdown` (snappier) or on `click`. */
export type ActivateOn = 'pointerdown' | 'click';

type AnyPointerEvent = ReactPointerEvent<Element> | PointerEvent;
type AnyMouseEvent = ReactMouseEvent<Element> | MouseEvent;

const drivesActivation = (pointerType: string | undefined) => pointerType === 'mouse' || pointerType === 'pen';

let activatedOnPointerDown = false;

function isInert(target: EventTarget | null) {
  const el = target as (Element & { disabled?: boolean }) | null;
  return Boolean(el?.disabled) || el?.getAttribute?.('aria-disabled') === 'true';
}

function takeFocus(target: EventTarget | null) {
  const el = target as (HTMLElement & { tabIndex?: number }) | null;
  if (!el || typeof el.focus !== 'function' || (el.tabIndex ?? -1) < 0) return;
  if (el !== document.activeElement) el.focus({ preventScroll: true });
}

export function pointerDownActivates(e: AnyPointerEvent, holdFocus = false) {
  activatedOnPointerDown =
    !e.defaultPrevented &&
    e.button === 0 &&
    !e.ctrlKey &&
    !e.metaKey &&
    !e.shiftKey &&
    !e.altKey &&
    drivesActivation(e.pointerType) &&
    !isInert(e.currentTarget);
  if (!activatedOnPointerDown) return false;
  if (holdFocus) e.preventDefault();
  else takeFocus(e.currentTarget);
  return true;
}

export function declinePointerDown() {
  activatedOnPointerDown = false;
}

export function pressedByKeyboard(e: AnyPointerEvent | AnyMouseEvent) {
  const native = ('nativeEvent' in e ? e.nativeEvent : e) as PointerEvent;
  return !native.pointerType;
}

export function clickActivates(e: AnyMouseEvent) {
  const native = ('nativeEvent' in e ? e.nativeEvent : e) as PointerEvent;
  if (isInert(e.currentTarget)) return false;
  return !drivesActivation(native.pointerType) || !activatedOnPointerDown;
}

export interface ActivationOptions<E extends Element> {
  on?: ActivateOn;
  holdFocus?: boolean;
  onPointerDown?: (e: ReactPointerEvent<E>) => void;
  onClick?: (e: ReactMouseEvent<E>) => void;
}

export function activationProps<E extends Element>(
  activate: (e: ReactPointerEvent<E> | ReactMouseEvent<E>) => void,
  { on = 'click', holdFocus, onPointerDown, onClick }: ActivationOptions<E> = {},
) {
  return {
    onPointerDown: (e: ReactPointerEvent<E>) => {
      onPointerDown?.(e);
      if (on !== 'pointerdown') return declinePointerDown();
      if (pointerDownActivates(e, holdFocus)) activate(e);
    },
    onClick: (e: ReactMouseEvent<E>) => {
      onClick?.(e);
      if (clickActivates(e)) activate(e);
    },
  };
}
