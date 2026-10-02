'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import { useGlide } from '../../../../motion/glide';
import { edgeEnabled, matchPrefix, stepEnabled } from '../../../internal/collection/collection';
import { useTypeahead } from '../../../internal/hooks/use-typeahead';
import { matches, normalize, optionText, type ListSection, type SelectGroup, type SelectOption } from './types';

export interface UseListboxArgs {
  options: SelectOption[] | SelectGroup[];
  disabled: boolean;
  loading: boolean;
  searchable: boolean;
  id?: string;
  idPrefix: string;
  isSelected: (value: string) => boolean;
  onCommit: (opt: SelectOption) => void;
  closeOnCommit: boolean;
}

export type ListboxState = ReturnType<typeof useListbox>;

const TAB_STOPS = ':is(input, button, [tabindex]):not([tabindex="-1"], :disabled)';

export function useListbox({
  options,
  disabled,
  loading,
  searchable,
  id,
  idPrefix,
  isSelected,
  onCommit,
  closeOnCommit,
}: UseListboxArgs) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const activeIdx = useRef(-1);
  const activeRow = useRef<HTMLElement | null>(null);
  const typeahead = useTypeahead();

  const triggerRef = useRef<HTMLElement>(null),
    listRef = useRef<HTMLDivElement>(null),
    contentRef = useRef<HTMLDivElement>(null),
    searchRef = useRef<HTMLInputElement>(null);
  const autoId = useId();
  const baseId = id || idPrefix + autoId;
  const menuId = baseId + '-menu';
  const listId = baseId + '-list';
  const glide = useGlide(contentRef);

  const { groups, flat } = useMemo(() => normalize(options), [options]);
  const { sections, navItems } = useMemo(() => {
    const sections: ListSection[] = [];
    const navItems: SelectOption[] = [];
    groups.forEach((group, gi) => {
      const rows = [];
      for (const option of group.items) {
        if (!matches(option, query)) continue;
        rows.push({ option, index: navItems.length });
        navItems.push(option);
      }
      sections.push({ key: 'group:' + gi, label: group.label || undefined, rows });
    });
    return { sections, navItems };
  }, [groups, query]);

  const show = () => {
    if (!disabled && !loading) setOpen(true);
  };
  const requestClose = () => setOpen(false);
  const returnFocus = () => triggerRef.current && triggerRef.current.focus();

  function commit(opt: SelectOption) {
    if (!opt || opt.disabled) return;
    onCommit(opt);
    if (closeOnCommit) {
      requestClose();
      returnFocus();
    }
  }

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    if (query) activeIdx.current = edgeEnabled(navItems, false);
    else activeIdx.current = navItems.findIndex((o) => isSelected(o.value) && !o.disabled);
  }, [open, query]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const ref = searchable ? searchRef : listRef;
    if (ref.current) ref.current.focus();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const rowAt = useCallback(
    (i: number) =>
      open && i >= 0 && listRef.current
        ? listRef.current.querySelector<HTMLElement>('[data-idx="' + i + '"]:not([data-exiting])')
        : null,
    [open],
  );

  const follow = useCallback(
    (behavior: ScrollBehavior) => {
      const list = listRef.current;
      const content = contentRef.current;
      const row = rowAt(activeIdx.current);
      activeRow.current?.removeAttribute('data-active');
      row?.setAttribute('data-active', 'true');
      activeRow.current = row;
      for (const host of [triggerRef.current, searchable ? searchRef.current : list]) {
        if (row) host?.setAttribute('aria-activedescendant', row.id);
        else host?.removeAttribute('aria-activedescendant');
      }
      if (!list || !content || !row) return glide.leave();
      const inset = getComputedStyle(list);
      const rowTop = content.offsetTop + row.offsetTop;
      const above = rowTop - (parseFloat(inset.scrollPaddingTop) || 0);
      const below = rowTop + row.offsetHeight + (parseFloat(inset.scrollPaddingBottom) || 0) - list.clientHeight;
      if (list.scrollTop > above) list.scrollTo({ top: above, behavior });
      else if (list.scrollTop < below) list.scrollTo({ top: below, behavior });
      glide.enter(row);
    },
    [rowAt, searchable, glide],
  );

  useLayoutEffect(() => {
    follow('instant');
  }, [follow, query]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const reflows = new ResizeObserver(() => follow('instant'));
    reflows.observe(content);
    return () => reflows.disconnect();
  }, [follow]);

  function navigate(i: number) {
    if (i < 0) return;
    activeIdx.current = i;
    follow('auto');
  }
  function moveActive(dir: number) {
    navigate(stepEnabled(navItems, activeIdx.current, dir));
  }
  function edgeActive(toEnd: boolean) {
    navigate(edgeEnabled(navItems, toEnd));
  }
  function typeAhead(ch: string) {
    navigate(matchPrefix(navItems, optionText, typeahead.push(ch)));
  }

  function tabLeavesMenu(e: KeyboardEvent) {
    const ahead = e.shiftKey ? Node.DOCUMENT_POSITION_PRECEDING : Node.DOCUMENT_POSITION_FOLLOWING;
    const stops = document.getElementById(menuId)?.querySelectorAll(TAB_STOPS);
    return !stops || !Array.from(stops).some((stop) => e.currentTarget.compareDocumentPosition(stop) & ahead);
  }

  function onMenuKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        requestClose();
        returnFocus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveActive(-1);
        break;
      case 'Home':
        e.preventDefault();
        edgeActive(false);
        break;
      case 'End':
        e.preventDefault();
        edgeActive(true);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIdx.current >= 0) commit(navItems[activeIdx.current]);
        break;
      case 'Tab':
        if (tabLeavesMenu(e)) requestClose();
        break;
      case ' ':
        if (searchable) break;
        e.preventDefault();
        if (typeahead.buffered()) typeAhead(e.key);
        else if (activeIdx.current >= 0) commit(navItems[activeIdx.current]);
        break;
      default:
        if (!searchable && e.key.length === 1 && !e.metaKey && !e.ctrlKey) typeAhead(e.key);
    }
  }

  const optId = (value: string) => baseId + '-opt-' + encodeURIComponent(value);

  return {
    open,
    query,
    setQuery,
    triggerRef,
    listRef,
    contentRef,
    searchRef,
    baseId,
    menuId,
    listId,
    optId,
    groups,
    flat,
    sections,
    navItems,
    glide,
    isSelected,
    show,
    requestClose,
    commit,
    navigate,
    onMenuKeyDown,
  };
}
