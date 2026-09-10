# Dropdown - @zyncat/ui/dropdown

Group: overlays
Docs: https://ui.zyncat.app/dropdown

Menu button - a list of ACTIONS the trigger commits, with submenus.

NOT a Select: it runs a command instead of holding a form value. items takes DropdownItem[] or
DropdownGroup[] (labelled sections); a row with its own items opens a submenu, nesting as deep as
you like. content on a row opens your own panel body in place of a submenu; selected marks the
current value of a single-choice group with a check. Keyboard is the APG menu button: arrows move,
Right/Left open and close a submenu, Enter/Space commit, typeahead, Esc one level, Tab the lot.
size sm|md|lg sets the vertical padding of every row, submenus included; weight sets the label
weight regular|medium|semibold.
highlight neutral|accent picks the hue of the highlight travelling between rows; rail adds a short
accent bar on its leading edge. returnFocus false leaves focus where a committing row put it.

```tsx
<Dropdown trigger={<Button variant="secondary">Actions</Button>} onSelect={(id) => run(id)} items={[
  { id: 'rename', label: 'Rename', shortcut: 'R' },
  { id: 'move', label: 'Move to', items: [{ id: 'drafts', label: 'Drafts', selected: true }] },
  { id: 'delete', label: 'Delete', danger: true }]} />
<Dropdown open={o} onOpenChange={setO} side="top" align="end" ariaLabel="Row actions" trigger={<Button>...</Button>} items={groups} />
```
