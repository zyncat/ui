'use client';

import '../../internal/menu/menu-surface.css';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from 'react';

import { GlidePill, useGlide } from '../../../motion/glide';
import { useMotion, type MotionSpecs } from '../../../motion/use-motion';
import { edgeEnabled, matchPrefix, stepEnabled } from '../../internal/collection/collection';
import { useTypeahead } from '../../internal/hooks/use-typeahead';
import { Icon } from '../../internal/icon/Icon';
import { menuSurfaceAttrs } from '../../internal/menu/highlight';
import { MenuRow } from '../../internal/menu/menu-row';
import { useReturnFocus } from '../../internal/overlay/focus';
import { useOutsidePress, useOverlayEntry } from '../../internal/overlay/layer';
import { useAnchorPosition } from '../../internal/overlay/position';
import { activationProps } from '../../internal/utils/activation';
import { cx } from '../../internal/utils/cx';
import { itemText, levelKey, normalize, opensLevel, popupOf, type DropdownItem, type MenuChain } from './types';

const SUBMENU_OPEN_DELAY = 90;
const SUBMENU_TRAVEL_GRACE = 500;
const MENU_KEYS = new Set('ArrowDown ArrowUp ArrowLeft ArrowRight Home End Enter Escape Tab'.split(' ').concat(' '));
const CONTENT_KEYS = new Set(['Escape', 'ArrowLeft', 'Tab']);
const TEXT_FIELD = 'input, textarea, [contenteditable]';

type Point = { x: number; y: number };

const inTextField = (target: EventTarget | null) => target instanceof Element && target.closest(TEXT_FIELD) != null;

function headingTo(point: Point, from: Point, panel: HTMLElement): boolean {
  const box = panel.getBoundingClientRect();
  const rightward = from.x <= box.left;
  const gone = rightward ? point.x - from.x : from.x - point.x;
  if (!box.width || gone <= 0) return false;
  const reached = Math.min(gone / Math.max(rightward ? box.left - from.x : from.x - box.right, 1), 1);
  const [a, b] = [from.y + (box.top - from.y) * reached, from.y + (box.bottom - from.y) * reached];
  return point.y >= Math.min(a, b) && point.y <= Math.max(a, b);
}

