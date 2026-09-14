'use client';

import { useEffect, useRef, type RefObject } from 'react';

import { fireGlint } from '../../internal/glass/glint';

export function useGlintOnChange(ref: RefObject<HTMLElement | null>, value: string, enabled: boolean) {
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    if (!enabled || !ref.current) return;
    return fireGlint(ref.current);
  }, [ref, value, enabled]);
}
