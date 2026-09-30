'use client';

import { useState, type CSSProperties } from 'react';

import { ScrollArea, type ScrollAreaProps } from '@zyncat/ui/scroll-area';

import { KnobSegment, KnobSwitch, Playground } from '../playground';

type Axis = NonNullable<ScrollAreaProps['axis']>;
type Variant = NonNullable<ScrollAreaProps['variant']>;

const FILMS = [
  'Night Harbor',
  'Glass Orchard',
  'The Long Tide',
  'Paper Moons',
  'Salt & Signal',
  'North of Nowhere',
  'Quiet Engines',
  'Low Orbit',
  'Amber Hours',
  'The Cartographer',
  'Static Bloom',
  'Under Lanterns',
];

const EVENTS = ['Post published', 'Comment replied', 'Draft scheduled', 'Media uploaded', 'Campaign paused'];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const day: CSSProperties = {
  flex: 1,
  minWidth: 140,
  padding: 'var(--space-3)',
  border: 'var(--border-hairline) solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-subtle)',
  font: 'var(--type-label)',
  color: 'var(--text-strong)',
};

const poster = (i: number): CSSProperties => ({
  display: 'flex',
  alignItems: 'flex-end',
  width: 128,
  aspectRatio: '2 / 3',
  padding: 'var(--space-3)',
  border: 'var(--border-hairline) solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  background: `linear-gradient(to top, color-mix(in oklab, var(--accent) ${16 + (i % 5) * 12}%, var(--bg-muted)), var(--bg-subtle))`,
  font: 'var(--type-label)',
  color: 'var(--text-strong)',
  textAlign: 'left',
  cursor: 'pointer',
});

const row: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: 'var(--space-3) var(--space-2)',
  borderBottom: 'var(--border-hairline) solid var(--border-subtle)',
  font: 'var(--type-label)',
  color: 'var(--text-body)',
};

export function ScrollAreaPlayground() {
  const [axis, setAxis] = useState<Axis>('x');
  const [variant, setVariant] = useState<Variant>('fade');
  const [fill, setFill] = useState(false);

  const code =
    axis === 'x' && fill
      ? `<ScrollArea axis="x" fill variant="${variant}" ariaLabel="Week" style={{ height: 160 }}>
  {days.map((day) => (
    <Day key={day.id} day={day} style={{ flex: 1, minWidth: 140 }} />
  ))}
</ScrollArea>`
      : axis === 'x'
        ? `<ScrollArea axis="x" variant="${variant}" ariaLabel="Trending now">
  {films.map((film) => (
    <Poster key={film.id} film={film} />
  ))}
</ScrollArea>`
        : `<ScrollArea variant="${variant}" ariaLabel="Activity" style={{ height: 300 }}>
  {events.map((event) => (
    <Row key={event.id} event={event} />
  ))}
</ScrollArea>`;

  return (
    <Playground
      code={code}
      layout="under"
      note="No scrollbar: an edge fades only while content hides past it. Hover a faded rail edge for its door."
      rail={
        <>
          <KnobSegment label="axis" value={axis} onChange={setAxis} options={['x', 'y']} />
          <KnobSegment label="variant" value={variant} onChange={setVariant} options={['fade', 'depth']} />
          {axis === 'x' && <KnobSwitch label="fill" checked={fill} onChange={setFill} />}
        </>
      }
    >
      {axis === 'x' ? (
        <ScrollArea
          axis="x"
          variant={variant}
          fill={fill}
          ariaLabel={fill ? 'Week' : 'Trending now'}
          style={{ width: '100%', height: fill ? 160 : undefined }}
        >
          {fill
            ? DAYS.map((d) => (
                <div key={d} style={day}>
                  {d}
                </div>
              ))
            : FILMS.map((title, i) => (
                <button key={title} type="button" style={poster(i)}>
                  {title}
                </button>
              ))}
        </ScrollArea>
      ) : (
        <ScrollArea variant={variant} ariaLabel="Activity" style={{ width: '100%', maxWidth: 360, height: 300 }}>
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} style={row}>
              <span>{EVENTS[i % EVENTS.length]}</span>
              <span style={{ font: 'var(--type-caption)', color: 'var(--text-subtle)' }}>{`${i + 2}m ago`}</span>
            </div>
          ))}
        </ScrollArea>
      )}
    </Playground>
  );
}
