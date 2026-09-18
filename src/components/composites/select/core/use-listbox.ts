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
  const [query, setQueryState] = useState('');
  const [activeIdx, setActiveIdx] = useState(-1);
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

  const smoothScroll = useRef(false);
  const setQuery = (next: string) => {
    smoothScroll.current = false;
    setQueryState(next);
  };

  const show = () => {
    smoothScroll.current = false;
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
    if (open) return;
    setQuery('');
    setActiveIdx(-1);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    if (query) setActiveIdx(edgeEnabled(navItems, false));
    else setActiveIdx(navItems.findIndex((o) => isSelected(o.value) && !o.disabled));
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
      const row = rowAt(activeIdx);
      if (!list || !content || !row) return glide.leave();
      const inset = getComputedStyle(list);
      const rowTop = content.offsetTop + row.offsetTop;
      const above = rowTop - (parseFloat(inset.scrollPaddingTop) || 0);
      const below = rowTop + row.offsetHeight + (parseFloat(inset.scrollPaddingBottom) || 0) - list.clientHeight;
      if (list.scrollTop > above) list.scrollTo({ top: above, behavior });
      else if (list.scrollTop < below) list.scrollTo({ top: below, behavior });
      glide.enter(row);
    },
    [rowAt, activeIdx, glide],
  );

  useLayoutEffect(() => {
    follow(smoothScroll.current ? 'auto' : 'instant');
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
    smoothScroll.current = true;
    setActiveIdx(i);
  }
  function moveActive(dir: number) {
    navigate(stepEnabled(navItems, activeIdx, dir));
  }
  function edgeActive(toEnd: boolean) {
    navigate(edgeEnabled(navItems, toEnd));
  }
  function typeAhead(ch: string) {
    navigate(matchPrefix(navItems, optionText, typeahead.push(ch)));
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
        if (activeIdx >= 0) commit(navItems[activeIdx]);
        break;
      case 'Tab':
        requestClose();
        break;
      case ' ':
        if (searchable) break;
        e.preventDefault();
        if (typeahead.buffered()) typeAhead(e.key);
        else if (activeIdx >= 0) commit(navItems[activeIdx]);
        break;
      default:
        if (!searchable && e.key.length === 1 && !e.metaKey && !e.ctrlKey) typeAhead(e.key);
    }
  }

  const optId = (value: string) => baseId + '-opt-' + encodeURIComponent(value);
  const active = activeIdx >= 0 ? navItems[activeIdx] : undefined;
  const adId = open && active ? optId(active.value) : undefined;

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
    adId,
    groups,
    flat,
    sections,
    navItems,
    glide,
    isSelected,
    show,
    requestClose,
    commit,
    activeIdx,
    setActiveIdx,
    onMenuKeyDown,
  };
}
