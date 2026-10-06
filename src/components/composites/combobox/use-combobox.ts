'use client';

import {
  useLayoutEffect,
  useMemo,
  useRef,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';

import { useListbox, type SelectGroup, type SelectOption } from '../select/core';
import { caretRect, queryAt, type QueryRange, type TextControl } from './caret';

const LIST_KEYS = ['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab'];

interface UseComboboxArgs {
  options: SelectOption[] | SelectGroup[];
  trigger: string | undefined;
  insert: (option: SelectOption) => string;
  onSelect: ((value: string, option: SelectOption) => void) | undefined;
  id: string | undefined;
}

export function useCombobox({ options, trigger, insert, onSelect, id }: UseComboboxArgs) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<TextControl>(null);
  const range = useRef<QueryRange>(null);
  const dismissed = useRef(-1);

  const lb = useListbox({
    options,
    disabled: false,
    loading: false,
    searchable: true,
    id,
    idPrefix: 'combobox-',
    isSelected: () => false,
    onCommit: (option) => {
      const field = fieldRef.current;
      if (trigger) field.setSelectionRange(range.current.start, range.current.end);
      else field.select();
      document.execCommand('insertText', false, insert(option));
      onSelect?.(option.value, option);
    },
    closeOnCommit: true,
    autoHighlight: true,
  });

  const caretAnchor = useMemo(
    () => ({ getBoundingClientRect: () => caretRect(fieldRef.current, range.current.start) }),
    [lb.query],
  );

  useLayoutEffect(() => {
    const field = wrapRef.current.querySelector<TextControl>('input, textarea');
    fieldRef.current = field;
    lb.triggerRef.current = field;
    field.setAttribute('aria-autocomplete', 'list');
    if (!trigger) field.setAttribute('role', 'combobox');
    if (!trigger) field.setAttribute('aria-expanded', String(lb.open));
    if (lb.open) field.setAttribute('aria-controls', lb.listId);
    else field.removeAttribute('aria-controls');
  });

  const show = (query: QueryRange) => {
    range.current = query;
    lb.setQuery(query.text);
    lb.show();
  };

  const onInput = (e: FormEvent) => {
    if (e.target !== fieldRef.current) return;
    const query = queryAt(fieldRef.current, trigger);
    if (!query) dismissed.current = -1;
    if (!query || !(trigger || query.text) || query.start === dismissed.current) lb.requestClose();
    else show(query);
  };

  const onSelectionChange = (e: FormEvent) => {
    if (!trigger || !lb.open || e.target !== fieldRef.current) return;
    if (queryAt(fieldRef.current, trigger)?.start !== range.current.start) lb.requestClose();
  };

  const onKeyDownCapture = (e: KeyboardEvent) => {
    if (e.target !== fieldRef.current || e.nativeEvent.isComposing) return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (!lb.open && !trigger && e.key === 'ArrowDown') {
      e.preventDefault();
      return show(queryAt(fieldRef.current, trigger));
    }
    if (!lb.open || !LIST_KEYS.includes(e.key)) return;
    if (!lb.navItems.length && (e.key === 'Enter' || e.key === 'Tab')) return lb.requestClose();
    if (e.key === 'Escape' && trigger) dismissed.current = range.current.start;
    e.stopPropagation();
    if (e.key !== 'Tab') return lb.onMenuKeyDown(e);
    if (trigger) e.preventDefault();
    lb.commitActive();
  };

  const onBlur = (e: FocusEvent) => {
    if (e.target === fieldRef.current) lb.requestClose();
  };

  const onMouseDown = (e: MouseEvent) => {
    if (e.target instanceof Node && !wrapRef.current.contains(e.target)) e.preventDefault();
  };

  const wrapProps = { ref: wrapRef, onInput, onSelect: onSelectionChange, onKeyDownCapture, onBlur, onMouseDown };
  return { lb, caretAnchor, wrapProps };
}
