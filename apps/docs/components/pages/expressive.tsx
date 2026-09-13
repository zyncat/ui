'use client';

import { useRef, useState, type CSSProperties } from 'react';

import { Button } from '@zyncat/ui/button';
import { Confetti, type ConfettiEmitter, type ConfettiField, type ConfettiHandle } from '@zyncat/ui/confetti';
import { FlowField } from '@zyncat/ui/flow-field';
import { Lens } from '@zyncat/ui/lens';
import { MorphingText } from '@zyncat/ui/morphing-text';
import { Odometer } from '@zyncat/ui/odometer';
import { TypingLines, type TypingCaret, type TypingUnit } from '@zyncat/ui/typing-lines';
import { WeightField } from '@zyncat/ui/weight-field';

import { KnobRange, KnobSegment, KnobSwitch, KnobText, Playground, useExpandedStage } from '../playground';

const ROW: CSSProperties = { display: 'flex', gap: 'var(--space-5)', alignItems: 'center', flexWrap: 'wrap' };
const COLUMN: CSSProperties = { display: 'flex', gap: 'var(--space-4)', flexDirection: 'column' };
const CAPTION: CSSProperties = { font: 'var(--type-caption)', color: 'var(--text-muted)' };
const RULE: CSSProperties = { height: 'var(--border-hairline)', background: 'var(--border-default)' };

const grouped = (v: number) => v.toLocaleString('en-US');
const padded = (v: number) => String(v).padStart(8, '0');
const times = (v: number) => `${v}×`;

type OdometerFormat = 'plain' | 'grouped' | 'padded';

const ODOMETER_FORMATS: Record<OdometerFormat, { fn?: (v: number) => string; code: string }> = {
  plain: { code: '' },
  grouped: { fn: grouped, code: " format={(v) => v.toLocaleString('en-US')}" },
  padded: { fn: padded, code: " format={(v) => String(v).padStart(8, '0')}" },
};

const ODOMETER_LOUD: CSSProperties = { '--odometer-size': 'var(--size-display-lg)' } as CSSProperties;

export function OdometerPlayground() {
  const [value, setValue] = useState(12480);
  const [speed, setSpeed] = useState(1);
  const [format, setFormat] = useState<OdometerFormat>('grouped');

  const code = [
    `<Odometer value={value} speed={${speed}}${ODOMETER_FORMATS[format].code} />`,
    '',
    `setValue(value + 4444);`,
    `setValue(value - 4444);`,
  ].join('\n');

  return (
    <Playground
      code={code}
      note="A rise rolls the digits up, a fall rolls them down. Fire again mid-roll - every column carries on from where it is."
      rail={
        <>
          <KnobSegment label="format" value={format} onChange={setFormat} options={['plain', 'grouped', 'padded']} />
          <KnobRange label="speed" value={speed} onChange={setSpeed} min={0.25} max={2.5} step={0.25} format={times} />
        </>
      }
    >
      <div style={{ ...COLUMN, alignItems: 'center', gap: 'var(--space-6)' }}>
        <Odometer value={value} speed={speed} format={ODOMETER_FORMATS[format].fn} style={ODOMETER_LOUD} />
        <div style={{ ...ROW, justifyContent: 'center' }}>
          <Button size="sm" variant="secondary" onClick={() => setValue((v) => Math.max(0, v - 4444))}>
            −4,444
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setValue((v) => Math.max(0, v - 9))}>
            −9
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setValue((v) => v + 9)}>
            +9
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setValue((v) => v + 4444)}>
            +4,444
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setValue(10000 + Math.floor(Math.random() * 89999))}>
            Jump
          </Button>
        </div>
      </div>
    </Playground>
  );
}

const TYPING_LINES = ['Design every state.', 'Make every motion interruptible.', 'Ship the polish.'];

export function TypingLinesPlayground() {
  const [caret, setCaret] = useState<TypingCaret>('line');
  const [unit, setUnit] = useState<TypingUnit>('character');
  const [speed, setSpeed] = useState(1);

  const code = `<TypingLines
  lines={['Design every state.', 'Make every motion interruptible.', 'Ship the polish.']}
  unit="${unit}"
  caret="${caret}"
  speed={${speed}}
/>`;

  return (
    <Playground
      code={code}
      note='Word reveals usually pair with caret "none" - nothing is pending between words.'
      rail={
        <>
          <KnobSegment label="unit" value={unit} onChange={setUnit} options={['character', 'word']} />
          <KnobSegment
            label="caret"
            value={caret}
            onChange={setCaret}
            options={['line', 'block', 'underscore', 'none']}
          />
          <KnobRange label="speed" value={speed} onChange={setSpeed} min={0.25} max={2.5} step={0.25} format={times} />
        </>
      }
    >
      <TypingLines lines={TYPING_LINES} caret={caret} unit={unit} speed={speed} />
    </Playground>
  );
}

