'use client';

import '../../../internal/menu/menu-surface.css';

import { Fragment, useMemo, type ReactNode } from 'react';

import { GlidePill } from '../../../../motion/glide';
import type { DisableableAnimation } from '../../../../motion/timing';
import { Icon } from '../../../internal/icon/Icon';
import type { MenuSurfaceProps } from '../../../internal/menu/highlight';
import { MenuRow } from '../../../internal/menu/menu-row';
import { activationProps, type ActivateOn } from '../../../internal/utils/activation';
import { Collapse } from '../../../primitives/collapse/Collapse';
import { SelectMenu } from './menu';
import type { ListboxState } from './use-listbox';

export interface ListboxPanelProps extends MenuSurfaceProps {
  lb: ListboxState;
  loading: boolean;
  searchable: boolean;
  searchPlaceholder?: string;
  ariaLabel?: string;
  multiple?: boolean;
  activateOn?: ActivateOn;
  animation?: DisableableAnimation;
  check?: (selected: boolean) => ReactNode;
}

const defaultCheck = (selected: boolean) => (selected ? <Icon key="on" name="check" size="sm" weight="bold" /> : null);

function LoadingRows() {
  return (
    <div className="zc-select__loading" aria-busy="true" aria-live="polite">
      {[0, 1, 2].map((i) => (
        <div className="zc-select__skeleton" key={i}>
          <span className="zc-select__skeleton-dot" data-pulse></span>
          <span className="zc-select__skeleton-bar" data-pulse></span>
        </div>
      ))}
    </div>
  );
}

function EmptyRow({ query }: { query: string }) {
  return <div className="zc-select__empty">{query ? 'No matches for "' + query + '"' : 'No options available'}</div>;
}

export function ListboxPanel({
  lb,
  loading,
  searchable,
  searchPlaceholder,
  ariaLabel,
  multiple,
  highlight,
  rail,
  size,
  weight,
  activateOn,
  animation,
  check = defaultCheck,
}: ListboxPanelProps) {
  const navIndex = useMemo(() => new Map(lb.navItems.map((o, i) => [o.value, i] as const)), [lb.navItems]);
  return (
    <SelectMenu
      open={lb.open}
      menuId={lb.menuId}
      requestClose={lb.requestClose}
      triggerRef={lb.triggerRef}
      multiple={multiple}
      highlight={highlight}
      rail={rail}
      size={size}
      weight={weight}
      animation={animation}
    >
      {searchable && !loading && (
        <div className="zc-select__search">
          <Icon name="magnifying-glass" size="sm" />
          <input
            ref={lb.searchRef}
            className="zc-select__search-input"
            type="text"
            value={lb.query}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            aria-controls={lb.listId}
            aria-activedescendant={lb.adId}
            onChange={(e) => lb.setQuery(e.target.value)}
            onKeyDown={lb.onMenuKeyDown}
          />
        </div>
      )}

      <div
        className="zc-menu-scroller zc-select__list"
        ref={lb.listRef}
        id={lb.listId}
        role="listbox"
        aria-multiselectable={multiple || undefined}
        tabIndex={-1}
        aria-label={ariaLabel}
        aria-activedescendant={searchable ? undefined : lb.adId}
        onKeyDown={searchable ? undefined : lb.onMenuKeyDown}
      >
        <GlidePill className="zc-menu-glide zc-select__glide" glide={lb.glide} />
        {loading ? (
          <LoadingRows />
        ) : (
          <Fragment>
            {lb.groups.map((g, gi) => (
              <div className="zc-select__group" role="group" aria-label={g.label || undefined} key={gi}>
                {g.label && g.items.some((o) => navIndex.has(o.value)) && (
                  <div className="zc-menu-group-label zc-select__group-label">{g.label}</div>
                )}
                {g.items.map((opt) => {
                  const i = navIndex.get(opt.value) ?? -1;
                  const visible = i !== -1;
                  const isSel = lb.isSelected(opt.value);
                  const row = (
                    <MenuRow
                      key={opt.value}
                      id={visible ? lb.optId(opt.value) : undefined}
                      data-idx={visible ? i : undefined}
                      className="zc-select__option"
                      role="option"
                      aria-selected={isSel}
                      aria-hidden={!visible || undefined}
                      aria-disabled={opt.disabled || undefined}
                      data-selected={isSel ? 'true' : undefined}
                      data-active={visible && i === lb.activeIdx ? 'true' : undefined}
                      data-disabled={opt.disabled ? 'true' : undefined}
                      onMouseEnter={() => visible && !opt.disabled && lb.setActiveIdx(i)}
                      onMouseDown={(e) => e.preventDefault()}
                      {...activationProps<HTMLDivElement>(() => visible && lb.commit(opt), {
                        on: activateOn,
                        holdFocus: true,
                      })}
                      icon={opt.icon}
                      label={opt.label}
                      description={opt.description}
                      trailing={check(isSel) ? <span className="zc-select__option-check">{check(isSel)}</span> : null}
                    />
                  );
                  return searchable ? (
                    <Collapse key={opt.value} open={visible} fade>
                      {row}
                    </Collapse>
                  ) : (
                    row
                  );
                })}
              </div>
            ))}
            {lb.navItems.length === 0 && <EmptyRow query={lb.query} />}
          </Fragment>
        )}
      </div>
    </SelectMenu>
  );
}
