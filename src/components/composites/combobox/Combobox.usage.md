# Combobox - @zyncat/ui/combobox

Group: forms
Docs: https://ui.zyncat.app/combobox

Autocomplete for a text field you own - @mentions, slash commands, or the whole value. A pick only writes text: unlike Select, the value is whatever the field holds.

NOT a Select, which holds an option picked behind its own trigger button - searchable or not, the value is an
option. NOT a Dropdown, which runs commands. Wrap your own TextField, Textarea or plain input/textarea: it renders
unchanged in a display: contents wrapper, no ref or prop wiring. options takes Select's SelectOption[] or
SelectGroup[], both re-exported here. trigger (such as @ or /) completes one word mid-text: the list opens when the
trigger starts a word and hangs at the start of that word. Without one it completes the whole value from under
the field, opening as you type or on ArrowDown. The list never takes focus: while it is open, the arrows, Enter,
Tab and Escape are its keys and never reach the field's own onKeyDown, so an Enter-to-send handler stays quiet;
Shift+Enter and other modified keys pass. Enter or Tab picks the highlighted option, the first match until the
arrows move it; with a trigger Tab keeps focus in the field, without one it moves on as in a form. With no match,
Enter and Tab pass through. Escape closes the list, and with a trigger it stays shut for that word until a new
trigger is typed; moving the caret out of the word or blurring the field closes it too. A pick writes
insert(option) over the trigger and query through the browser's edit stack, so Ctrl+Z restores what was typed
and the field's onChange fires; onSelect(value, option) runs after. The filter matches the option's text and
description, and the default insert writes that text - searchText, else a string label, else value - so give a
node label a searchText. anchor caret|field picks where the list hangs (caret with a trigger, field without) and
width follows it; size, weight, highlight neutral|accent and rail style the list as on Select.

```tsx
<Combobox trigger="@" options={TEAMMATES} onSelect={addMention} ariaLabel="Teammates">
  <input value={message} placeholder="Message #launch" onChange={(e) => setMessage(e.target.value)} />
</Combobox>
<Combobox options={CITIES} ariaLabel="Cities">
  <input value={city} aria-label="City" onChange={(e) => setCity(e.target.value)} />
</Combobox>
```