const SPECIMEN_ROWS = [
  { text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', weight: 'var(--weight-semibold)', ink: 'var(--text-strong)' },
  { text: 'abcdefghijklmnopqrstuvwxyz', weight: 'var(--weight-regular)', ink: 'var(--text-strong)' },
  { text: '0123456789', weight: 'var(--weight-regular)', ink: 'var(--text-muted)' },
];

const BROADSHEET: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-5)',
  padding: 'var(--space-7)',
  background: 'var(--bg-surface)',
};

const FINE_PRINT: CSSProperties = {
  columns: 3,
  columnGap: 'var(--space-5)',
  fontSize: '9px',
  lineHeight: 1.7,
  color: 'var(--text-secondary)',
  textAlign: 'justify',
};

const ENGRAVING: CSSProperties = {
  flexShrink: 0,
  width: '9rem',
  height: '9rem',
  borderRadius: 'var(--radius-full)',
  background:
    'repeating-radial-gradient(circle at 50% 50%, var(--border-strong) 0 1px, transparent 1px 5px), conic-gradient(from 0deg, transparent 0deg, var(--bg-muted) 90deg, transparent 180deg, var(--bg-muted) 270deg, transparent 360deg)',
  border: 'var(--border-hairline) solid var(--border-default)',
};

const FINE_TEXT =
  'Set close and small, this paragraph exists to be read through glass. Every glyph in the magnified disc is ' +
  'live vector type drawn at the enlarged size, not a stretched screenshot of this one, which is why the edges ' +
  'stay razor sharp at six times magnification. The lens re-clones this column whenever it changes, keeps your ' +
  'text in the accessibility tree, hides only the copy, and hands the glass to the keyboard: focus the stage, ' +
  'steer with the arrow keys, leave with Escape. Chromatic fringing gathers at the rim and strengthens with ' +
  'travel speed, the way thick glass smears a moving image, and settles back to clean edges at rest.';

function Broadsheet() {
  return (
    <div style={BROADSHEET}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-6)' }}>
        <span style={{ font: 'var(--type-display-lg)', fontSize: '4.5rem', letterSpacing: '-0.05em', lineHeight: 0.9 }}>
          Aa
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-1)' }}>
          <span
            style={{
              font: 'var(--type-micro)',
              color: 'var(--text-muted)',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            Geist - specimen sheet
          </span>
          <span style={{ font: 'var(--type-micro)', fontWeight: 'var(--weight-regular)', color: 'var(--text-subtle)' }}>
            Hold the glass over the small print
          </span>
        </span>
      </div>
      <div style={RULE} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {SPECIMEN_ROWS.map((row) => (
          <div
            key={row.text}
            style={{
              font: 'var(--type-title)',
              fontWeight: row.weight,
              color: row.ink,
              letterSpacing: '0.05em',
              lineHeight: 1.1,
            }}
          >
            {row.text}
          </div>
        ))}
      </div>
      <div style={RULE} />
      <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
        <div style={FINE_PRINT}>{FINE_TEXT}</div>
        <div style={ENGRAVING} aria-hidden />
      </div>
      <div style={RULE} />
      <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', letterSpacing: '0.07em' }}>
        . , : ; … ! ? &lsquo; &rsquo; &ldquo; &rdquo; ( ) [ ] &#123; &#125; / \ | - – — @ &amp; # % ‰ + × ÷ = ≠ ± ~ ° √
        ∞ µ π Ω
      </div>
    </div>
  );
}

export function LensPlayground() {
  const [magnification, setMagnification] = useState(2.6);
  const [radius, setRadius] = useState(150);
  const [chromatic, setChromatic] = useState(true);

  const code = `<Lens magnification={${magnification}} radius={${radius}} chromatic={${chromatic}}>
  <Broadsheet />
</Lens>`;

  return (
    <Playground
      code={code}
      stage="bare"
      expandTitle="Lens - specimen sheet"
      note="Sweep the glass over the small print; focus the sheet and steer with the arrow keys."
      rail={
        <>
          <KnobRange
            label="magnification"
            value={magnification}
            onChange={setMagnification}
            min={1.2}
            max={6}
            step={0.2}
            format={times}
          />
          <KnobRange
            label="radius"
            value={radius}
            onChange={setRadius}
            min={60}
            max={260}
            step={10}
            format={(v) => `${v}px`}
          />
          <KnobSwitch label="chromatic" checked={chromatic} onChange={setChromatic} />
        </>
      }
    >
      <Lens magnification={magnification} radius={radius} chromatic={chromatic}>
        <Broadsheet />
      </Lens>
    </Playground>
  );
}

const WEIGHT_STAGE: CSSProperties = { '--weight-field-pad': 'var(--space-6) 0' } as CSSProperties;

