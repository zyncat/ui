# Select - @zyncat/ui/select

Group: forms
Docs: https://ui.zyncat.app/select

Single-select listbox in a popover, searchable; holds value: string | null.

options: SelectOption[]; value: string|null, onChange(value); searchable, leadingIcon, placeholder,
invalid, loading, ariaLabel. size sets the trigger height and the row padding in the menu together; weight sets the option
label weight regular|medium|semibold.
highlight neutral|accent picks the hue of the highlight travelling
between options; rail adds a short accent bar on its leading edge.
trigger replaces the built-in combobox with your own element - a node, or a function of
{ open, selected } where selected is the SelectOption or null. It is cloned with the full wiring -
role, aria-expanded/controls/activedescendant, open/close, arrow keys - and becomes the anchor the
menu measures, so it must render ONE focusable element that forwards its props and its ref (a Button
does; a plain div is not focusable). placeholder, leadingIcon and triggerProps then stop applying and
the root drops its width: 100%, leaving the trigger its intrinsic width; size still drives the menu,
loading still blocks opening, disabled still makes it inert with aria-disabled.

```tsx
<Select
  options={TIMEZONES}
  value={tz}
  onChange={setTz}
  searchable
  placeholder="Choose a time zone"
  ariaLabel="Time zone"
/>
<Select options={TIMEZONES} value={tz} onChange={setTz} ariaLabel="Time zone" trigger={({ open, selected }) => (
  <Button variant="secondary" data-open={open || undefined}>{selected?.label ?? 'Choose a time zone'}</Button>
)} />
```
