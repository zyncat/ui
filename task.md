# Backlog

## Badge

### Done (awaiting review)

**Visual polish.**

- `variant: 'soft' | 'glass' | 'outline'`, default `soft` - a flat toned fill, no ring, no sheen, no
  shadow, no hover. `glass` and `outline` unchanged, now opt-in.
- Label type moved from `--font-code` to `--type-micro` (sans). Mono + tabular survives as
  `.zc-badge--num`, applied only when the chip holds a figure.
- Fill comes from the designed `--<hue>-subtle` roles (`--bg-muted` for neutral) instead of the 17%
  frosted `--glass-tint-*`.
- Radius `--radius-sm` -> `--radius-md` (4px -> 6px on a 24px chip).
- `sm` is a real size: 20px tall, same inline padding, same 4px gap. It used to be `md` with the
  block padding crushed to 1px and the gap collapsed to 1px, which glued the dot to the label.
- `position: relative; isolation: isolate` moved onto `.zc-badge` so the glint has a containing
  block in every variant, not just glass and outline.

**One component, one prop.** `StatusBadge` and `CountBadge` are deleted - not aliased, not
re-exported. `@zyncat/ui/status-badge` and `@zyncat/ui/count-badge` are out of the exports map, and
the `POST_STATUS` / `PostStatus` vocabulary is gone with them. 57 export entries, 54 public subpaths.

`Badge` takes one content prop, `value: string | number`, and animates itself when it changes.

```tsx
<Badge value="Published" tone="success" dot />
<Badge value={12} tone="info" />
<Badge value="1,024" animate="roll" pill />
```

- `animate: 'auto' | 'roll' | 'morph' | 'none'`, default `auto` - a number rolls its digits and
  renders mono and tabular, a string re-letters in place. Naming one overrides the type, which is
  what a pre-formatted figure like `"1,024"` needs. `'none'` is the single opt-out that replaced
  `morph={false}` and `roll={false}`.
- `glint` sweeps a sheen on every `value` change. It used to be hardwired to the `published` and
  `failed` presets and to ride on the morph; it is now a prop, works on a roll too, and lives in
  `use-glint-on-change.ts` instead of inside `MorphLabel`.
- No `children`, no `status`, no `count`, no precedence rules. `children` is omitted from
  `htmlProps` as well, so passing one is a type error rather than silently ignored.
- Files: `Badge.tsx` (101), `morph-label.tsx` (71), `digit-strip.tsx` (36),
  `use-glint-on-change.ts` (16).

**This is a breaking change** - two published subpaths and the `POST_STATUS` export disappear
at 0.20.0.

Cost, gzipped, measured by walking the real chunk graph in `dist/` on both sides. _Marginal_ is what
an app pays when it already imports Table, Toast or Collapse, which carry the `UIMotion`, `DigitStrip`
and `cx` chunks:

|                              | isolated | marginal |
| ---------------------------- | -------- | -------- |
| `badge` at HEAD (label only) | 2041     | 1874     |
| `status-badge` at HEAD       | 5050     | 2919     |
| `count-badge` at HEAD        | 3056     | 2065     |
| `badge` now (all three)      | 5539     | 2584     |

So the merged chip costs **+710 bytes gz** over the old label-only Badge in a real app, and replaces
two subpaths that cost 2919 and 2065 on their own. The 4.79 KB / 3.29 KB figures quoted earlier were
measured with inconsistent accounting - they left the CSS out on one side.

### Remaining

- `apps/docs/content/data.ts` table example passes `label="Scheduled posts"`; the prop is
  `ariaLabel`. `check usage` only lints `.usage.md` examples, so nothing catches it.

## Table

### 1. Correctness - blocks real apps

- **Sort cannot be externalised.** `sortedRows` always re-applies the local compare when `sort` is
  set. A consumer sorting on the server re-shuffles the returned page by `row[key]`, so a column the
  client cannot compute (status by enum weight, a server collation) renders in the wrong order.
  Needs a controlled `sort` prop and `sortMode: 'local' | 'external'`.
- **`onRowClick` is pointer-only.** The `<tr>` gets an `onClick` and nothing else - no `tabIndex`,
  no key handler. Keyboard users cannot open a row.
- **The bulk bar covers live controls.** It is `position: absolute; z-index: 4` over the header and
  nothing marks the header row inert, so Tab lands on invisible sort buttons and a second
  "Select all rows" checkbox. React 19 takes the `inert` attribute directly.
- **First load renders nothing.** `showEmpty` is `!loading && !rows.length`, so `loading` with an
  empty `rows` gives a header and a blank body. Needs skeleton rows.
- **Selection is never pruned.** Keys stay in the `Set` after their rows leave, so the bar keeps
  claiming "3 selected" after a parent-driven filter or refetch. `bulkActions` gets `clear`, which
  covers the delete path only. No `selectedKeys` prop either, so preselection is impossible.

### 2. Customization

- Column: `width` / `minWidth`, `wrap` (every cell is `white-space: nowrap` today),
  `headerRender`, `footer?: (rows) => ReactNode` for a `<tfoot>` aligned under its own column,
  `render(row, index)`, and `pin: 'start' | 'end'` alongside `pinFirst` so an actions column can
  stay put under horizontal overflow.
- Row: `rowProps(row)` for className / `data-*` / aria, a `tone` for danger and warning rows, and
  per-row `disabled` excluded from selection.
- Skin: `frame: 'card' | 'flush'` - the border, radius and shadow are baked in, so a table nested in
  a consumer's own panel draws a double frame. Plus `rules: 'rows' | 'grid' | 'none'` and `zebra`.

### 3. One headline variant

- **Expandable rows** (first): `expandable` + `renderDetail(row)`, the detail row driven by the
  `Collapse` machinery, with the sibling rows' FLIP already handling the reflow. Highest utility,
  zero new dependencies, and a real motion showcase.
- **`collapse="stack"`** (second): under the 30rem container query each row reflows into a labeled
  key/value card instead of `hideBelow` deleting the column.
- **`DataTable` compound** (later): Table + toolbar + column visibility + `Pagination`, wired. Wait
  until the column model above has settled - it is permanent public surface.

### Not doing

- Virtualization. Each row's `useFlip` measures twice per render (`lastCommitted` during render,
  then the layout effect), so a windowed list and the FLIP fight each other. That is a different
  component.
- Column resizing - drag handles plus persistence is a product feature.
- Multi-sort - `aria-sort` has no honest expression for it.

### Before any of it

`Table.tsx` is 390 lines against the 150-line rule. The seams: `use-table-sort.ts`,
`use-table-selection.ts`, `TableHead.tsx`, `TableBulkBar.tsx`, `TableRow.tsx`.
