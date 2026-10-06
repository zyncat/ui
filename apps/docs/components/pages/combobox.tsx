'use client';

import { useState } from 'react';

import { Combobox, type ComboboxProps } from '@zyncat/ui/combobox';
import { TextField } from '@zyncat/ui/text-field';
import { Textarea } from '@zyncat/ui/textarea';

import { KnobSegment, KnobSwitch, Playground } from '../playground';

type Field = 'mention' | 'whole';
type Anchor = NonNullable<ComboboxProps['anchor']>;
type Highlight = NonNullable<ComboboxProps['highlight']>;

const PEOPLE = [
  { value: 'maya', label: 'Maya Chen', description: 'Design' },
  { value: 'omar', label: 'Omar Haddad', description: 'Engineering' },
  { value: 'lena', label: 'Lena Park', description: 'Marketing' },
  { value: 'tomas', label: 'Tomás Silva', description: 'Support' },
  { value: 'priya', label: 'Priya Nair', description: 'Sales' },
];

const CITIES = [
  'Amsterdam',
  'Athens',
  'Austin',
  'Barcelona',
  'Berlin',
  'Lisbon',
  'London',
  'Madrid',
  'Paris',
  'Porto',
].map((city) => ({ value: city.toLowerCase(), label: city }));

const handle = (person: { value: string }) => '@' + person.value + ' ';

export function ComboboxPlayground() {
  const [field, setField] = useState<Field>('mention');
  const [anchor, setAnchor] = useState<Anchor>('caret');
  const [highlight, setHighlight] = useState<Highlight>('neutral');
  const [rail, setRail] = useState(false);
  const [note, setNote] = useState('');
  const [city, setCity] = useState('');

  const code =
    field === 'mention'
      ? `<Combobox
  trigger="@"
  options={people}
  insert={(person) => '@' + person.value + ' '}
  anchor="${anchor}"
  highlight="${highlight}"
  rail={${rail}}
>
  <Textarea label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
</Combobox>`
      : `<Combobox options={cities} highlight="${highlight}" rail={${rail}}>
  <TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} />
</Combobox>`;

  return (
    <Playground
      code={code}
      note="Focus stays in the field: the arrow keys walk the list, Enter or Tab picks, and undo puts the typed text back."
      rail={
        <>
          <KnobSegment label="field" value={field} onChange={setField} options={['mention', 'whole']} />
          {field === 'mention' && (
            <KnobSegment label="anchor" value={anchor} onChange={setAnchor} options={['caret', 'field']} />
          )}
          <KnobSegment label="highlight" value={highlight} onChange={setHighlight} options={['neutral', 'accent']} />
          <KnobSwitch label="rail" checked={rail} onChange={setRail} />
        </>
      }
    >
      <div style={{ width: '100%', maxWidth: 360 }}>
        {field === 'mention' ? (
          <Combobox
            trigger="@"
            options={PEOPLE}
            insert={handle}
            anchor={anchor}
            highlight={highlight}
            rail={rail}
            ariaLabel="Teammates"
          >
            <Textarea
              label="Note"
              placeholder="Type @ to mention a teammate"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Combobox>
        ) : (
          <Combobox options={CITIES} highlight={highlight} rail={rail} ariaLabel="Cities">
            <TextField
              label="City"
              placeholder="Start typing a city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </Combobox>
        )}
      </div>
    </Playground>
  );
}
