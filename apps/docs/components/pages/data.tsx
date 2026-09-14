'use client';

import { useState } from 'react';

import { Avatar, type AvatarShape, type AvatarSize, type AvatarStatus } from '@zyncat/ui/avatar';
import { Badge } from '@zyncat/ui/badge';
import { Pagination } from '@zyncat/ui/pagination';
import { Table, type TableColumn, type TableProps } from '@zyncat/ui/table';
import { Tag, TagGroup, type TagProps } from '@zyncat/ui/tag';

import { Icon } from '../icon';
import { KnobSegment, KnobSwitch, Playground } from '../playground';

type TagSize = NonNullable<TagProps['size']>;
type AvatarStatusKnob = AvatarStatus | 'none';

const AVATAR_SHAPES: readonly AvatarShape[] = ['circle', 'square'];
const AVATAR_SIZES: readonly AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const AVATAR_STATUSES: readonly AvatarStatusKnob[] = ['none', 'online', 'away', 'busy', 'offline'];
const TAG_SIZES: readonly TagSize[] = ['md', 'sm'];

export function AvatarPlayground() {
  const [shape, setShape] = useState<AvatarShape>('circle');
  const [size, setSize] = useState<AvatarSize>('lg');
  const [status, setStatus] = useState<AvatarStatusKnob>('online');

  const dot = status === 'none' ? null : status;

  const code = `<Avatar
  src={photo}
  name="Ana Ng"
  shape="${shape}"
  size="${size}"
  status=${dot ? `"${dot}"` : '{null}'}
/>`;

  return (
    <Playground
      code={code}
      note="square is the channel / brand-page mark; circle is for people."
      rail={
        <>
          <KnobSegment label="shape" value={shape} onChange={setShape} options={AVATAR_SHAPES} />
          <KnobSegment label="size" value={size} onChange={setSize} options={AVATAR_SIZES} />
          <KnobSegment label="status" value={status} onChange={setStatus} options={AVATAR_STATUSES} />
        </>
      }
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Avatar src="https://i.pravatar.cc/96?img=47" name="Ana Ng" shape={shape} size={size} status={dot} />
        <Avatar name="Bo Park" paletteIndex={5} shape={shape} size={size} status={dot} />
        <Avatar name="Dee Okafor" paletteIndex={2} shape={shape} size={size} status={dot} />
      </div>
    </Playground>
  );
}

const INITIAL_LABELS = [
  { id: 'a', name: 'design', icon: <Icon name="hash" /> },
  { id: 'b', name: 'frontend', icon: <Icon name="hash" /> },
  { id: 'c', name: 'urgent', icon: <Icon name="hash" /> },
];

export function TagPlayground() {
  const [size, setSize] = useState<TagSize>('md');
  const [labels, setLabels] = useState(INITIAL_LABELS);

  const code = `<TagGroup ariaLabel="Labels">
  {labels.map((l) => (
    <Tag key={l.id} icon={l.icon} size="${size}" onRemove={() => remove(l.id)}>
      {l.name}
    </Tag>
  ))}
</TagGroup>`;

  return (
    <Playground
      code={code}
      note="sm is the dense row height - 24px against the default 28px."
      rail={<KnobSegment label="size" value={size} onChange={setSize} options={TAG_SIZES} />}
    >
      <TagGroup ariaLabel="Labels">
        {labels.map((l) => (
          <Tag
            key={l.id}
            icon={l.icon}
            size={size}
            onRemove={() => setLabels((arr) => arr.filter((x) => x.id !== l.id))}
          >
            {l.name}
          </Tag>
        ))}
      </TagGroup>
    </Playground>
  );
}

interface PostRow {
  id: string;
  title: string;
  channel: string;
  status: 'Published' | 'Scheduled' | 'Draft';
  engagement: number;
}

const ROWS: PostRow[] = [
  { id: '1', title: 'React 19 Release Highlights', channel: 'Twitter', status: 'Published', engagement: 4230 },
  { id: '2', title: 'Design Tokens Architecture', channel: 'LinkedIn', status: 'Published', engagement: 1890 },
  { id: '3', title: 'WAAPI Motion Deep Dive', channel: 'Twitter', status: 'Scheduled', engagement: 0 },
  { id: '4', title: 'Q3 Product Roadmap Preview', channel: 'Newsletter', status: 'Draft', engagement: 0 },
  { id: '5', title: 'Closed Token Vocabulary, Explained', channel: 'LinkedIn', status: 'Published', engagement: 3110 },
  { id: '6', title: 'Shipping the Emoji Picker', channel: 'Twitter', status: 'Scheduled', engagement: 0 },
];

const COLUMNS: TableColumn<PostRow>[] = [
  { key: 'title', label: 'Post Title', render: (r: PostRow) => <strong>{r.title}</strong>, sortable: true },
  { key: 'channel', label: 'Channel', render: (r: PostRow) => r.channel },
  {
    key: 'status',
    label: 'Status',
    render: (r: PostRow) => (
      <Badge
        value={r.status}
        tone={r.status === 'Published' ? 'success' : r.status === 'Scheduled' ? 'info' : 'warning'}
      />
    ),
  },
  {
    key: 'engagement',
    label: 'Impressions',
    render: (r: PostRow) => (r.engagement ? r.engagement.toLocaleString() : '—'),
    align: 'end',
    sortable: true,
  },
];

type TableDensity = NonNullable<TableProps<PostRow>['density']>;

export function TablePlayground() {
  const [selectable, setSelectable] = useState(true);
  const [density, setDensity] = useState<TableDensity>('cozy');
  const [loading, setLoading] = useState(false);

  const code = `<Table
  rows={rows}
  columns={columns}
  rowKey="id"
  selectable={${selectable}}
  density="${density}"
  loading={${loading}}
/>`;

  return (
    <Playground
      code={code}
      stage="fill"
      note="Sort by Post Title or Impressions - the header carets are real buttons."
      rail={
        <>
          <KnobSegment label="density" value={density} onChange={setDensity} options={['cozy', 'compact']} />
          <KnobSwitch label="selectable" checked={selectable} onChange={setSelectable} />
          <KnobSwitch label="loading" checked={loading} onChange={setLoading} />
        </>
      }
    >
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <Table rows={ROWS} columns={COLUMNS} rowKey="id" selectable={selectable} density={density} loading={loading} />
      </div>
    </Playground>
  );
}

export function PaginationHero() {
  const [offset, setOffset] = useState(0);
  const pageSize = 10;
  const total = 94;
  return (
    <Pagination
      range={[offset + 1, Math.min(offset + pageSize, total)]}
      total={total}
      hasPrev={offset > 0}
      hasNext={offset + pageSize < total}
      onPrev={() => setOffset((o) => Math.max(0, o - pageSize))}
      onNext={() => setOffset((o) => o + pageSize)}
    />
  );
}
