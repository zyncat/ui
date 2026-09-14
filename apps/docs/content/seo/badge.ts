import type { PageSeo } from './types';

const seo: PageSeo = {
  title: 'React Badge Component',
  description:
    'A React badge component for status chips, labels and counts: five tones, a soft, glass or outline surface, and one value prop that re-letters text and rolls digits whenever it changes.',
  keywords: [
    'badge',
    'react badge',
    'badge component',
    'react badge component',
    'pill badge',
    'badge ui',
    'label chip',
    'status badge',
    'react status badge',
    'status indicator',
    'react status indicator',
    'status label',
    'status pill',
    'status chip',
    'count badge',
    'react count badge',
    'notification badge',
    'unread count badge',
    'badge counter',
    'notification count',
    'cart count badge',
  ],
  lede: 'A React badge component - toned status chips with a dot, icon or pill shape. One chip, one value: a label, a status or a count, animated whenever it changes.',
  faq: [
    {
      q: 'What does the tone prop control on a badge?',
      a: "tone sets the chip's color semantics - neutral, info, success, warning or danger - and defaults to neutral. Pair it with variant, size, dot, live, pill and icon to compose the chip; value is the content.",
    },
    {
      q: 'How do I add a leading icon or status dot?',
      a: 'Pass a node to icon for a leading icon, or set dot for a plain status dot instead. live pulses that dot for an in-progress state and implies dot on its own - icon takes priority, so if both are set the dot is not rendered.',
    },
    {
      q: "What's the difference between the soft, glass and outline variants?",
      a: 'variant defaults to \'soft\': a flat toned fill with no border, shadow or hover, so the chip reads as a label rather than a control. variant="glass" gives it the translucent, interactive glass surface, and variant="outline" a flat bordered chip.',
    },
    {
      q: 'How do I make a badge pill-shaped or smaller?',
      a: 'pill switches the chip to a fully-rounded shape. size="sm" is a 20px chip against the default 24px - the same type and side padding, tightened vertically for table rows and inline use.',
    },
    {
      q: 'How do I show a status in a badge?',
      a: 'Put the status in value and pick the tone for it: <Badge value="Published" tone="success" dot />. There is no fixed status vocabulary - your states, your wording, your mapping - and changing value animates the chip into its new state.',
    },
    {
      q: 'How do I animate a status change instead of swapping the label abruptly?',
      a: 'It is the default. Change value and the old word slides out while the new one slides in, with the chip resizing to fit. Pass animate="none" if you want the label to replace itself on the next render instead.',
    },
    {
      q: 'Is there a visual effect when a status reaches its final state?',
      a: "Set glint. Every time value changes, a one-off sheen sweeps across the chip - render it conditionally, glint={status === 'published'}, to reserve the effect for the state that has landed.",
    },
    {
      q: 'How do I show a numeric count in a badge?',
      a: 'Pass a number to value: <Badge value={12} />. A numeric value is set mono and tabular and rolls its digits on change, and every other Badge prop still applies. A pre-formatted figure is a string, so pair it with animate="roll" - <Badge value="7 / 10" animate="roll" />.',
    },
    {
      q: 'How do I animate the count when it changes, like an odometer?',
      a: 'It is the default for a numeric value. Each digit is its own column that slides vertically to the new figure; non-digit characters such as a slash or a space stay fixed in place. Pass animate="none" for plain text.',
    },
    {
      q: 'Why do the digits not shift width as the count changes?',
      a: "A chip holding a figure renders in a monospace font with tabular figures, so every digit takes the same width and a count going from 9 to 10 doesn't jiggle the surrounding layout. Text values stay in the body font - the mono treatment is reserved for figures.",
    },
  ],
};

export default seo;