export function WeightFieldPlayground() {
  const [text, setText] = useState('Nostalgia');
  const [speed, setSpeed] = useState(1);

  const code = `<WeightField text="${text}" speed={${speed}} />`;

  return (
    <Playground
      code={code}
      note="Point at one letter: it takes the peak weight, a doubled stroke and a sliver of padding either side. Its immediate neighbours take 600 and the same padding, the two beyond them 400, and everything else holds at 300."
      rail={
        <>
          <KnobText label="text" value={text} onChange={setText} placeholder="Type a headline" />
          <KnobRange label="speed" value={speed} onChange={setSpeed} min={0.25} max={2.5} step={0.25} format={times} />
        </>
      }
    >
      <WeightField text={text || 'Nostalgia'} speed={speed} style={WEIGHT_STAGE} />
    </Playground>
  );
}

const MORPH_SETS = {
  words: ['Weight', 'Timing', 'Ease', 'Rest'],
  phrases: ['Design every state', 'Interrupt every motion', 'Ship the polish'],
} as const;

type MorphSet = keyof typeof MORPH_SETS;

const MORPH_PHRASE_SIZE: CSSProperties = { '--morphing-text-size': 'var(--size-title-lg)' } as CSSProperties;

export function MorphingTextPlayground() {
  const [set, setSet] = useState<MorphSet>('words');
  const [hold, setHold] = useState(1500);
  const [speed, setSpeed] = useState(1);

  const code = `<MorphingText
  words={[${MORPH_SETS[set].map((w) => `'${w}'`).join(', ')}]}
  hold={${hold}}
  speed={${speed}}
/>`;

  return (
    <Playground
      code={code}
      note="Hover the word to hold it; a morph already in flight always finishes."
      rail={
        <>
          <KnobSegment label="words" value={set} onChange={setSet} options={['words', 'phrases']} />
          <KnobRange
            label="hold"
            value={hold}
            onChange={setHold}
            min={400}
            max={3000}
            step={100}
            format={(v) => `${v}ms`}
          />
          <KnobRange label="speed" value={speed} onChange={setSpeed} min={0.25} max={2.5} step={0.25} format={times} />
        </>
      }
    >
      <MorphingText
        words={[...MORPH_SETS[set]]}
        hold={hold}
        speed={speed}
        style={set === 'phrases' ? MORPH_PHRASE_SIZE : undefined}
      />
    </Playground>
  );
}

type FlowPalette = 'house' | 'quiet' | 'ember';

const FLOW_PALETTES: Record<FlowPalette, CSSProperties> = {
  house: {},
  quiet: { '--flow-field-ink': 'var(--border-strong)', '--flow-field-accent': 'var(--text-strong)' } as CSSProperties,
  ember: { '--flow-field-ink': 'var(--text-disabled)', '--flow-field-accent': 'var(--danger)' } as CSSProperties,
};

const FLOW_STAGE: CSSProperties = { '--flow-field-min-height': '26rem', width: '100%' } as CSSProperties;

const FLOW_INSET: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2)',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '26rem',
  padding: 'var(--space-7) var(--space-6)',
  textAlign: 'center',
};

function FlowHero({
  spacing,
  radius,
  speed,
  palette,
}: {
  spacing: number;
  radius: number;
  speed: number;
  palette: FlowPalette;
}) {
  const expanded = useExpandedStage();
  const stage = expanded ? { ...FLOW_STAGE, height: '100%' } : FLOW_STAGE;

  return (
    <FlowField spacing={spacing} radius={radius} speed={speed} style={{ ...stage, ...FLOW_PALETTES[palette] }}>
      <div style={FLOW_INSET}>
        <span style={{ font: 'var(--type-title)', color: 'var(--text-strong)' }}>Sweep the pointer across it</span>
        <span style={CAPTION}>
          The needles breathe on a noise loop until the pointer arrives, then swing away with per-cell lag. The grip
          takes hold in 83ms and lets go over 400ms, so the field never snaps back.
        </span>
      </div>
    </FlowField>
  );
}

