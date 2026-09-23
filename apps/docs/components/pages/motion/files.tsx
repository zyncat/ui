'use client';

import { useState } from 'react';

import { Button } from '@zyncat/ui/button';
import { Motion } from '@zyncat/ui/motion';

import './files.css';

import { Playground } from '../../playground';
import { useLayoutKnobs } from './knobs';

const FILES = [
  { id: 'brief', name: 'Launch brief', kind: 'PDF', size: 2.4 },
  { id: 'review', name: 'Q3 review', kind: 'KEY', size: 18.2 },
  { id: 'logo', name: 'Logo final', kind: 'SVG', size: 0.3 },
  { id: 'notes', name: 'Interview notes', kind: 'MD', size: 0.1 },
  { id: 'teaser', name: 'Teaser cut', kind: 'MP4', size: 94.6 },
  { id: 'budget', name: 'Budget 2027', kind: 'XLS', size: 1.2 },
];

type Entry = (typeof FILES)[number];

const ORDER = {
  name: (a: Entry, b: Entry) => a.name.localeCompare(b.name),
  size: (a: Entry, b: Entry) => b.size - a.size,
};

const CODE = `<div className={view === 'grid' ? 'files files--grid' : 'files files--list'}>
  {files.map((file) => (
    <Motion key={file.id} layout className="file">
      <span className="file__kind">{file.kind}</span>
      <span className="file__name">{file.name}</span>
      <span className="file__size">{file.size} MB</span>
    </Motion>
  ))}
</div>`;

export function FilesDemo() {
  const { tuning, rail } = useLayoutKnobs();
  const [sort, setSort] = useState<keyof typeof ORDER>('name');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const files = [...FILES].sort(ORDER[sort]);

  return (
    <Playground
      code={CODE}
      rail={rail}
      layout="under"
      note="Sorting only moves the cards. Switching the view moves and resizes all six at once."
    >
      <div className="ml-files">
        <div className="ml-files__bar">
          <span className="ml-files__title">Shared with me</span>
          <Button variant="secondary" size="sm" onClick={() => setSort(sort === 'name' ? 'size' : 'name')}>
            Sort by {sort === 'name' ? 'size' : 'name'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setView(view === 'grid' ? 'list' : 'grid')}>
            {view === 'grid' ? 'List' : 'Grid'} view
          </Button>
        </div>
        <div className={`ml-files__items ml-files__items--${view}`}>
          {files.map((file) => (
            <Motion key={file.id} layout layoutTransition={tuning} className="ml-file">
              <span className="ml-file__kind">{file.kind}</span>
              <span className="ml-file__name">{file.name}</span>
              <span className="ml-file__size">{file.size} MB</span>
            </Motion>
          ))}
        </div>
      </div>
    </Playground>
  );
}