export function MenuPanel({ chain, depth, ...motion }: { chain: MenuChain; depth: number } & MotionSpecs) {
  const { levels, hoverDepth, refFor } = chain;
  const [level, next, parent] = [levels[depth], levels[depth + 1], levels[depth - 1]];
  const nested = Boolean(parent);
  const contentLevel = level.content != null;

  const panelId = (d: number) =>
    d === 0 ? chain.menuId : chain.menuId + '-' + d + '-' + encodeURIComponent(levels[d].owner!.id);
  const menuId = panelId(depth);
  const openSubId = next ? next.owner!.id : null;
  const seed = chain.seed.key === level.key ? chain.seed.focus : 'none';

  const { groups, flat } = useMemo(() => normalize(level.items), [level.items]);
  const indexOf = useMemo(() => new Map(flat.map((item, i) => [item.id, i] as const)), [flat]);
  const [activeIdx, setActiveIdx] = useState(() => (seed === 'none' ? -1 : edgeEnabled(flat, seed === 'last')));

  const panelRef = refFor('panel:' + level.key);
  const rowFor = (i: number) => refFor('row:' + levelKey(depth, flat[i].id)) as unknown as RefObject<HTMLDivElement>;
  const anchorRef = nested ? refFor('row:' + levelKey(depth - 1, level.owner!.id)) : refFor('trigger');

  const glide = useGlide(panelRef);
  const typeahead = useTypeahead();
  const timers = useRef<Record<'open' | 'grace', ReturnType<typeof setTimeout> | 0>>({ open: 0, grace: 0 });
  const travel = useRef({ from: null as Point | null, active: false, hovered: -1 });

  const openIdx = openSubId != null ? (indexOf.get(openSubId) ?? -1) : -1;
  const activeItem = activeIdx >= 0 ? flat[activeIdx] : undefined;
  const cancel = () => chain.cancel(depth);
  const closeSub = () => chain.closeSub(depth);

  const entry = useOverlayEntry({ nodeRef: panelRef, dismissible: true, requestClose: cancel });
  const place = { side: nested ? 'right' : chain.side, align: nested ? 'start' : chain.align } as const;
  useMotion(panelRef, motion);
  useReturnFocus(panelRef);
  useAnchorPosition({ ...place, arrow: false, triggerRef: anchorRef, panelRef });
  useOutsidePress({ entry, refs: [panelRef, anchorRef], enabled: !nested, onPress: () => chain.dismiss(false) });

  useLayoutEffect(() => {
    const row = activeIdx >= 0 && activeIdx < flat.length ? rowFor(activeIdx).current : null;
    if (!row) return glide.leave();
    row.focus();
    glide.enter(row);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  useLayoutEffect(() => {
    if (seed === 'none') return;
    if (contentLevel) panelRef.current?.focus();
    else setActiveIdx(edgeEnabled(flat, seed === 'last'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  useEffect(() => () => stopTravel(), []); // eslint-disable-line react-hooks/exhaustive-deps

  function stopTravel() {
    clearTimeout(timers.current.open);
    clearTimeout(timers.current.grace);
    travel.current.active = false;
  }

  function armOpen(i: number) {
    clearTimeout(timers.current.open);
    const item = flat[i];
    if (!item || item.disabled || item.id === openSubId || !opensLevel(item)) return;
    timers.current.open = setTimeout(() => chain.openSub(depth, item, 'none'), SUBMENU_OPEN_DELAY);
  }

  const heading = (point: Point) => {
    const sub = next && refFor('panel:' + next.key).current;
    return Boolean(sub && travel.current.from && headingTo(point, travel.current.from, sub));
  };

  function abortTravel() {
    stopTravel();
    closeSub();
    const i = travel.current.hovered;
    if (i >= 0 && i < flat.length && !flat[i].disabled) {
      setActiveIdx(i);
      armOpen(i);
    }
  }

  function moveTo(i: number) {
    stopTravel();
    if (i < 0 || i >= flat.length) return;
    setActiveIdx(i);
    if (openIdx >= 0 && flat[i].id !== openSubId) closeSub();
  }

  function commit(item: DropdownItem | undefined) {
    if (!item || item.disabled) return;
    if (opensLevel(item)) chain.openSub(depth, item, 'first');
    else chain.select(item);
  }

  function onRowEnter(point: Point, i: number) {
    if (flat[i].disabled) return;
    travel.current.hovered = i;
    if (i === openIdx) {
      stopTravel();
      return setActiveIdx(i);
    }
    if (openIdx >= 0 && heading(point)) {
      stopTravel();
      travel.current.active = true;
      timers.current.grace = setTimeout(() => hoverDepth.current <= depth && abortTravel(), SUBMENU_TRAVEL_GRACE);
      return;
    }
    setActiveIdx(i);
    if (openIdx >= 0) closeSub();
    armOpen(i);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const printable = e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey;
    if (!MENU_KEYS.has(e.key) && !printable) return;
    e.stopPropagation();
    if (printable && (e.key !== ' ' || typeahead.buffered())) {
      const i = matchPrefix(flat, itemText, typeahead.push(e.key));
      return i >= 0 ? moveTo(i) : undefined;
    }
    e.preventDefault();
    const back = () => (openSubId != null ? closeSub() : cancel());
    const opens = activeItem && !activeItem.disabled && opensLevel(activeItem);
    switch (e.key) {
      case 'ArrowDown':
        return moveTo(stepEnabled(flat, activeIdx, 1));
      case 'ArrowUp':
        return moveTo(stepEnabled(flat, activeIdx, -1));
      case 'Home':
        return moveTo(edgeEnabled(flat, false));
      case 'End':
        return moveTo(edgeEnabled(flat, true));
      case 'ArrowRight':
        return opens ? chain.openSub(depth, activeItem!, 'first') : undefined;
      case 'ArrowLeft':
        return openSubId == null && !nested ? undefined : back();
      case 'Escape':
        return back();
      case 'Tab':
        return chain.dismiss(true);
      default:
        return commit(activeItem);
    }
  }

  function onContentKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!CONTENT_KEYS.has(e.key) || e.defaultPrevented) return;
    if (e.key === 'ArrowLeft' && inTextField(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.key === 'Tab') chain.dismiss(true);
    else cancel();
  }

  function renderRow(item: DropdownItem) {
    const i = indexOf.get(item.id) ?? -1;
    const popup = popupOf(item);
    const subOpen = popup != null && openSubId === item.id;
    const radio = typeof item.selected === 'boolean';
    return (
      <MenuRow
        key={item.id}
        ref={rowFor(i)}
        id={menuId + '-item-' + i}
        className="zc-dropdown__item"
        role={radio ? 'menuitemradio' : 'menuitem'}
        tabIndex={i === activeIdx ? 0 : -1}
        aria-checked={radio ? item.selected : undefined}
        aria-disabled={item.disabled || undefined}
        aria-haspopup={popup ?? undefined}
        aria-expanded={popup ? subOpen : undefined}
        aria-controls={subOpen ? panelId(depth + 1) : undefined}
        aria-keyshortcuts={item.shortcut}
        data-active={i === activeIdx ? 'true' : undefined}
        data-selected={item.selected ? 'true' : undefined}
        data-disabled={item.disabled ? 'true' : undefined}
        data-danger={item.danger ? 'true' : undefined}
        onPointerEnter={(e) => onRowEnter({ x: e.clientX, y: e.clientY }, i)}
        onPointerLeave={(e) => {
          clearTimeout(timers.current.open);
          if (i === openIdx) travel.current.from = { x: e.clientX, y: e.clientY };
        }}
        {...activationProps<HTMLDivElement>(() => commit(item), { on: chain.activateOn, holdFocus: true })}
        icon={item.icon}
        label={item.label}
        description={item.description}
        trailing={
          <>
            {item.selected && <Icon name="check" size="sm" weight="bold" className="zc-dropdown__item-check" />}
            {item.shortcut && (
              <span className="zc-dropdown__item-shortcut" aria-hidden="true">
                {item.shortcut}
              </span>
            )}
            {popup && <Icon name="caret-right" size="sm" className="zc-dropdown__item-caret" />}
          </>
        }
      />
    );
  }

  function renderRows() {
    return (
      <>
        <GlidePill className="zc-menu-glide" glide={glide} />
        {groups.length > 1 || groups[0]?.label
          ? groups.map((group, gi) => (
              <div className="zc-dropdown__group" role="group" aria-label={group.label || undefined} key={gi}>
                {group.label && <div className="zc-menu-group-label">{group.label}</div>}
                {group.items.map(renderRow)}
              </div>
            ))
          : flat.map(renderRow)}
      </>
    );
  }

  return (
    <div
      {...(nested ? undefined : chain.htmlProps)}
      {...menuSurfaceAttrs(chain)}
      ref={panelRef as unknown as RefObject<HTMLDivElement>}
      id={menuId}
      className={cx('zc-menu-surface zc-menu-scroller zc-dropdown__menu', !nested && chain.htmlProps?.className)}
      role={contentLevel ? 'dialog' : 'menu'}
      tabIndex={-1}
      aria-label={nested ? undefined : chain.ariaLabel}
      aria-labelledby={nested ? panelId(depth - 1) + '-item-' + level.ownerIdx : undefined}
      data-nested={nested ? 'true' : undefined}
      data-content={contentLevel ? 'true' : undefined}
      data-danger-active={activeItem && activeItem.danger ? 'true' : undefined}
      onKeyDown={contentLevel ? onContentKeyDown : onKeyDown}
      onPointerEnter={() => {
        if (hoverDepth.current > depth) travel.current.from = null;
        hoverDepth.current = depth;
        stopTravel();
      }}
      onPointerMove={(e) => travel.current.active && !heading({ x: e.clientX, y: e.clientY }) && abortTravel()}
    >
      {contentLevel ? level.content : renderRows()}
    </div>
  );
}
