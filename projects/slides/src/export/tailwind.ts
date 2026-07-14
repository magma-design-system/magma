import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Input CSS for the author-utilities pass. Pulls Tailwind's default theme and
 * utilities (NO preflight - the deck is already styled) plus the Magma token
 * theme, so utilities like `grid-cols-2` or `bg-variant-primary` resolve to
 * Magma values. `@source` points Tailwind at the deck HTML to scan.
 */
const inputCss = (htmlPath: string): string => `@import "tailwindcss/theme.css";
@import "tailwindcss/utilities.css";
@import "@maggioli-design-system/design-tokens/dist/css/tailwind-theme-color.css";
@import "@maggioli-design-system/design-tokens/dist/css/tailwind-theme-typography.css";
@source "${htmlPath.replace(/\\/g, '/')}";
`;

/**
 * Generate the Tailwind utilities used by an author in the deck HTML and inject
 * them as a `<style>` before `</head>`. Opt-in (used by the CLI and
 * build-examples, or called explicitly): the core exportHtml/exportPdf stay
 * Tailwind-free. Requires `tailwindcss`, `@tailwindcss/postcss` and `postcss`
 * to be installed (dev deps here; optional peers for consumers).
 */
export async function applyUtilities(html: string): Promise<string> {
  let postcss: typeof import('postcss').default;
  let tailwind: (options?: unknown) => import('postcss').AcceptedPlugin;
  try {
    postcss = (await import('postcss')).default;
    tailwind = (await import('@tailwindcss/postcss')).default as typeof tailwind;
  } catch {
    throw new Error(
      'applyUtilities requires "tailwindcss", "@tailwindcss/postcss" and "postcss" to be installed.',
    );
  }

  // Resolve imports/@source from the package root (dist/export -> package root)
  // so `tailwindcss` and `@maggioli-design-system/*` resolve from node_modules.
  const pkgRoot = fileURLToPath(new URL('../../', import.meta.url));
  const dir = mkdtempSync(join(tmpdir(), 'magma-slides-'));
  const htmlPath = join(dir, 'deck.html');
  writeFileSync(htmlPath, html);

  try {
    const result = await postcss([tailwind()]).process(inputCss(htmlPath), {
      from: join(pkgRoot, '__tailwind_input__.css'),
    });
    const utilities = result.css.trim();
    if (!utilities) return html;
    return html.replace('</head>', `<style>${utilities}</style>\n</head>`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
