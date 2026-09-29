'use client';

import { useState } from 'react';

import { useControllable } from '../../internal/hooks/use-controllable';

interface NumberValueOptions {
  value?: number | string;
  defaultValue: number;
  onChange?: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

export function useNumberValue({ value, defaultValue, onChange, min, max, step }: NumberValueOptions) {
  const resolvedValue = value === undefined ? undefined : typeof value === 'number' ? value : parseFloat(value) || 0;
  const [num, setNum] = useControllable<number>(resolvedValue, defaultValue, onChange);
  const [draft, setDraft] = useState<string | null>(null);
  const v = draft !== null ? parseFloat(draft) || 0 : num;
  const snap = (n: number) => parseFloat(n.toFixed(10));
  const clamp = (n: number) => Math.min(max, Math.max(min, snap(n)));
  const commit = (n: number) => {
    setDraft(null);
    setNum(clamp(n));
  };
  const stepBy = (direction: 1 | -1) => {
    const next = clamp(v + direction * step);
    commit(next);
    return next !== v;
  };
  const type = (raw: string) => {
    const text = raw.replace(/[^\d.-]/g, '');
    setDraft(text);
    setNum(clamp(parseFloat(text) || 0));
  };
  return { v, text: draft ?? String(num), commit, stepBy, type };
}
