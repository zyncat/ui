# Recipes - assembled @zyncat/ui patterns

Templates, not truth: they show which components compose and how state flows between them.
Before shipping one, run `get_component` on the parts you use - props here are the common subset,
not the full API of your installed version.

## Settings form

TextField + Select + Toggle + Button, submitted with a loading state and a toast.

```tsx
import { Button } from '@zyncat/ui/button';
import { Select } from '@zyncat/ui/select';
import { TextField } from '@zyncat/ui/text-field';
import { toast } from '@zyncat/ui/toast';
import { Toggle } from '@zyncat/ui/toggle';

function WorkspaceSettings() {
  const [name, setName] = useState('');
  const [tz, setTz] = useState<string | null>(null);
  const [autosave, setAutosave] = useState(true);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.save({ name, tz, autosave });
      toast.success('Settings saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <TextField id="ws" label="Workspace name" required value={name} onChange={(e) => setName(e.target.value)} />
      <Select
        options={TIMEZONES}
        value={tz}
        onChange={setTz}
        searchable
        placeholder="Choose a time zone"
        ariaLabel="Time zone"
      />
      <Toggle label="Auto-save drafts" checked={autosave} onChange={(e) => setAutosave(e.target.checked)} />
      <Button type="submit" loading={saving}>
        Save changes
      </Button>
    </form>
  );
}
```

## Data table page

ToggleTag filters above a sortable Table, a Pagination cursor strip below.

```tsx
import { Pagination } from '@zyncat/ui/pagination';
import { Table } from '@zyncat/ui/table';
import { ToggleTag } from '@zyncat/ui/toggle-tag';

<ToggleTag selected={onlyFailed} onChange={setOnlyFailed} count={counts.failed}>Failed</ToggleTag>
<Table<Invoice>
  ariaLabel="Invoices"
  columns={COLUMNS}
  rows={page.rows}
  selectable
  defaultSort={{ key: 'amount', dir: 'desc' }}
/>
<Pagination ariaLabel="Rows" range={[page.from, page.to]} total={page.total}
  hasPrev={page.from > 1} hasNext={page.to < page.total} onPrev={prev} onNext={next} />
```

## Destructive confirm

Dialog owns the modality; the danger action lives in its footer and reports back with a toast.

```tsx
import { Button } from '@zyncat/ui/button';
import { Dialog } from '@zyncat/ui/dialog';
import { toast } from '@zyncat/ui/toast';

<Dialog
  open={confirming}
  onOpenChange={setConfirming}
  tone="danger"
  title="Delete this project?"
  description="Every scheduled post in it is deleted with it."
  footer={(close) => (
    <>
      <Button variant="secondary" onClick={close}>
        Cancel
      </Button>
      <Button
        variant="danger"
        onClick={async () => {
          await api.remove(id);
          close();
          toast.success('Project deleted');
        }}
      >
        Delete project
      </Button>
    </>
  )}
>
  This cannot be undone.
</Dialog>;
```

## App-wide notifications

Mount `<Toaster />` once at the root; every module calls `toast()` - without the mount it no-ops.

```tsx
import { toast, Toaster } from '@zyncat/ui/toast';

// root layout, once:
<Toaster position="bottom-right" />;

// anywhere else:
toast.promise(publish(), {
  loading: 'Publishing...',
  success: (r) => `Published to ${r.count} channels`,
  error: (e) => `Publish failed - ${e.message}`,
});
```

## Detail drawer

Sheet for an edge-docked record view; you own the panel's semantics.

```tsx
import { Sheet } from '@zyncat/ui/sheet';

<Sheet side="right" open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
  <div role="dialog" aria-label="Invoice details">
    {selected && <InvoiceDetails id={selected} />}
  </div>
</Sheet>;
```

## Row actions menu

Dropdown runs commands - it never holds a value; pair it with an icon Button trigger.

```tsx
import { Button } from '@zyncat/ui/button';
import { Dropdown } from '@zyncat/ui/dropdown';

<Dropdown
  ariaLabel="Row actions"
  trigger={
    <Button size="sm" iconOnly variant="ghost" aria-label="Actions">
      …
    </Button>
  }
  onSelect={(id) => run(id)}
  items={[
    { id: 'rename', label: 'Rename' },
    { id: 'move', label: 'Move to', items: [{ id: 'drafts', label: 'Drafts' }] },
    { id: 'delete', label: 'Delete', danger: true },
  ]}
/>;
```
