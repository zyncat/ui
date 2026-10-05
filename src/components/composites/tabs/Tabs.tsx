'use client';

import './tabs.css';

import { useId, useRef, type KeyboardEvent } from 'react';

import { Motion } from '../../../motion/element';
import { GlidePill, useGlide } from '../../../motion/glide';
import { Presence } from '../../../motion/presence';
import { popIn, popOut } from '../../../motion/presets';
import { UIMotion } from '../../../tokens/motion-tokens';
import { IconSlot } from '../../internal/icon/IconSlot';
import { activationProps } from '../../internal/utils/activation';
import { cx } from '../../internal/utils/cx';
import { DigitStrip } from '../../primitives/badge/digit-strip';
import type { TabItem, TabsProps } from './types';
import { useInk } from './use-ink';

export type { TabItem, TabsProps } from './types';
export { TabPanel, type TabPanelProps } from './tab-panel';

export function Tabs({
  items = [],
  value,
  onChange,
  name,
  ariaLabel,
  activateOn = 'pointerdown',
  variant = 'underline',
  size = 'sm',
  fill = false,
  className = '',
  style,
  htmlProps,
}: TabsProps) {
  const autoId = useId();
  const base = name || autoId;
  const pill = variant === 'pill';

  const listRef = useRef<HTMLDivElement>(null);
  const glide = useGlide(listRef);
  const { inkRef, tabRefs } = useInk(listRef, value, items.length);
  const countMotion = {
    animate: popIn(UIMotion.scale.chip, UIMotion.t.enter),
    exit: popOut(UIMotion.scale.chip, UIMotion.t.exit),
  };

  const select = (v: string) => {
    if (v === value || !onChange) return;
    const idx = (x: string | null | undefined) => items.findIndex((i) => i.value === x);
    onChange(v, idx(v) >= idx(value) ? 1 : -1);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const enabled = items.filter((i) => !i.disabled);
    if (!enabled.length) return;
    let next: TabItem | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const step = e.key === 'ArrowRight' ? 1 : -1;
      const i = enabled.findIndex((it) => it.value === value);
      next = enabled[(i + step + enabled.length) % enabled.length];
    } else if (e.key === 'Home') {
      next = enabled[0];
    } else if (e.key === 'End') {
      next = enabled[enabled.length - 1];
    }
    if (!next) return;
    e.preventDefault();
    select(next.value);
    const el = tabRefs.current[next.value];
    if (el) el.focus();
  };

  const focusValue = items.some((i) => i.value === value && !i.disabled)
    ? value
    : (items.find((i) => !i.disabled) || ({} as Partial<TabItem>)).value;

  return (
    <div
      className={cx('zc-tabs', pill && 'zc-tabs--pill', fill && 'zc-tabs--fill', className)}
      style={style}
      {...htmlProps}
      data-size={size}
    >
      <div
        className="zc-tabs__list"
        role="tablist"
        aria-label={ariaLabel}
        ref={listRef}
        onKeyDown={onKeyDown}
        onPointerLeave={pill ? undefined : glide.leave}
      >
        {!pill && <GlidePill className="zc-tab__hover" glide={glide} />}
        {items.map((it) => {
          const selected = it.value === value;
          return (
            <button
              key={it.value}
              type="button"
              role="tab"
              id={base + '-tab-' + it.value}
              aria-selected={selected}
              aria-controls={name ? name + '-panel-' + it.value : undefined}
              tabIndex={it.value === focusValue ? 0 : -1}
              disabled={it.disabled}
              className={'zc-tab' + (selected ? ' zc-is-selected' : '')}
              ref={(el) => {
                tabRefs.current[it.value] = el;
              }}
              {...activationProps<HTMLButtonElement>(() => select(it.value), { on: activateOn })}
              onPointerEnter={
                it.disabled || pill ? undefined : (e) => glide.enter(e.currentTarget.firstElementChild as HTMLElement)
              }
            >
              <span className="zc-tab__pad">
                {it.icon && <IconSlot size="sm">{it.icon}</IconSlot>}
                <span className="zc-tab__label">{it.label}</span>
                <Presence initial={false}>
                  {it.count != null && (
                    <Motion as="span" key="count" className="zc-tab__count" {...countMotion}>
                      <DigitStrip value={it.count} />
                    </Motion>
                  )}
                </Presence>
              </span>
            </button>
          );
        })}
        <span className="zc-tabs__ink" key="ink" ref={inkRef} aria-hidden="true"></span>
      </div>
    </div>
  );
}
