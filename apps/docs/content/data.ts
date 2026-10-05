import type { ComponentDoc } from './types';

export const data: Record<string, ComponentDoc> = {
  avatar: {
    example: `import { Avatar } from '@zyncat/ui/avatar';
import { AvatarGroup } from '@zyncat/ui/avatar-group';

// Single avatar with presence dot
<Avatar name="Sara Osei" src="/avatars/sara.jpg" size="md" status="online" />

// Square shape for a channel page
<Avatar name="Acme Brand" shape="square" size="lg" />

// AvatarGroup - overlapping stack with +N overflow (uses the same Avatar children)
<AvatarGroup max={4} size="sm">
  <Avatar name="Sara Osei" />
  <Avatar name="Kwame Asante" status="away" />
  <Avatar name="Lena Brandt" />
  <Avatar name="Omar Diallo" />
  <Avatar name="Hina Sato" />
</AvatarGroup>`,
  },

  tag: {
    example: `import { Tag, TagGroup } from '@zyncat/ui/tag';

const [channels, setChannels] = useState(['instagram', 'twitter', 'linkedin']);

<TagGroup label="Active channels">
  {channels.map((ch) => (
    <Tag
      key={ch}
      onRemove={() => setChannels((prev) => prev.filter((c) => c !== ch))}
    >
      {ch}
    </Tag>
  ))}
</TagGroup>

// Dense row with icon slot
<Tag size="sm" onRemove={handleRemove}>
  {/* your icon node */}
  design
</Tag>`,
  },

  table: {
    example: `import { Table, type TableColumn } from '@zyncat/ui/table';

type Post = { id: number; channel: string; status: string; scheduled: string; reach: number };

const columns: TableColumn<Post>[] = [
  { key: 'channel', label: 'Channel', grow: true, strong: true },
  { key: 'status', label: 'Status' },
  { key: 'scheduled', label: 'Scheduled at', mono: true, sortable: true },
  { key: 'reach', label: 'Est. reach', align: 'end', mono: true, sortable: true },
];

const rows: Post[] = [
  { id: 1, channel: 'Instagram', status: 'Scheduled', scheduled: '2026-07-01 09:00', reach: 4800 },
  { id: 2, channel: 'LinkedIn', status: 'Draft', scheduled: '-', reach: 1200 },
  { id: 3, channel: 'Twitter', status: 'Published', scheduled: '2026-06-28 14:30', reach: 9300 },
];

<Table<Post>
  ariaLabel="Scheduled posts"
  columns={columns}
  rows={rows}
  selectable
  defaultSort={{ key: 'scheduled', dir: 'asc' }}
  onRowClick={(row) => openPost(row.id)}
/>`,
  },

  pagination: {
    example: `import { Pagination } from '@zyncat/ui/pagination';

const [cursor, setCursor] = useState({ from: 1, to: 25, hasPrev: false, hasNext: true });

<Pagination
  ariaLabel="Posts"
  range={[cursor.from, cursor.to]}
  total={312}
  hasPrev={cursor.hasPrev}
  hasNext={cursor.hasNext}
  onPrev={() => loadPage('prev')}
  onNext={() => loadPage('next')}
/>`,
  },

  'scroll-area': {
    example: `import { ScrollArea } from '@zyncat/ui/scroll-area';

<ScrollArea ariaLabel="Recent activity" style={{ maxHeight: 360 }}>
  {activity.map((event) => (
    <ActivityRow key={event.id} event={event} />
  ))}
</ScrollArea>

<ScrollArea axis="x" ariaLabel="Scheduled this week">
  {posts.map((post) => (
    <PostCard key={post.id} post={post} />
  ))}
</ScrollArea>`,
  },
};
