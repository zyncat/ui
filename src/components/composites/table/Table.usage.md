# Table - @zyncat/ui/table

Group: data-display
Docs: https://ui.zyncat.app/table

Declare columns + rows; owns sort, selection, stickiness, overflow.

columns: TableColumn<T>[] ({ key, label, render?, sortable?, sortBy?, align?, mono?, strong?, grow?,
width? }); selectable, defaultSort, footer. width: '30%' gives a column that share of the table, and a
grow column takes what the shares leave.

renderDetail(row) unfolds a full-width row under its row, from a trailing caret or a click on the
row; a null return leaves that row without one. expanded + onExpandedChange control which rows are
open, and expandMode="single" keeps one open at a time. A click on a link, button, field or label in
a cell stays with it, never toggling the row or firing onRowClick. Hover is one pill gliding
between rows.

```tsx
<Table<Invoice>
  ariaLabel="Invoices"
  columns={COLUMNS}
  rows={INVOICES}
  selectable
  defaultSort={{ key: 'amount', dir: 'desc' }}
/>
```

```tsx
<Table<Member>
  ariaLabel="Team"
  columns={COLUMNS}
  rows={members}
  expandMode="single"
  renderDetail={(member) => (canManage ? <MemberAccess {...member} /> : null)}
/>
```
