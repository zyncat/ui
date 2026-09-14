'use client';

import { useEffect, useRef, useState } from 'react';

import { Badge, type BadgeAnimation, type BadgeProps, type BadgeTone } from '@zyncat/ui/badge';
import { Button, type ButtonProps } from '@zyncat/ui/button';
import { Collapse, type CollapseProps } from '@zyncat/ui/collapse';
import { Spinner, type SpinnerProps } from '@zyncat/ui/spinner';

import { Icon, type IconProps } from '../icon';
import { KnobSegment, Playground } from '../playground';

type ButtonVariant = NonNullable<ButtonProps['variant']>;
type ButtonSize = NonNullable<ButtonProps['size']>;
type IconSize = NonNullable<IconProps['size']>;
type IconWeight = NonNullable<IconProps['weight']>;
type CollapseAxis = NonNullable<CollapseProps['axis']>;
type BadgeVariant = NonNullable<BadgeProps['variant']>;
type BadgeSize = NonNullable<BadgeProps['size']>;
type SpinnerVariant = NonNullable<SpinnerProps['variant']>;
type SpinnerSize = NonNullable<SpinnerProps['size']>;
type SpinnerThickness = NonNullable<SpinnerProps['thickness']>;

const BUTTON_VARIANTS: readonly ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger', 'link'];
const BUTTON_SIZES: readonly ButtonSize[] = ['sm', 'md', 'lg', 'icon'];
const ICON_SIZES: readonly IconSize[] = ['sm', 'md', 'lg'];
const ICON_WEIGHTS: readonly IconWeight[] = ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'];
const BADGE_TONES: readonly BadgeTone[] = ['neutral', 'info', 'success', 'warning', 'danger'];
const BADGE_VARIANTS: readonly BadgeVariant[] = ['soft', 'glass', 'outline'];
const BADGE_SIZES: readonly BadgeSize[] = ['sm', 'md'];
const BADGE_ANIMATIONS: readonly BadgeAnimation[] = ['auto', 'roll', 'morph', 'none'];

const SPINNER_VARIANTS: readonly SpinnerVariant[] = ['arc', 'dots', 'pulse'];
const SPINNER_SIZES: readonly SpinnerSize[] = ['inherit', 'sm', 'md', 'lg'];
const SPINNER_THICKNESS: readonly SpinnerThickness[] = ['thin', 'regular', 'bold'];

const DEMO_REQUEST_MS = 2000;

export function ButtonPlayground() {
  const [variant, setVariant] = useState<ButtonVariant>('primary');
  const [size, setSize] = useState<ButtonSize>('md');
  const [scheduling, setScheduling] = useState(false);
  const requestRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(requestRef.current), []);

  const schedule = () => {
    setScheduling(true);
    requestRef.current = setTimeout(() => setScheduling(false), DEMO_REQUEST_MS);
  };

  const code =
    size === 'icon'
      ? `<Button variant="${variant}" size="icon" loading={scheduling} onClick={schedule} aria-label="Schedule post">\n  <span className="zc-btn__icon">\n    <PlusIcon />\n  </span>\n</Button>`
      : `<Button variant="${variant}" size="${size}" loading={scheduling} onClick={schedule}>\n  Schedule post\n</Button>`;

  return (
    <Playground
      code={code}
      note="Press it to watch the loading state - it holds for two seconds, then returns. The label stays mounted but invisible, so the button never changes width."
      rail={
        <>
          <KnobSegment label="variant" value={variant} onChange={setVariant} options={BUTTON_VARIANTS} />
          <KnobSegment label="size" value={size} onChange={setSize} options={BUTTON_SIZES} />
        </>
      }
    >
      <Button
        variant={variant}
        size={size}
        loading={scheduling}
        onClick={schedule}
        aria-label={size === 'icon' ? 'Schedule post' : undefined}
      >
        {size === 'icon' ? (
          <span className="zc-btn__icon">
            <Icon name="plus" size="sm" />
          </span>
        ) : (
          'Schedule post'
        )}
      </Button>
    </Playground>
  );
}

export function IconPlayground() {
  const [size, setSize] = useState<IconSize>('lg');
  const [weight, setWeight] = useState<IconWeight>('regular');

  const code = `<Icon name="heart" size="${size}" weight="${weight}" />`;

  return (
    <Playground
      code={code}
      rail={
        <>
          <KnobSegment label="size" value={size} onChange={setSize} options={ICON_SIZES} />
          <KnobSegment label="weight" value={weight} onChange={setWeight} options={ICON_WEIGHTS} />
        </>
      }
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Icon name="lightning" size={size} weight={weight} />
        <Icon name="star" size={size} weight={weight} />
        <Icon name="heart" size={size} weight={weight} />
      </div>
    </Playground>
  );
}

