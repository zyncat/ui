# MultiSelect - @zyncat/ui/multi-select

Group: forms
Docs: https://ui.zyncat.app/multi-select

Many-of listbox; stays open while toggling, trigger summarises as first +N.

value: string[], onChange(string[]); searchable. highlight neutral|accent picks the hue of the
highlight travelling between options; rail adds a short accent bar on its leading edge.
trigger replaces the built-in combobox with your own element - a node, or a function of
{ open, selected } where selected is the SelectOption[] in option order. It is cloned with the full
wiring - role, aria-expanded/controls/activedescendant, open/close, arrow keys - and becomes the
anchor the menu measures, so it must render ONE focusable element that forwards its props and its ref
(a Button does; a plain div is not focusable). placeholder and leadingIcon then stop applying and the
root drops its width: 100%, leaving the trigger its intrinsic width; size still drives the menu,
loading still blocks opening, disabled still makes it inert with aria-disabled.

```tsx
<MultiSelect options={PEOPLE} value={ids} onChange={setIds} placeholder="Choose members" ariaLabel="Members" />
<MultiSelect options={PEOPLE} value={ids} onChange={setIds} ariaLabel="Members" trigger={({ selected }) => (
  <Button variant="secondary">{selected.length ? `${selected.length} members` : 'Members'}</Button>
)} />
```
