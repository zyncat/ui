const nearestTheme = (el: Element | null | undefined, attr: string): string | null =>
  el?.closest(`[${attr}]`)?.getAttribute(attr) ?? null;

const themeDifferingFromPage = (scope: Element | null | undefined, attr: string): string | undefined => {
  const own = nearestTheme(scope, attr);
  return own !== null && own !== nearestTheme(document.body, attr) ? own : undefined;
};

export interface InheritedThemeAttrs {
  'data-theme'?: string;
  'data-polarity'?: string;
}

export function inheritedThemeAttrs(scope: Element | null | undefined): InheritedThemeAttrs {
  return {
    'data-theme': themeDifferingFromPage(scope, 'data-theme'),
    'data-polarity': themeDifferingFromPage(scope, 'data-polarity'),
  };
}
