'use client';

import { useRef, type HTMLAttributes, type ReactNode, type RefObject } from 'react';

import type { DataAttributes } from '../../../../dom-props';
import type { Layer } from '../../../../engine';
import { resolveMotionTiming } from '../../../../motion/motion-timing';
import { Presence } from '../../../../motion/presence';
import type { DisableableAnimation } from '../../../../motion/timing';
import { useMotion, type MotionSpecs } from '../../../../motion/use-motion';
import { motionFor, type MotionTransition } from '../../../../tokens/motion-tokens';
import { menuSurfaceAttrs, type MenuSurfaceProps } from '../../../internal/menu/highlight';
import { useAnchorWidth } from '../../../internal/menu/use-anchor-width';
import { useReturnFocus } from '../../../internal/overlay/focus';
import { OverlayPortal, useOutsidePress, useOverlayEntry } from '../../../internal/overlay/layer';
import { useAnchorPosition } from '../../../internal/overlay/position';
import { cx } from '../../../internal/utils/cx';

export type SelectMenuHtmlProps = HTMLAttributes<HTMLDivElement> & DataAttributes;

const SELECT_MENU_TIMING = {
  open: { duration: 'base', ease: 'entrance' },
  close: { duration: 'base', ease: 'exit' },
} as const;

function selectMenuLayers(
  animation: DisableableAnimation | undefined,
  dir: 'open' | 'close',
  scope?: Element | null,
): Layer[] {
  const motion = motionFor(scope);
  const t = resolveMotionTiming(animation, SELECT_MENU_TIMING, scope)[dir];
  const fade = (d: MotionTransition) => ({ duration: d.duration === 0 ? 0 : motion.dur.fast, ease: d.ease });
  const drop = -motion.dist.sm;
  return dir === 'open'
    ? [
        { y: [drop, 0], scale: [motion.scale.floating, 1], timing: t },
        { opacity: [0, 1], timing: fade(t) },
      ]
    : [
        { y: [drop], scale: [motion.scale.floating], timing: t },
        { opacity: [0], timing: fade(t) },
      ];
}

export interface SelectMenuProps extends MenuSurfaceProps {
  open: boolean;
  menuId: string;
  requestClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  multiple?: boolean;
  animation?: DisableableAnimation;
  menuProps?: SelectMenuHtmlProps;
  children?: ReactNode;
}

function MenuSurface({
  menuId,
  requestClose,
  triggerRef,
  multiple,
  highlight,
  rail,
  size,
  weight,
  width = 'trigger',
  menuProps,
  animate,
  exit,
  children,
}: Omit<SelectMenuProps, 'open' | 'animation'> & MotionSpecs) {
  const menuRef = useRef<HTMLDivElement>(null);
  const entry = useOverlayEntry({ nodeRef: menuRef, dismissible: true, requestClose });
  useMotion(menuRef, { animate, exit });
  useReturnFocus(menuRef);
  useAnchorWidth(triggerRef, menuRef, width === 'trigger');
  useAnchorPosition({ side: 'bottom', align: 'start', arrow: false, triggerRef, panelRef: menuRef });
  useOutsidePress({ entry, refs: [menuRef, triggerRef], enabled: true, onPress: requestClose });

  return (
    <div
      {...menuProps}
      ref={menuRef}
      className={cx('zc-menu-surface zc-select__menu', menuProps?.className)}
      id={menuId}
      role="presentation"
      data-multiple={multiple ? 'true' : undefined}
      {...menuSurfaceAttrs({ highlight, rail, size, weight, width })}
    >
      {children}
    </div>
  );
}

export function SelectMenu({
  open,
  menuId,
  requestClose,
  triggerRef,
  multiple,
  highlight,
  rail,
  size,
  weight,
  width,
  animation,
  menuProps,
  children,
}: SelectMenuProps) {
  return (
    <OverlayPortal scope={triggerRef.current}>
      <Presence>
        {open && (
          <MenuSurface
            key="menu"
            animate={selectMenuLayers(animation, 'open', triggerRef.current)}
            exit={selectMenuLayers(animation, 'close', triggerRef.current)}
            menuId={menuId}
            requestClose={requestClose}
            triggerRef={triggerRef}
            multiple={multiple}
            highlight={highlight}
            rail={rail}
            size={size}
            weight={weight}
            width={width}
            menuProps={menuProps}
          >
            {children}
          </MenuSurface>
        )}
      </Presence>
    </OverlayPortal>
  );
}
