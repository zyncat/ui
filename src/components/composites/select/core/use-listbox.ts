'use client';

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import { useGlide } from '../../../../motion/glide';
import { edgeEnabled, matchPrefix, stepEnabled } from '../../../internal/collection/collection';
import { useTypeahead } from '../../../internal/hooks/use-typeahead';
import { matches, normalize, optionText, type SelectGroup, type SelectOption } from './types';

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
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(-1);
  const typeahead = useTypeahead();

  const triggerRef = useRef<HTMLButtonElement>(null),
    listRef = useRef<HTMLDivElement>(null),
    searchRef = useRef<HTMLInputElement>(null);
  const autoId = useId();
  const baseId = id || idPrefix + autoId;
  const menuId = baseId + '-menu';
  const listId = baseId + '-list';
  const glide = useGlide(listRef);

  const { groups, flat } = useMemo(() => normalize(options), [options]);
  const navItems = useMemo(() => flat.filter((o) => matches(o, query)), [flat, query]);

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
    if (open) return;
    setQuery('');
    setActiveIdx(-1);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (query) setActiveIdx(edgeEnabled(navItems, false));
    else setActiveIdx(navItems.findIndex((o) => isSelected(o.value) && !o.disabled));
  }, [open, query]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const ref = searchable ? searchRef : listRef;
    if (ref.current) ref.current.focus();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const list = listRef.current;
    if (!open || activeIdx < 0 || !list) return;
    const el = list.querySelector('[data-idx="' + activeIdx + '"]') as HTMLElement | null;
    if (!el) return;
    if (el.offsetTop < list.scrollTop) list.scrollTop = el.offsetTop;
    else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight)
      list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight;
  }, [activeIdx, open]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const list = listRef.current;
    const el = open && activeIdx >= 0 && list && list.querySelector<HTMLElement>('[data-idx="' + activeIdx + '"]');
    if (el) glide.enter(el);
    else glide.leave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIdx, query]);

  function moveActive(dir: number) {
    const i = stepEnabled(navItems, activeIdx, dir);
    if (i >= 0) setActiveIdx(i);
  }
  function edgeActive(toEnd: boolean) {
    const i = edgeEnabled(navItems, toEnd);
    if (i >= 0) setActiveIdx(i);
  }
  function typeAhead(ch: string) {
    const i = matchPrefix(navItems, optionText, typeahead.push(ch));
    if (i >= 0) setActiveIdx(i);
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
    searchRef,
    baseId,
    menuId,
    listId,
    optId,
    adId,
    groups,
    flat,
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
