'use client';

import { useState } from 'react';

import { Motion } from '@zyncat/ui/motion';

import './inbox.css';

import { Playground } from '../../playground';
import { useLayoutKnobs } from './knobs';

const MAIL = [
  {
    id: 'contract',
    from: 'Maya Chen',
    subject: 'Contract signed',
    time: '9:41',
    body: 'The counter-signed copy is attached. Legal wants the kickoff moved to Thursday so finance can join. Does 10:00 still work for your team?',
  },
  {
    id: 'payout',
    from: 'Stripe',
    subject: 'Your payout is on the way',
    time: '8:02',
    body: '$4,820.00 lands in the account ending 4412 on Friday. The breakdown by product is in your dashboard.',
  },
  {
    id: 'comment',
    from: 'Leo Park',
    subject: 'Commented on Checkout v3',
    time: 'Mon',
    body: 'Can the order total sit above the fold on mobile? On a small phone it is two swipes down right now.',
  },
  {
    id: 'ci',
    from: 'GitHub',
    subject: 'All checks passed on main',
    time: 'Sun',
    body: '214 checks passed in 3m 12s. The preview deploy is live and the bundle shrank by 1.4 kB.',
  },
];

const CODE = `{mail.map((message) => (
  <Motion key={message.id} as="li" layout className="mail">
    <button aria-expanded={message.id === open} onClick={() => toggle(message.id)}>
      {message.from} {message.subject}
    </button>
    {message.id === open ? <p>{message.body}</p> : null}
  </Motion>
))}`;

export function InboxDemo() {
  const { tuning, rail } = useLayoutKnobs();
  const [open, setOpen] = useState<string | null>('payout');

  return (
    <Playground code={CODE} rail={rail} note="The opened row changes its own height and pushes every row below it.">
      <ul className="ml-inbox">
        {MAIL.map((message) => (
          <Motion key={message.id} as="li" layout layoutTransition={tuning} className="ml-mail">
            <button
              type="button"
              className="ml-mail__head"
              aria-expanded={message.id === open}
              onClick={() => setOpen(message.id === open ? null : message.id)}
            >
              <span className="ml-mail__from">{message.from}</span>
              <span className="ml-mail__time">{message.time}</span>
              <span className="ml-mail__subject">{message.subject}</span>
            </button>
            {message.id === open ? <p className="ml-mail__body">{message.body}</p> : null}
          </Motion>
        ))}
      </ul>
    </Playground>
  );
}
