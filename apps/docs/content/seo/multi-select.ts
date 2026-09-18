import type { PageSeo } from './types';

const multiSelect: PageSeo = {
  title: 'React Multiselect Dropdown with Checkboxes',
  description:
    'A React multi select dropdown with checkboxes - toggling keeps the menu open and the trigger reads first +N. Searchable, listbox a11y, zero dependencies.',
  keywords: [
    'multiselect dropdown',
    'multi select dropdown',
    'multiple select dropdown',
    'multi select',
    'multiselect',
    'select multiple',
    'multiselect dropdown with checkbox',
    'react multiselect',
    'html multi select',
    'dropdown multiselect',
    'multi-select',
    'react multi select',
    'dropdown multiple select',
    'multiple selection dropdown',
    'react multiselect dropdown',
  ],
  lede: 'A React multi select dropdown - check off several options, the menu stays open. For filters and pickers.',
  faq: [
    {
      q: 'How do I create a multi select dropdown in React?',
      a: 'Import it per subpath and pass the options plus the selected array: import { MultiSelect } from \'@zyncat/ui/multi-select\', then <MultiSelect options={CHANNELS} value={channels} onChange={setChannels} ariaLabel="Channels" searchable />. options takes a flat SelectOption[] or SelectGroup[] for labelled sections, value is the array of selected option values, and onChange fires with the next array plus the option that was toggled. Drop value and pass defaultValue instead to run it uncontrolled.',
    },
    {
      q: 'Does the menu close when I pick an option?',
      a: 'No - a multiple selection dropdown that shut on every pick would make you reopen it for each choice, so toggling a row leaves the menu open and onChange fires each time with the full next array. It closes on Escape, on Tab, or on a press outside the menu, and Escape returns focus to the trigger.',
    },
    {
      q: 'What does the trigger show when several options are selected?',
      a: 'The first selected option\'s label followed by a +N pill counting the rest, so three selections read "Design +2". One selection shows just that label, and its icon if the option carries one; none shows placeholder, which defaults to "Select options".',
    },
    {
      q: 'Can I add checkboxes and a search box to the multiselect dropdown?',
      a: "Both are built in. Every row draws a checkbox tick that tracks its aria-selected state, and searchable pins a type-to-filter field above the list which matches each option against its label and its description. searchPlaceholder sets that field's text; without searchable, typing into the open menu jumps to an option by prefix instead.",
    },
    {
      q: 'Why not just use an HTML multi select?',
      a: 'The native <select multiple> needs Ctrl or Cmd-click to add to a selection, renders as a scrolling box rather than a dropdown, and barely takes styling. This is a custom listbox instead: one click toggles a row, the menu stays put, and the size, highlight and rail props restyle it on top of the same design tokens as the rest of the library. It is MIT, needs no jQuery plugin and no Tailwind config, and ships zero runtime dependencies.',
    },
    {
      q: 'Can I replace the trigger with my own button?',
      a: 'Yes - trigger takes your own element, or a function receiving { open, selected } where selected is the full SelectOption[] in option order, so a trigger that reads "3 channels" instead of the first +N label is one line. The element is cloned with the combobox wiring - role, aria-expanded, aria-controls, aria-activedescendant, the arrow keys and the anchor the menu measures - so it must be one focusable element that forwards its props and its ref. placeholder and leadingIcon stop applying; the menu keeps its size, its filter field and its checkbox rows, and toggling a row still leaves it open.',
    },
    {
      q: 'Is the multi select keyboard and screen reader accessible?',
      a: 'Yes. The trigger is a role="combobox" button wired with aria-haspopup, aria-expanded, aria-controls and aria-activedescendant, the list is a role="listbox" with aria-multiselectable, and each row is a role="option" carrying aria-selected. Arrow keys move the active option, Home and End jump to the ends, Enter toggles it - so does Space, unless searchable has put the caret in the filter field - Escape closes and returns focus to the trigger, and disabled options are skipped by keyboard nav and typeahead alike.',
    },
  ],
};

export default multiSelect;
