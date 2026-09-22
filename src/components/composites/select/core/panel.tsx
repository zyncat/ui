'use client';

import '../../../internal/menu/menu-surface.css';

import type { ReactNode } from 'react';

import { GlidePill } from '../../../../motion/glide';
import { Presence } from '../../../../motion/presence';
import type { DisableableAnimation } from '../../../../motion/timing';
import { Icon } from '../../../internal/icon/Icon';
import type { MenuSurfaceProps } from '../../../internal/menu/highlight';
import { MenuGroupLabel, MenuRow } from '../../../internal/menu/menu-row';
import { activationProps, type ActivateOn } from '../../../internal/utils/activation';
import { SelectMenu, type SelectMenuHtmlProps } from './menu';
import type { ListRow } from './types';
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
  menuProps?: SelectMenuHtmlProps;
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
  width,
  activateOn,
  animation,
  menuProps,
  check = defaultCheck,
}: ListboxPanelProps) {
  const grouped = lb.sections.some((s) => s.label);
  const option = (row: ListRow) => {
    const opt = row.option;
    const isSel = lb.isSelected(opt.value);
    return (
      <MenuRow
        key={opt.value}
        data-idx={row.index}
        id={lb.optId(opt.value)}
        className="zc-select__option"
        role="option"
        aria-selected={isSel}
        aria-disabled={opt.disabled || undefined}
        data-selected={isSel ? 'true' : undefined}
        data-active={row.index === lb.activeIdx ? 'true' : undefined}
        data-disabled={opt.disabled ? 'true' : undefined}
        onMouseEnter={() => !opt.disabled && lb.setActiveIdx(row.index)}
        onMouseDown={(e) => e.preventDefault()}
        {...activationProps<HTMLDivElement>(() => lb.commit(opt), { on: activateOn, holdFocus: true })}
        icon={opt.icon}
        label={opt.label}
        description={opt.description}
        trailing={check(isSel) ? <span className="zc-select__option-check">{check(isSel)}</span> : null}
      />
    );
  };

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
      width={width}
      animation={animation}
      menuProps={menuProps}
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
        data-grouped={grouped ? 'true' : undefined}
        onKeyDown={searchable ? undefined : lb.onMenuKeyDown}
      >
        {loading ? (
          <LoadingRows />
        ) : (
          <div className="zc-menu-list" ref={lb.contentRef}>
            <GlidePill className="zc-menu-glide zc-select__glide" glide={lb.glide} />
            {lb.sections.map((section) => (
              <div className="zc-select__group" role="group" aria-label={section.label || undefined} key={section.key}>
                <Presence initial={false}>
                  {section.label && section.rows.length ? (
                    <MenuGroupLabel key="label" className="zc-select__group-label">
                      {section.label}
                    </MenuGroupLabel>
                  ) : null}
                  {section.rows.map(option)}
                </Presence>
              </div>
            ))}
            {lb.navItems.length === 0 && <EmptyRow query={lb.query} />}
          </div>
        )}
      </div>
    </SelectMenu>
  );
}
