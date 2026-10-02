import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const HEADING_RE = /^# ([A-Za-z][\w /-]*?) - @zyncat\/ui\/([a-z][a-z0-9-]*)\s*$/;
const META_RE = /^(Group|Docs): (.+?)\s*$/;
const FENCE_RE = /^```(\w*)\s*$/;

export const GROUPS = [
  { id: 'primitives', title: 'Primitives', note: '' },
  {
    id: 'forms',
    title: 'Forms',
    note: 'Every form field takes label, helper/error/warning/success, size sm|md|lg, disabled.',
  },
  { id: 'data-display', title: 'Data display', note: '' },
  {
    id: 'date-time',
    title: 'Date, time & tabs',
    note: 'The date and time fields share: value is a string, onChange(value | null), timezone, min/max, disabled.',
  },
  { id: 'overlays', title: 'Overlays & feedback', note: '' },
  {
    id: 'expressive',
    title: 'Expressive',
    note: 'Creative motion components. Each publishes scoped --<component>-* custom properties as its theming surface.',
  },
  {
    id: 'compound',
    title: 'Compound',
    note:
      'Whole assembled patterns on the expressive contract - scoped --support-rail-* properties, ' +
      'no tone/corner/density enums. Actions are a SupportAction[]: id, label, icon, meta, description, onSelect.',
  },
  {
    id: 'replicas',
    title: 'Replicas',
    note:
      'Each reproduces an external platform surface; fidelity is the contract. Platform metrics are pinned constants - ' +
      'only --font-body, --focus-ring and the duration tokens are read, so your theme cannot move them. None ever ' +
      'fetches media or autoplays: media and avatar take a URL string or your own node, with CSS-only placeholders.',
  },
  { id: 'dev', title: 'Dev tools', note: '' },
];

export const GROUP_IDS = new Set(GROUPS.map((g) => g.id));

export function parseUsage(text) {
  const lines = text.split('\n');
  const errors = [];
  const doc = { title: '', subpath: '', group: '', docs: '', summary: '', prose: [], examples: [] };

  const heading = lines[0]?.match(HEADING_RE);
  if (!heading) {
    errors.push(`line 1 must be "# <Title> - @zyncat/ui/<subpath>", got "${lines[0] ?? ''}"`);
    return { doc, errors };
  }
  doc.title = heading[1].trim();
  doc.subpath = heading[2];

  let i = 1;
  while (i < lines.length && !lines[i].trim()) i++;
  for (; i < lines.length; i++) {
    const meta = lines[i].match(META_RE);
    if (!meta) break;
    if (meta[1] === 'Group') doc.group = meta[2];
    else doc.docs = meta[2];
  }
  while (i < lines.length && !lines[i].trim()) i++;

  if (i < lines.length && !FENCE_RE.test(lines[i])) {
    doc.summary = lines[i].trim();
    i++;
    if (i < lines.length && lines[i].trim()) errors.push(`the summary (line ${i}) must be a single line`);
  }

  let fence = null;
  for (; i < lines.length; i++) {
    const open = lines[i].match(FENCE_RE);
    if (open && !fence) {
      fence = { lang: open[1] || 'tsx', line: i + 1, code: [] };
      continue;
    }
    if (fence && /^```\s*$/.test(lines[i])) {
      doc.examples.push({ ...fence, code: fence.code.join('\n') });
      fence = null;
      continue;
    }
    if (fence) fence.code.push(lines[i]);
    else doc.prose.push({ text: lines[i], line: i + 1 });
  }
  if (fence) errors.push(`unclosed \`\`\` fence opened at line ${fence.line}`);

  while (doc.prose.length && !doc.prose[doc.prose.length - 1].text.trim()) doc.prose.pop();
  while (doc.prose.length && !doc.prose[0].text.trim()) doc.prose.shift();

  if (!doc.group) errors.push('missing "Group:" line');
  else if (!GROUP_IDS.has(doc.group))
    errors.push(`unknown group "${doc.group}" - one of: ${[...GROUP_IDS].join(', ')}`);
  if (!doc.summary) errors.push('missing summary - one line of prose after the metadata block');
  return { doc, errors };
}

export function usagePathFor(source) {
  return source ? source.replace(/^\.\//, '').replace(/\.(tsx|ts)$/, '.usage.md') : null;
}

export function loadModules(root) {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const modules = [];
  for (const [key, value] of Object.entries(pkg.exports ?? {})) {
    if (!value || typeof value !== 'object' || typeof value.types !== 'string') continue;
    const subpath = key.replace(/^\.\//, '');
    const usagePath = usagePathFor(value.source);
    const module = { subpath, typesPath: value.types.replace(/^\.\//, ''), sourcePath: value.source, usagePath };
    if (usagePath && existsSync(join(root, usagePath))) {
      const { doc, errors } = parseUsage(readFileSync(join(root, usagePath), 'utf8'));
      module.usage = doc;
      module.usageErrors = errors;
    }
    modules.push(module);
  }
  return { version: String(pkg.version ?? '0'), modules };
}

export function buildIndex(modules) {
  const out = [];
  for (const group of GROUPS) {
    const inGroup = modules.filter((m) => m.usage?.group === group.id);
    if (!inGroup.length) continue;
    out.push(`== ${group.title} ==`);
    if (group.note) out.push(group.note);
    for (const m of inGroup) out.push(`${m.usage.title} - @zyncat/ui/${m.subpath} - ${m.usage.summary}`);
    out.push('');
  }
  const typesOnly = modules.filter((m) => !m.usage);
  if (typesOnly.length) {
    out.push('== Types-only modules (documented by their .d.ts alone) ==');
    for (const m of typesOnly) out.push(`@zyncat/ui/${m.subpath} - get_component({ components: "${m.subpath}" })`);
  }
  return out.join('\n').trim();
}
