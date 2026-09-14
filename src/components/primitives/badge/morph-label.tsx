'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { UIMotion } from '../../../tokens/motion-tokens';
import { cx } from '../../internal/utils/cx';

const DROP_GRACE_MS = 80;

interface Word {
  key: number;
  label: string;
  cls: string;
}

export function MorphLabel({ label }: { label: string }) {
  const prev = useRef(label);
  const keyRef = useRef(1);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const [words, setWords] = useState<Word[]>([{ key: 0, label, cls: '' }]);
  const [boxW, setBoxW] = useState<number>();

  useLayoutEffect(() => {
    let live = true;
    const measure = () => {
      if (live && ghostRef.current) setBoxW(ghostRef.current.offsetWidth);
    };
    measure();
    document.fonts?.ready.then(measure);
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (prev.current === label) return;
    prev.current = label;
    const nk = keyRef.current++;
    const nextW = ghostRef.current?.offsetWidth;

    setWords((ws) => ws.concat({ key: nk, label, cls: 'zc-badge__word--in' }));
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setWords((ws) => ws.map((w) => (w.key === nk ? { ...w, cls: '' } : { ...w, cls: 'zc-badge__word--out' })));
        if (nextW) setBoxW(nextW);
      }),
    );
    const drop = setTimeout(
      () => setWords((ws) => ws.filter((w) => !w.cls.includes('--out'))),
      UIMotion.dur.base * 1000 + DROP_GRACE_MS,
    );

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(drop);
    };
  }, [label]);

  return (
    <span className="zc-badge__morph" style={boxW ? { width: boxW } : undefined}>
      <span className="zc-badge__ghost" ref={ghostRef} aria-hidden="true">
        {label}
      </span>
      {words.map((w) => (
        <span key={w.key} className={cx('zc-badge__word', w.cls)}>
          {w.label}
        </span>
      ))}
    </span>
  );
}
