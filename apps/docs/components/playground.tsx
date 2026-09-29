'use client';

import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { Button } from '@zyncat/ui/button';
import { Modal } from '@zyncat/ui/modal';
import { TabPanel, Tabs } from '@zyncat/ui/tabs';
import { TextField } from '@zyncat/ui/text-field';
import { Toggle } from '@zyncat/ui/toggle';
import { Tooltip } from '@zyncat/ui/tooltip';

import { Icon } from './icon';
import { CodeBlock } from './kit';

const ExpandedStage = createContext(false);

export function useExpandedStage() {
  return useContext(ExpandedStage);
}

const FULL_SIZE_LABEL = 'Full size';
const AWAY_LABEL = 'Playing at full size';

export interface PlaygroundProps {
  code: string;
  rail: ReactNode;
  stage?: 'center' | 'fill' | 'bare' | 'plate';
  layout?: 'side' | 'under';
  stageStyle?: CSSProperties;
  note?: string;
  expandTitle?: string;
  children: ReactNode;
}

export function Playground({
  code,
  rail,
  stage = 'center',
  layout = 'side',
  stageStyle,
  note,
  expandTitle,
  children,
}: PlaygroundProps) {
  const name = useId();
  const [tab, setTab] = useState('preview');
  const [dir, setDir] = useState<1 | -1 | 0>(0);
  const [replayKey, setReplayKey] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const [heldHeight, setHeldHeight] = useState(0);

  const openFullSize = () => {
    setHeldHeight(stageRef.current?.offsetHeight ?? 0);
    setExpanded(true);
  };

  return (
    <div className="playground">
      <div className="example-card__header">
        <Tabs
          items={[
            { value: 'preview', label: 'Preview' },
            { value: 'code', label: 'Code' },
          ]}
          value={tab}
          onChange={(v, d) => {
            setTab(v);
            setDir(d);
          }}
          name={name}
          ariaLabel="Playground view"
          className="plate-tabs"
        />
        <Tooltip content="Replay the demo" placement="bottom">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => setReplayKey((k) => k + 1)}
            aria-label="Restart the demo"
          >
            <Icon name="arrow-counter-clockwise" size="sm" />
          </Button>
        </Tooltip>
      </div>

      <TabPanel name={name} tab={tab} dir={dir}>
        {tab === 'preview' ? (
          <div className={`playground__body${layout === 'under' ? ' playground__body--under' : ''}`}>
            <div className="playground__frame">
              <div
                ref={stageRef}
                className={`playground__stage playground__stage--${stage}`}
                style={expanded && heldHeight ? { ...stageStyle, height: heldHeight } : stageStyle}
                key={replayKey}
              >
                {expanded ? <span className="playground__away">{AWAY_LABEL}</span> : children}
              </div>
              {note || expandTitle ? (
                <div className="playground__caption">
                  <span className="playground__note">{note}</span>
                  {expandTitle ? (
                    <button type="button" className="playground__expand" onClick={openFullSize}>
                      <Icon name="arrows-out" size="sm" />
                      {FULL_SIZE_LABEL}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <aside className="playground__rail">{rail}</aside>
          </div>
        ) : (
          <div className="example-card__code">
            <CodeBlock code={code} language="tsx" />
          </div>
        )}
      </TabPanel>

      {expandTitle ? (
        <Modal
          open={expanded}
          onOpenChange={setExpanded}
          htmlProps={{ className: 'stage-full', role: 'dialog', 'aria-label': expandTitle }}
        >
          <header className="stage-full__bar">
            <span className="stage-full__title">{expandTitle}</span>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>
              Close
              <kbd className="stage-full__kbd">Esc</kbd>
            </Button>
          </header>
          <div className="stage-full__stage" style={stageStyle}>
            <ExpandedStage value={true}>{children}</ExpandedStage>
          </div>
          <aside className="playground__rail stage-full__rail">{rail}</aside>
        </Modal>
      ) : null}
    </div>
  );
}

export function Knob({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="knob">
      <span className="knob__label">{label}</span>
      {children}
    </div>
  );
}

export function KnobSegment<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
}) {
  return (
    <Knob label={label}>
      <div className="knob-seg" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className="knob-seg__btn"
            aria-pressed={option === value}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </Knob>
  );
}

export function KnobRange({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
}) {
  return (
    <div className="knob">
      <span className="knob__head">
        <span className="knob__label">{label}</span>
        <span className="knob__value">{format ? format(value) : value}</span>
      </span>
      <input
        type="range"
        className="knob-range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function KnobSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="knob knob--row">
      <span className="knob__label">{label}</span>
      <Toggle
        size="sm"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        htmlProps={{ 'aria-label': label }}
      />
    </div>
  );
}

export function KnobText({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <Knob label={label}>
      <TextField
        id={id}
        size="sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        htmlProps={{ 'aria-label': label }}
      />
    </Knob>
  );
}

export function FitStage({ width, children }: { width: number; children: ReactNode }) {
  const toBox = useExpandedStage();
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ scale: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const measure = () => {
      const room = outer.clientWidth / width;
      const scale = toBox ? Math.min(1, room, outer.clientHeight / inner.offsetHeight) : Math.min(1, room);
      const height = inner.offsetHeight * scale;
      setBox((prev) => (prev && prev.scale === scale && prev.height === height ? prev : { scale, height }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [width, toBox]);

  return (
    <div
      ref={outerRef}
      className={`fit-stage${toBox ? ' fit-stage--box' : ''}`}
      style={!toBox && box ? { height: box.height } : undefined}
    >
      <div ref={innerRef} className="fit-stage__inner" style={{ width, scale: String(box?.scale ?? 1) }}>
        {children}
      </div>
    </div>
  );
}
