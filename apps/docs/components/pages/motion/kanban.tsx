'use client';

import { useState } from 'react';

import { Motion } from '@zyncat/ui/motion';

import './kanban.css';

import { Playground } from '../../playground';
import { useLayoutKnobs } from './knobs';

const COLUMNS = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'In progress' },
  { id: 'done', title: 'Done' },
] as const;

type Column = (typeof COLUMNS)[number]['id'];

const NEXT: Record<Column, Column> = { todo: 'doing', doing: 'done', done: 'todo' };

const START: { id: string; title: string; column: Column }[] = [
  { id: 'emails', title: 'Rewrite onboarding emails', column: 'todo' },
  { id: 'pricing', title: 'Pricing page A/B test', column: 'todo' },
  { id: 'export', title: 'CSV export for reports', column: 'todo' },
  { id: 'sso', title: 'SSO for enterprise plans', column: 'doing' },
  { id: 'dark', title: 'Dark mode', column: 'done' },
];

const CODE = `{columns.map((column) => (
  <section key={column.id}>
    {cards.filter((card) => card.column === column.id).map((card) => (
      <Motion key={card.id} as="button" layout layoutId={card.id} onClick={() => advance(card.id)}>
        {card.title}
      </Motion>
    ))}
  </section>
))}`;

export function KanbanDemo() {
  const { tuning, rail } = useLayoutKnobs(false);
  const [cards, setCards] = useState(START);

  const advance = (id: string) =>
    setCards((all) => [
      ...all.filter((card) => card.id !== id),
      ...all.filter((card) => card.id === id).map((card) => ({ ...card, column: NEXT[card.column] })),
    ]);

  return (
    <Playground
      code={CODE}
      rail={rail}
      layout="under"
      note="Click a card to move it on. It remounts under another column, so layoutId carries its box; layout closes the gap it leaves."
    >
      <div className="ml-board">
        {COLUMNS.map((column) => (
          <section key={column.id} className="ml-col" aria-label={column.title}>
            <h3 className="ml-col__title">{column.title}</h3>
            {cards
              .filter((card) => card.column === column.id)
              .map((card) => (
                <Motion
                  key={card.id}
                  as="button"
                  type="button"
                  layout
                  layoutId={`ml-card-${card.id}`}
                  layoutTransition={tuning}
                  className="ml-card"
                  onClick={() => advance(card.id)}
                >
                  {card.title}
                </Motion>
              ))}
          </section>
        ))}
      </div>
    </Playground>
  );
}