export function CollapsePlayground() {
  const [axis, setAxis] = useState<CollapseAxis>('height');
  const [open, setOpen] = useState(true);

  const code = `<Collapse open={open} axis="${axis}">
  <div>This region eases open and closed.</div>
</Collapse>`;

  const vertical = axis === 'height';

  return (
    <Playground
      code={code}
      note="The width axis animates the inline size instead, so the region opens sideways out of the trigger."
      rail={<KnobSegment label="axis" value={axis} onChange={setAxis} options={['height', 'width']} />}
    >
      <div
        style={{
          width: '100%',
          maxWidth: vertical ? 360 : '100%',
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          alignItems: vertical ? 'stretch' : 'center',
          gap: '12px',
        }}
      >
        <Button variant="secondary" size="sm" onClick={() => setOpen((o) => !o)}>
          {open ? 'Close region' : 'Open region'}
        </Button>
        <Collapse open={open} axis={axis}>
          <div
            style={{
              padding: vertical ? '8px 0' : '0 4px',
              color: 'var(--text-muted)',
              whiteSpace: vertical ? undefined : 'nowrap',
            }}
          >
            {vertical
              ? 'This region eases open and closed with WAAPI motion on the grid track — never touches height: auto.'
              : 'The same track, animated sideways.'}
          </div>
        </Collapse>
      </div>
    </Playground>
  );
}

const BADGE_KINDS = ['text', 'number'] as const;
type BadgeKind = (typeof BADGE_KINDS)[number];
const BADGE_LABELS = ['Queued', 'Processing', 'Published', 'Failed'];

export function BadgePlayground() {
  const [kind, setKind] = useState<BadgeKind>('text');
  const [step, setStep] = useState(2);
  const [count, setCount] = useState(12);
  const [animate, setAnimate] = useState<BadgeAnimation>('auto');
  const [tone, setTone] = useState<BadgeTone>('info');
  const [variant, setVariant] = useState<BadgeVariant>('soft');
  const [size, setSize] = useState<BadgeSize>('md');

  const value = kind === 'number' ? count : BADGE_LABELS[step % BADGE_LABELS.length];
  const literal = kind === 'number' ? `{${count}}` : `"${value}"`;
  const code = `<Badge value=${literal} tone="${tone}" variant="${variant}" size="${size}" />`;

  return (
    <Playground
      code={code}
      note="One chip, one value. Change it and the chip animates itself - digits roll, words re-letter in place. There is nothing to wire up."
      rail={
        <>
          <KnobSegment label="value" value={kind} onChange={setKind} options={BADGE_KINDS} />
          <KnobSegment label="animate" value={animate} onChange={setAnimate} options={BADGE_ANIMATIONS} />
          <KnobSegment label="tone" value={tone} onChange={setTone} options={BADGE_TONES} />
          <KnobSegment label="variant" value={variant} onChange={setVariant} options={BADGE_VARIANTS} />
          <KnobSegment label="size" value={size} onChange={setSize} options={BADGE_SIZES} />
        </>
      }
    >
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <Badge value={value} animate={animate} tone={tone} variant={variant} size={size} glint />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => (kind === 'number' ? setCount((c) => c + 1) : setStep((s) => s + 1))}
        >
          Change value
        </Button>
      </div>
    </Playground>
  );
}

export function SpinnerPlayground() {
  const [variant, setVariant] = useState<SpinnerVariant>('arc');
  const [size, setSize] = useState<SpinnerSize>('lg');
  const [thickness, setThickness] = useState<SpinnerThickness>('regular');

  const code = `<Spinner variant="${variant}" size="${size}" thickness="${thickness}" />`;

  return (
    <Playground
      code={code}
      note="size inherit draws at 1em, so it matches whatever text it sits beside; the named sizes are type tokens. thickness scales with the diameter."
      rail={
        <>
          <KnobSegment label="variant" value={variant} onChange={setVariant} options={SPINNER_VARIANTS} />
          <KnobSegment label="size" value={size} onChange={setSize} options={SPINNER_SIZES} />
          <KnobSegment label="thickness" value={thickness} onChange={setThickness} options={SPINNER_THICKNESS} />
        </>
      }
    >
      <div style={{ display: 'flex', gap: '28px', alignItems: 'center', color: 'var(--text-accent)' }}>
        <Spinner variant={variant} size={size} thickness={thickness} />
        <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)' }}>
          <Spinner variant={variant} thickness={thickness} label={null} />
          Inherits the line it sits on
        </span>
      </div>
    </Playground>
  );
}
