import type { PageSeo } from './types';

const seo: PageSeo = {
  title: 'React Theming: Design Tokens & CSS Variables',
  description:
    'React theming with design tokens in plain CSS variables: repoint them to restyle everything, swap dark mode with one attribute. No ThemeProvider.',
  keywords: [
    'css variables',
    'theme example',
    'theming',
    'design tokens',
    'custom css',
    'css variable',
    'css custom properties',
    'what are design tokens',
    'dark mode toggle',
    'color tokens',
    'what is a design token',
    'design system tokens',
    'css color variables',
    'css root variables',
    'theme provider',
  ],
  lede: 'Theme every component with typed design tokens and plain CSS variables. Four override levels, no ThemeProvider.',
  faq: [
    {
      q: 'What are design tokens?',
      a: 'Design tokens are the named CSS custom properties every component reads instead of a hard-coded value: --accent, --space-4, --radius-md, --duration-base. Zyncat UI ships a closed vocabulary of them grouped by job - color, type, space, radius, elevation, motion, glass, icon, layer, avatar - so repointing one token moves every component that uses it. They are plain CSS on :root, not a build-time pipeline.',
    },
    {
      q: 'How do I use CSS variables in React?',
      a: "Set them on :root in your own stylesheet, or use the typed API: defineTheme({ color: { accent: 'oklch(0.58 0.19 292)' } }) and render <ZyncatTheme theme={{ base }} /> once at the app root. The typed route autocompletes every token name and turns a typo into a compile error, and the style prop on every component accepts the design tokens too.",
    },
    {
      q: 'How do I override the default CSS of a component?',
      a: 'Load your stylesheet after @zyncat/ui/styles.css and write a normal rule - .zc-btn { border-radius: 0 } just lands. Every shipped rule sits inside @layer zyncat.components, and unlayered CSS beats every layer at any specificity, so there is no !important, no specificity ladder and no parent selector to lean on. Every class is BEM off a short base behind the zc- namespace, so nothing in your own sheet can collide with one - .zc-btn, .zc-btn--primary, .zc-btn__label, .zc-fld__input - and the names are stable to target.',
    },
    {
      q: 'How do I add a dark mode toggle?',
      a: "Dark ships in the package. Toggling is one attribute - document.documentElement.dataset.theme = 'dark' - and the page, the body included, turns with no re-render and no reload; put data-theme on any element instead of <html> to turn one subtree, and data-theme=\"light\" inside it makes a light island. Extend it under the same attribute: a [data-theme='dark'] block in zyncat.theme.css, or a dark key in <ZyncatTheme theme={{ base, dark }} />.",
    },
    {
      q: 'Do I need a ThemeProvider?',
      a: 'No. ZyncatTheme is not a context provider: it renders a plain <style> element, so it server-renders with no flash, no client hook and no PostCSS or bundler plugin, and it adds about a kilobyte. Nothing subscribes to it, which is why switching themes is a DOM attribute rather than a React re-render.',
    },
    {
      q: 'How do I restyle just one component?',
      a: "Expressive and compound components publish scoped --<component>-<name> custom properties as their public contract: <Odometer value={total} style={{ '--odometer-size': '3rem', '--odometer-ink': 'var(--danger)' }} />. Each component's style prop is typed to its own knobs, so another component's property is a compile error. Set the same properties on any ancestor to reach every instance underneath.",
    },
    {
      q: 'Does it work with Tailwind CSS?',
      a: "Yes, on Tailwind v4. Import @zyncat/ui/tailwind.css above tailwindcss in the stylesheet Tailwind compiles - init writes the line - and the token vocabulary becomes utilities that Tailwind IntelliSense completes: bg-surface, text-muted, border-subtle, text-caption, rounded-md, shadow-md, duration-fast, ease-standard. Each utility reads the design token itself, so a themed subtree and the dark theme reach it, dark: follows data-theme, and Tailwind's own rounded-md and shadow-md read the same tokens the components do.",
    },
  ],
};

export default seo;