export function FlowFieldPlayground() {
  const [spacing, setSpacing] = useState(26);
  const [radius, setRadius] = useState(210);
  const [speed, setSpeed] = useState(1);
  const [palette, setPalette] = useState<FlowPalette>('house');

  const paletteCode =
    palette === 'house'
      ? ''
      : `\n  style={{ '--flow-field-ink': '${palette === 'quiet' ? 'var(--border-strong)' : 'var(--text-disabled)'}', '--flow-field-accent': '${palette === 'quiet' ? 'var(--text-strong)' : 'var(--danger)'}' }}`;

  const code = `<FlowField spacing={${spacing}} radius={${radius}} speed={${speed}}${paletteCode}>
  <Hero />
</FlowField>`;

  return (
    <Playground
      code={code}
      stage="bare"
      expandTitle="FlowField - pointer field"
      rail={
        <>
          <KnobRange
            label="spacing"
            value={spacing}
            onChange={setSpacing}
            min={12}
            max={72}
            step={2}
            format={(v) => `${v}px`}
          />
          <KnobRange
            label="radius"
            value={radius}
            onChange={setRadius}
            min={40}
            max={640}
            step={20}
            format={(v) => `${v}px`}
          />
          <KnobRange label="speed" value={speed} onChange={setSpeed} min={0.25} max={2.5} step={0.25} format={times} />
          <KnobSegment label="palette" value={palette} onChange={setPalette} options={['house', 'quiet', 'ember']} />
        </>
      }
    >
      <FlowHero spacing={spacing} radius={radius} speed={speed} palette={palette} />
    </Playground>
  );
}

const CONFETTI_EMITTERS: readonly ConfettiEmitter[] = ['sides', 'top', 'corners'];
const CONFETTI_FIELDS: readonly ConfettiField[] = ['viewport', 'container'];

type ConfettiPaper = 'house' | 'gold';

const GOLD_FOIL: CSSProperties = {
  '--confetti-paper-1': 'oklch(0.82 0.13 88)',
  '--confetti-paper-2': 'oklch(0.93 0.05 92)',
  '--confetti-paper-3': 'oklch(0.62 0.09 80)',
  '--confetti-paper-4': 'oklch(0.72 0.11 70)',
  '--confetti-paper-5': 'var(--text-strong)',
  '--confetti-weights': '1 0.8 0.9 1 0.3',
  '--confetti-gloss': '78%',
} as CSSProperties;

const GOLD_FOIL_CODE = `
  style={{
    '--confetti-paper-1': 'oklch(0.82 0.13 88)',
    '--confetti-paper-2': 'oklch(0.93 0.05 92)',
    '--confetti-paper-3': 'oklch(0.62 0.09 80)',
    '--confetti-paper-4': 'oklch(0.72 0.11 70)',
    '--confetti-paper-5': 'var(--text-strong)',
    '--confetti-weights': '1 0.8 0.9 1 0.3',
    '--confetti-gloss': '78%',
  }}`;

export function ConfettiPlayground() {
  const confetti = useRef<ConfettiHandle>(null);
  const [emitter, setEmitter] = useState<ConfettiEmitter>('sides');
  const [count, setCount] = useState(220);
  const [duration, setDuration] = useState(0.5);
  const [field, setField] = useState<ConfettiField>('viewport');
  const [paper, setPaper] = useState<ConfettiPaper>('house');

  const code = [
    `<Confetti`,
    `  ref={confetti}`,
    `  field="${field}"`,
    `  emitter="${emitter}"`,
    `  count={${count}}`,
    `  duration={${duration}}${paper === 'gold' ? GOLD_FOIL_CODE : ''}`,
    `/>`,
    ``,
    `confetti.current?.fire()`,
  ].join('\n');

  return (
    <Playground
      code={code}
      stageStyle={{ minHeight: '22rem' }}
      note={
        field === 'viewport'
          ? 'The canvas is pinned to the window - the whole page is the stage.'
          : 'The canvas fills this stage and the burst clips at its edge.'
      }
      rail={
        <>
          <KnobSegment label="field" value={field} onChange={setField} options={CONFETTI_FIELDS} />
          <KnobSegment label="emitter" value={emitter} onChange={setEmitter} options={CONFETTI_EMITTERS} />
          <KnobRange label="count" value={count} onChange={setCount} min={40} max={520} step={20} />
          <KnobRange
            label="duration"
            value={duration}
            onChange={setDuration}
            min={0}
            max={2.5}
            step={0.25}
            format={(v) => `${v}s`}
          />
          <KnobSegment label="papers" value={paper} onChange={setPaper} options={['house', 'gold']} />
        </>
      }
    >
      <Confetti
        ref={confetti}
        field={field}
        emitter={emitter}
        count={count}
        duration={duration}
        style={paper === 'gold' ? GOLD_FOIL : undefined}
      />
      <div style={{ ...COLUMN, alignItems: 'center', gap: 'var(--space-4)' }}>
        <Button size="lg" onClick={() => confetti.current?.fire()}>
          Celebrate
        </Button>
        <div style={ROW}>
          <Button size="sm" variant="secondary" onClick={() => confetti.current?.fire({ duration: 0, count: 220 })}>
            One shove
          </Button>
          <Button size="sm" variant="secondary" onClick={() => confetti.current?.fire({ duration: 2.5, count: 300 })}>
            Taper over 2.5s
          </Button>
          <Button size="sm" variant="ghost" onClick={() => confetti.current?.clear()}>
            Clear
          </Button>
        </div>
      </div>
    </Playground>
  );
}
