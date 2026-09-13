import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

function findRoot(start) {
  for (let dir = resolve(start); ; dir = dirname(dir)) {
    if (existsSync(join(dir, 'src/components')) && existsSync(join(dir, 'tsup.config.ts'))) return dir;
    if (dirname(dir) === dir) throw new Error('scripts/lib/entries: no repository root above ' + start);
  }
}

export const ROOT = findRoot(import.meta.dirname);

export const TIERS = ['primitives', 'composites', 'compound', 'expressive'];

export const NAME_OVERRIDES = {
  DateTimeField: 'datetime-field',
  EmojiPickerPanel: 'emoji-picker',
  TikTok: 'tiktok',
  YouTube: 'youtube',
};

export const EXPLICIT_ENTRIES = {
  'toast-store': 'src/components/composites/toast/toast-store.ts',
  motion: 'src/motion/motion.ts',
  'motion-tokens': 'src/tokens/motion-tokens.ts',
  'motion-devtools': 'src/components/dev/MotionDevtools.tsx',
  glide: 'src/motion/glide.tsx',
  theme: 'src/tokens/theme.tsx',
};

export function toKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

export function discoverComponentEntries() {
  const entries = {};
  for (const tier of TIERS) {
    const tierDir = join(ROOT, 'src/components', tier);
    let dirs;
    try {
      dirs = readdirSync(tierDir);
    } catch {
      continue;
    }
    for (const component of dirs.sort()) {
      const componentDir = join(tierDir, component);
      if (!statSync(componentDir).isDirectory()) continue;
      for (const file of readdirSync(componentDir).sort()) {
        if (!file.endsWith('.tsx') || !/^[A-Z]/.test(file)) continue;
        const stem = file.replace('.tsx', '');
        entries[NAME_OVERRIDES[stem] ?? toKebab(stem)] = `src/components/${tier}/${component}/${file}`;
      }
    }
  }
  return entries;
}

export function publicEntries() {
  return { ...discoverComponentEntries(), ...EXPLICIT_ENTRIES };
}

export function distTypesPath(source) {
  return (
    'dist/types/' +
    source
      .replace(/^\.\//, '')
      .replace(/^src\//, '')
      .replace(/\.tsx?$/, '.d.ts')
  );
}
