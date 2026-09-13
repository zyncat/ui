import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { NATIVE_PROP_RE, typesFileBySubpath } from './lib/dts-props.mjs';
import { loadModules } from './lib/usage-format.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');

const MAX_PROSE_LINES = 16;
const MAX_SUMMARY_CHARS = 180;

const SUPPORTING = new Set(['next']);

const NESTED = ['Icon', 'Avatar', 'Button', 'Toaster', 'div', 'nav', 'menu', 'span', 'input', 'img'];

if (!existsSync(DIST)) {
  console.error('✗ dist/ not found - run "pnpm build" first.');
  process.exit(1);
}

let violations = 0;
const fail = (msg) => {
  violations++;
  console.error(`✗ ${msg}`);
};

const { modules } = loadModules(ROOT);

for (const m of modules) {
  if (!m.usage && !SUPPORTING.has(m.subpath))
    fail(`@zyncat/ui/${m.subpath} has no usage doc - write ${m.usagePath ?? 'one next to its source'}.`);
  if (m.usage && SUPPORTING.has(m.subpath))
    fail(`@zyncat/ui/${m.subpath} is listed as types-only in SUPPORTING but has a usage doc - drop it from the list.`);
}

const claimed = new Set(modules.map((m) => m.usagePath).filter(Boolean));
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith('.usage.md') && !claimed.has(relativeToRoot(path)))
      fail(`${relativeToRoot(path)} is not the usage doc of any exported subpath - remove it or export the module.`);
  }
};
const relativeToRoot = (path) => path.slice(ROOT.length + 1);
walk(join(ROOT, 'src'));

const registrySlugs = (() => {
  const registry = join(ROOT, 'apps/docs/content/registry.tsx');
  if (!existsSync(registry)) return null;
  return new Set([...readFileSync(registry, 'utf8').matchAll(/slug: '([^']+)'/g)].map((match) => match[1]));
})();

const documented = modules.filter((m) => m.usage);

for (const m of documented) {
  for (const error of m.usageErrors ?? []) fail(`${m.usagePath}: ${error}`);
  if (m.usage.subpath !== m.subpath)
    fail(`${m.usagePath} heading names @zyncat/ui/${m.usage.subpath}, but the file documents @zyncat/ui/${m.subpath}.`);
  if (m.usage.summary.length > MAX_SUMMARY_CHARS)
    fail(`${m.usagePath} summary runs ${m.usage.summary.length} chars, over the ${MAX_SUMMARY_CHARS}-char cap.`);
  const proseLines = m.usage.prose.filter((l) => l.text.trim()).length;
  if (proseLines > MAX_PROSE_LINES)
    fail(
      `${m.usagePath} runs ${proseLines} prose lines, over the ${MAX_PROSE_LINES}-line cap - ` +
        'per-prop detail belongs in the props JSDoc, which get_component ships beside this doc.',
    );
  if (!m.usage.examples.length) fail(`${m.usagePath} has no \`\`\` example - show the common case.`);
  if (m.usage.docs) {
    const slug = m.usage.docs.match(/^https:\/\/ui\.zyncat\.app\/([a-z0-9-]+)$/)?.[1];
    if (!slug) fail(`${m.usagePath} Docs must be https://ui.zyncat.app/<slug>, got "${m.usage.docs}".`);
    else if (registrySlugs && !registrySlugs.has(slug))
      fail(`${m.usagePath} Docs points at /${slug}, which is not a registry slug.`);
  }
}

const TYPES_BY_SUBPATH = typesFileBySubpath();

const SHAPE_RE = /(?:interface|type)\s+(\w+)(?:<[^>]*>)?\s*(?:extends\s+([^{]+))?=?\s*\{([\s\S]*?)\n\}/g;
const KEY_RE = /^\s+([a-zA-Z][a-zA-Z0-9]*)\??[:(]/gm;
const PROPS_SHAPE_RE = /(?:Props|Config)$/;

function declaredProps(subpath) {
  const props = new Set();
  const shapes = new Map();
  const seen = new Set();
  const queue = [TYPES_BY_SUBPATH.get(subpath)].filter(Boolean);
  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file) || !existsSync(file)) continue;
    seen.add(file);
    const src = readFileSync(file, 'utf8');
    const specifiers = [
      ...[...src.matchAll(/from '(\.[^']+)'/g)].map((match) => match[1]),
      ...[...src.matchAll(/import\("(\.[^"]+)"\)/g)].map((match) => match[1]),
    ];
    for (const spec of specifiers) {
      const base = join(dirname(file), spec.replace(/\.js$/, ''));
      queue.push(`${base}.d.ts`, join(base, 'index.d.ts'));
    }
    for (const shape of src.matchAll(SHAPE_RE))
      shapes.set(shape[1], { body: shape[3], bases: [...(shape[2] ?? '').matchAll(/\w+/g)].map((m) => m[0]) });
    for (const fn of src.matchAll(/declare function \w+\(\{[^}]*\}:\s*\{([\s\S]*?)\n\}\)/g))
      for (const key of fn[1].matchAll(/([a-zA-Z][a-zA-Z0-9]*)\??:/g)) props.add(key[1]);
    for (const pick of src.matchAll(/Pick<.*$/gm))
      for (const key of pick[0].matchAll(/'([a-zA-Z][a-zA-Z0-9]*)'/g)) props.add(key[1]);
  }
  const pending = [...shapes.keys()].filter((name) => PROPS_SHAPE_RE.test(name));
  const taken = new Set();
  while (pending.length) {
    const name = pending.pop();
    if (taken.has(name) || !shapes.has(name)) continue;
    taken.add(name);
    const shape = shapes.get(name);
    for (const key of shape.body.matchAll(KEY_RE)) props.add(key[1]);
    pending.push(...shape.bases);
  }
  return props;
}

for (const m of documented) {
  const attributes = [];
  for (const example of m.usage.examples) {
    example.code.split('\n').forEach((text, offset) => {
      let stripped = text;
      for (const tag of NESTED) stripped = stripped.replaceAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'), '');
      for (const match of stripped.matchAll(/(?:^|\s)([a-zA-Z][a-zA-Z0-9]*)=[{"]/g))
        attributes.push({ prop: match[1], line: example.line + offset + 1 });
    });
  }
  if (!attributes.length) continue;
  const props = declaredProps(m.subpath);
  if (!props.size) {
    fail(`the built types for @zyncat/ui/${m.subpath} declared no props - is the build stale?`);
    continue;
  }
  for (const { prop, line } of attributes) {
    if (props.has(prop) || NATIVE_PROP_RE.test(prop)) continue;
    const near = [...props].find((p) => p.toLowerCase().endsWith(prop.toLowerCase()));
    fail(
      `${m.usagePath}:${line} example uses "${prop}", not a prop of ` +
        `@zyncat/ui/${m.subpath}${near ? ` - did you mean "${near}"?` : ''}`,
    );
  }
}

if (violations) {
  console.error(`\n${violations} usage-doc problem(s).`);
  process.exit(1);
}
console.log(`check-usage: ${documented.length} usage docs clean, ${modules.length} public subpaths covered.`);
