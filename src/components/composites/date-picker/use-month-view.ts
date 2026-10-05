'use client';

import { useEffect, useRef, useState } from 'react';

export function useMonthView(seed: Date) {
  const [view, setView] = useState<{ y: number; m: number }>({ y: seed.getFullYear(), m: seed.getMonth() });
  const viewIdx = view.y * 12 + view.m;

  function nav(dir: number) {
    setView((v) => {
      const d = new Date(v.y, v.m + dir, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  const prevViewIdxRef = useRef(viewIdx);
  const jumpedRef = useRef(false);
  const navDir =
    prevViewIdxRef.current === viewIdx || jumpedRef.current ? 0 : viewIdx > prevViewIdxRef.current ? 1 : -1;
  useEffect(() => {
    prevViewIdxRef.current = viewIdx;
    jumpedRef.current = false;
  }, [viewIdx]);

  function jumpToMonth(y: number, m: number, offset: number) {
    jumpedRef.current = true;
    const base = new Date(y, m - offset, 1);
    setView({ y: base.getFullYear(), m: base.getMonth() });
  }

  return { view, setView, viewIdx, nav, navDir, jumpToMonth };
}
