'use client';

import './date-picker.css';

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type RefObject } from 'react';

import { cx } from '../../internal/utils/cx';
import { pad } from './date-utils';
import { typedKey, type KeyLike } from './typed-key';

type Meridiem = 'AM' | 'PM';
type Segment = 'h' | 'm';
interface Pending {
  seg: Segment;
  d: number;
}

export interface TimeSegmentsProps {
  value?: string | null;
  onCommit?: (value: string) => void;
  format?: '24h' | '12h';
  minuteStep?: number;
  min?: string | null;
  max?: string | null;
  disabled?: boolean;
  ariaLabel?: string;
}

export const disp12 = (h24: number): number => ((h24 + 11) % 12) + 1;
const tsgToH24 = (d12: number, mer: Meridiem): number => (d12 % 12) + (mer === 'PM' ? 12 : 0);

function tsgFeed(pend: number | null, d: number, hi: number): { val: number; done: boolean } {
  if (pend != null) {
    const n = pend * 10 + d;
    if (n <= hi) return { val: n, done: true };
  }
  return { val: d, done: d * 10 > hi };
}

export function TimeSegments({
  value = null,
  onCommit,
  format = '24h',
  minuteStep = 5,
  min = null,
  max = null,
  disabled = false,
  ariaLabel = 'Time',
}: TimeSegmentsProps) {
  const is12 = format === '12h';
  const seed = value ? value.split(':').map(Number) : [null, null];

  const [h, setHState] = useState<number | null>(seed[0]);
  const [m, setMState] = useState<number | null>(seed[1]);
  const [mer, setMer] = useState<Meridiem>(seed[0] != null && seed[0] >= 12 ? 'PM' : 'AM');
  const [pend, setPendState] = useState<Pending | null>(null);

  const hLive = useRef<number | null>(seed[0]);
  const mLive = useRef<number | null>(seed[1]);
  const pendLive = useRef<Pending | null>(null);
  const setH = (v: number | null) => {
    hLive.current = v;
    setHState(v);
  };
  const setM = (v: number | null) => {
    mLive.current = v;
    setMState(v);
  };
  const setPend = (v: Pending | null) => {
    pendLive.current = v;
    setPendState(v);
  };

  const hRef = useRef<HTMLInputElement>(null);
  const mRef = useRef<HTMLInputElement>(null);
  const merRef = useRef<HTMLSpanElement>(null);
  const lastRef = useRef<string | null>(value || null);

  useEffect(() => {
    if ((value || null) === lastRef.current) return;
    lastRef.current = value || null;
    const p = value ? value.split(':').map(Number) : [null, null];
    setH(p[0]);
    setM(p[1]);
    if (p[0] != null) setMer(p[0] >= 12 ? 'PM' : 'AM');
    setPend(null);
  }, [value]);

  function tryCommit(nh: number | null, nm: number | null) {
    if (nh == null || nm == null) return;
    let t = pad(nh) + ':' + pad(nm);
    if (min && t < min) t = min;
    if (max && t > max) t = max;
    const p = t.split(':').map(Number);
    if (p[0] !== nh) {
      setH(p[0]);
      setMer(p[0] >= 12 ? 'PM' : 'AM');
      setPend(null);
    }
    if (p[1] !== nm) setM(p[1]);
    if (t === lastRef.current) return;
    lastRef.current = t;
    if (onCommit) onCommit(t);
  }

  const focusSeg = (r: RefObject<HTMLElement | null>) => {
    if (r.current) r.current.focus();
  };

  function onHKey(e: KeyLike) {
    const k = e.key;
    if (/^[0-9]$/.test(k)) {
      const pd = pend && pend.seg === 'h' ? pend.d : null;
      const r = tsgFeed(pd, +k, is12 ? 12 : 23);
      const nh = is12 ? tsgToH24(r.val === 0 ? 12 : r.val, mer) : r.val;
      setH(nh);
      if (!is12) setMer(nh >= 12 ? 'PM' : 'AM');
      setPend(r.done ? null : { seg: 'h', d: r.val });
      if (r.done) {
        focusSeg(mRef);
        tryCommit(nh, mLive.current);
      }
    } else if (k === 'ArrowUp' || k === 'ArrowDown') {
      const dir = k === 'ArrowUp' ? 1 : -1;
      const nh = h == null ? new Date().getHours() : (h + dir + 24) % 24;
      setH(nh);
      setMer(nh >= 12 ? 'PM' : 'AM');
      setPend(null);
      tryCommit(nh, mLive.current);
    } else if (k === 'Backspace' || k === 'Delete') {
      setH(null);
      setPend(null);
    } else if (k === 'ArrowRight' || k === ':' || k === ';') {
      focusSeg(mRef);
    } else if (k === 'Tab') {
      return;
    } else if (k.length === 1 && !e.metaKey && !e.ctrlKey) {
    } else return;
    e.preventDefault();
  }

  function onMKey(e: KeyLike) {
    const k = e.key;
    if (/^[0-9]$/.test(k)) {
      const pd = pend && pend.seg === 'm' ? pend.d : null;
      const r = tsgFeed(pd, +k, 59);
      setM(r.val);
      setPend(r.done ? null : { seg: 'm', d: r.val });
      if (r.done) {
        if (is12) focusSeg(merRef);
        tryCommit(hLive.current, r.val);
      }
    } else if (k === 'ArrowUp' || k === 'ArrowDown') {
      const dir = k === 'ArrowUp' ? 1 : -1;
      let nm;
      if (m == null) {
        nm = (Math.round(new Date().getMinutes() / minuteStep) * minuteStep) % 60;
      } else {
        const next =
          dir > 0 ? (Math.floor(m / minuteStep) + 1) * minuteStep : (Math.ceil(m / minuteStep) - 1) * minuteStep;
        nm = ((next % 60) + 60) % 60;
      }
      setM(nm);
      setPend(null);
      tryCommit(hLive.current, nm);
    } else if (k === 'Backspace' || k === 'Delete') {
      if (m == null && !(pend && pend.seg === 'm')) {
        focusSeg(hRef);
      } else {
        setM(null);
        setPend(null);
      }
    } else if (k === 'ArrowLeft') {
      focusSeg(hRef);
    } else if (k === 'ArrowRight' && is12) {
      focusSeg(merRef);
    } else if (k === 'Tab') {
      return;
    } else if (k.length === 1 && !e.metaKey && !e.ctrlKey) {
    } else return;
    e.preventDefault();
  }

  function setMeridiem(next: Meridiem) {
    setMer(next);
    if (h != null) {
      const nh = tsgToH24(disp12(h), next);
      setH(nh);
      tryCommit(nh, mLive.current);
    }
  }
  function onMerKey(e: KeyboardEvent<HTMLSpanElement>) {
    const k = e.key;
    if (k === 'a' || k === 'A') setMeridiem('AM');
    else if (k === 'p' || k === 'P') setMeridiem('PM');
    else if (k === 'ArrowUp' || k === 'ArrowDown') setMeridiem(mer === 'AM' ? 'PM' : 'AM');
    else if (k === 'ArrowLeft') focusSeg(mRef);
    else if (k === 'Tab') {
      return;
    } else if (k.length === 1 && !e.metaKey && !e.ctrlKey) {
    } else return;
    e.preventDefault();
  }

  function onPaste(e: ClipboardEvent<HTMLDivElement>) {
    if (disabled) return;
    const txt = (e.clipboardData.getData('text') || '').trim();
    const mt = txt.match(/^(\d{1,2})[:h.\s]?(\d{2})?\s*([ap])\.?m?\.?$/i) || txt.match(/^(\d{1,2})[:h.\s]?(\d{2})?$/);
    if (!mt) return;
    e.preventDefault();
    let hh = +mt[1];
    const mm = mt[2] != null ? +mt[2] : 0;
    if (mt[3]) hh = tsgToH24(hh, /^p/i.test(mt[3]) ? 'PM' : 'AM');
    if (hh > 23 || mm > 59) return;
    setH(hh);
    setM(mm);
    setMer(hh >= 12 ? 'PM' : 'AM');
    setPend(null);
    tryCommit(hh, mm);
  }

  const onSegBlur = (seg: Segment) => () => {
    if (pendLive.current && pendLive.current.seg === seg) {
      setPend(null);
      tryCommit(hLive.current, mLive.current);
    }
  };

  const hText = pend && pend.seg === 'h' ? pad(pend.d) : h == null ? '--' : pad(is12 ? disp12(h) : h);
  const mText = pend && pend.seg === 'm' ? pad(pend.d) : m == null ? '--' : pad(m);

  const segCls = (empty: boolean): string => 'zc-tsg__seg' + (empty ? ' zc-is-empty' : '');
  const tab = disabled ? -1 : 0;

  return (
    <div
      className={cx('zc-tsg', disabled && 'zc-is-disabled')}
      role="group"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      onPaste={onPaste}
    >
      <input
        ref={hRef}
        className={segCls(h == null && !(pend && pend.seg === 'h'))}
        role="spinbutton"
        inputMode="numeric"
        disabled={disabled}
        value={hText}
        aria-label="Hours"
        aria-valuemin={is12 ? 1 : 0}
        aria-valuemax={is12 ? 12 : 23}
        aria-valuenow={h == null ? undefined : is12 ? disp12(h) : h}
        aria-valuetext={h == null ? 'Empty' : hText}
        onKeyDown={onHKey}
        onChange={(e) => onHKey(typedKey(e))}
        onBlur={onSegBlur('h')}
      />
      <span className="zc-tsg__sep" aria-hidden="true">
        :
      </span>
      <input
        ref={mRef}
        className={segCls(m == null && !(pend && pend.seg === 'm'))}
        role="spinbutton"
        inputMode="numeric"
        disabled={disabled}
        value={mText}
        aria-label="Minutes"
        aria-valuemin={0}
        aria-valuemax={59}
        aria-valuenow={m == null ? undefined : m}
        aria-valuetext={m == null ? 'Empty' : mText}
        onKeyDown={onMKey}
        onChange={(e) => onMKey(typedKey(e))}
        onBlur={onSegBlur('m')}
      />
      {is12 ? (
        <span
          ref={merRef}
          className="zc-tsg__seg zc-tsg__seg--mer"
          role="spinbutton"
          tabIndex={tab}
          aria-label="AM or PM"
          aria-valuetext={mer}
          onKeyDown={disabled ? undefined : onMerKey}
          onPointerUp={(e) => {
            if (!disabled && e.pointerType !== 'mouse') setMeridiem(mer === 'AM' ? 'PM' : 'AM');
          }}
        >
          {mer}
        </span>
      ) : null}
    </div>
  );
}
