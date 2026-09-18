import type { PageSeo } from './types';

const seo: PageSeo = {
  title: 'Searchable React Select Dropdown',
  description:
    'A searchable React select dropdown - a custom single-select combobox with a listbox menu, arrow-key typeahead and real ARIA wiring. No Tailwind, zero deps.',
  keywords: [
    'react select',
    'combobox',
    'combo box',
    'react select dropdown',
    'dropdown with search',
    'select box',
    'combobox ui',
    'react combobox',
    'select ui',
    'react select onchange',
    'aria combobox',
    'select component',
    'custom select dropdown',
    'select with search',
    'select js',
  ],
  lede: 'A React select component with a searchable listbox menu - for country, timezone and status pickers.',
  faq: [
    {
      q: 'How do I add a search box to a select dropdown?',
      a: 'Set the searchable prop - <Select searchable options={options} value={v} onChange={setV} /> pins a filter input above the list and narrows it as you type. The filter matches an option\'s label, its description and its searchText, searchPlaceholder changes the input placeholder, and an empty result reads "No matches for ...".',
    },
    {
      q: 'Is this a combobox or a listbox?',
      a: 'Both, in the roles ARIA gives them. The trigger is a button with role="combobox" carrying aria-haspopup="listbox", aria-expanded, aria-controls and aria-activedescendant, and the popover holds a role="listbox" whose rows are role="option" with aria-selected - so a screen reader announces the active option while the keyboard stays on the list, or on the filter input when searchable is on.',
    },
    {
      q: 'How do I style a select dropdown in React?',
      a: 'You cannot restyle a native <select> menu because the browser draws it, so this renders its own trigger and a portalled listbox you style like any other element. size takes sm, md or lg, highlight switches the travelling highlight between the neutral and accent wash, rail adds an accent bar on its leading edge, and htmlProps forwards className, style and data-* to the root.',
    },
    {
      q: 'How do I get the selected value?',
      a: 'Pass value and onChange: onChange(value, option) fires on commit with the value string and the full SelectOption, so <Select value={tz} onChange={setTz} options={TIMEZONES} /> is a controlled select. Omit value and pass defaultValue to let it hold its own state; either way, committing closes the menu and returns focus to the trigger.',
    },
    {
      q: 'Can I put icons on the options, or group them?',
      a: "Yes. Each SelectOption takes an icon node, a description line under the label, disabled and searchText, and passing SelectGroup[] instead of a flat array renders labelled sections. leadingIcon pins your own icon on the trigger; without it the trigger shows the selected option's icon.",
    },
    {
      q: 'Can I use my own button as the select trigger?',
      a: 'Yes - the trigger prop replaces the built-in one. Pass an element, <Select trigger={<Button>Filter</Button>} options={options} />, or a function of the selection state, trigger={({ open, selected }) => ...}, where selected is the full SelectOption or null. Your element is cloned with the whole combobox contract - role="combobox", aria-expanded, aria-controls, aria-activedescendant, the arrow keys, the open and close press, and the anchor the menu measures and matches its width to - so it has to render one focusable element that forwards its props and its ref. placeholder, leadingIcon and triggerProps stop applying once you supply one; size still sets the menu density, loading still blocks opening and disabled still makes it inert.',
    },
    {
      q: 'Which keys does it support, and does it run in Next.js?',
      a: "Arrow Down or Arrow Up opens it from the trigger; inside, the arrows, Home and End move the active option, Enter commits, Escape closes and returns focus, and Tab closes. With searchable off, Space commits and typing jumps to an option by prefix. It ships as compiled ESM with its 'use client' directive intact for the Next.js App Router, has zero runtime dependencies, and collapses every duration to 1ms under prefers-reduced-motion.",
    },
  ],
};

export default seo;
