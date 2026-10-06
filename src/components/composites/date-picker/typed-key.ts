import type { ChangeEvent, KeyboardEvent } from 'react';

export type KeyLike = Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'preventDefault'>;

export function typedKey(e: ChangeEvent<HTMLInputElement>): KeyLike {
  const input = e.nativeEvent instanceof InputEvent ? e.nativeEvent : null;
  const key = input?.inputType.startsWith('delete') ? 'Backspace' : (input?.data ?? '').slice(-1);
  return { key, metaKey: false, ctrlKey: false, preventDefault: () => {} };
}
