/**
 * Build the colour table category L (semantic utility migration) measures
 * against: the light/dark RGB of every v2 raw palette colour, of every semantic
 * role the Tailwind bridge exposes, and of every v1 colour that v2 removed.
 *
 *   npx nx run codemod:generate.semantic
 *   # = V1_TOKENS=<v1 design-tokens dist> tsx scripts/build-semantic-table.ts [out.ts]
 *
 * Inputs (build them first: design-tokens -> styles):
 *  - `projects/styles/dist/css/{colors-rgb,globals,semantic}.css`: the v2 values,
 *    resolved through their `var()` chains in `:root` (light) and in the
 *    `pref-theme-scheme-dark` block (dark). Named themes and `pref-contrast-more`
 *    are deliberately left out: the default theme is what the v1 class painted.
 *  - `projects/design-tokens/dist/css/tailwind-theme-color.css`: which raw colours
 *    exist as v2 utilities (`--color-<name>`).
 *  - `projects/styles/dist/tailwind/semantic.css`: which roles exist as utilities.
 *  - `$V1_TOKENS/css/colors-rgb.css`: the v1 values (design-tokens 13.x, the line
 *    magma 1.12 shipped), for the colours v2 no longer has.
 *
 * The output is committed (`src/semantic/semantic.generated.ts`), so the codemod
 * has no runtime dependency on the styles package. Re-run when the tokens move.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';

type Rgb = [number, number, number];
type Mode = 'light' | 'dark';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECTS = join(HERE, '..', '..');
const outPath = process.argv[2] ?? join(HERE, '..', 'src', 'semantic', 'semantic.generated.ts');
const v1Dir = process.env.V1_TOKENS;
if (!v1Dir) {
  console.error('V1_TOKENS must point at a v1 (13.x) @maggioli-design-system/design-tokens dist');
  process.exit(2);
}

/** Custom-property declarations per mode, collected from flat `selector { ... }` blocks. */
const collect = (
  files: string[],
  isLight: (sel: string) => boolean,
  isDark: (sel: string) => boolean,
): Record<Mode, Map<string, string>> => {
  const decls = { light: new Map<string, string>(), dark: new Map<string, string>() };
  for (const file of files) {
    const src = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    // Innermost blocks only: a selector nested in `@media` is captured without
    // the at-rule, and the media-gated blocks are recognised by their selector.
    const blockRe = /([^{}]+)\{([^{}]*)\}/g;
    let m: RegExpExecArray | null;
    while ((m = blockRe.exec(src))) {
      const sel = m[1]!.trim().replace(/\s+/g, ' ');
      const target = isLight(sel) ? decls.light : isDark(sel) ? decls.dark : null;
      if (!target) continue;
      for (const decl of m[2]!.split(';')) {
        const i = decl.indexOf(':');
        if (i < 0) continue;
        const key = decl.slice(0, i).trim();
        if (key.startsWith('--')) target.set(key.slice(2), decl.slice(i + 1).trim());
      }
    }
  }
  return decls;
};

const resolver = (decls: Record<Mode, Map<string, string>>) => {
  const value = (mode: Mode, name: string, depth = 0): string | null => {
    const raw = (mode === 'dark' ? decls.dark.get(name) : undefined) ?? decls.light.get(name);
    if (raw == null || depth > 30) return null;
    let broken = false;
    const out = raw.replace(/var\(--([\w-]+)(?:,[^)]*)?\)/g, (_, ref: string) => {
      const r = value(mode, ref, depth + 1);
      if (r == null) broken = true;
      return r ?? '';
    });
    return broken ? null : out;
  };
  return (mode: Mode, name: string): Rgb | null => {
    const v = value(mode, name);
    const m = v?.match(/^(\d+)\s+(\d+)\s+(\d+)$/);
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
  };
};

const v2 = resolver(
  collect(
    ['colors-rgb.css', 'globals.css', 'semantic.css'].map((f) =>
      join(PROJECTS, 'styles', 'dist', 'css', f),
    ),
    (sel) => sel === ':root',
    (sel) => sel.split(',').some((s) => s.trim() === ':root.pref-theme-scheme-dark'),
  ),
);
const v1 = resolver(
  collect(
    [join(v1Dir, 'css', 'colors-rgb.css')],
    (sel) => sel === ':root',
    (sel) => sel === ':root.pref-theme-dark',
  ),
);

const namesIn = (file: string, re: RegExp): string[] => [
  ...new Set([...readFileSync(file, 'utf8').matchAll(re)].map((m) => m[1]!)),
];

// v2 raw colours: every `--color-<name>` of the design-tokens Tailwind theme.
const primitives: Record<string, [Rgb, Rgb]> = {};
for (const name of namesIn(
  join(PROJECTS, 'design-tokens', 'dist', 'css', 'tailwind-theme-color.css'),
  /--color-([a-z0-9-]+):/g,
)) {
  const light = v2('light', name);
  const dark = v2('dark', name);
  if (light && dark) primitives[name] = [light, dark];
}

// Roles: every bridge utility, with the channel it may paint and its hue.
// The quintet shortcuts (`danger-fg` = `danger-fg-default`, ...) and the
// `neutral-fg` / `neutral-emphasis` aliases resolve to a role already listed, so
// they are dropped (asserted below) and a candidate list never shows a role twice.
type Channel = 'background' | 'foreground' | 'border';
const HUES = ['accent-ai', 'accent', 'info', 'success', 'warning', 'danger', 'neutral'];
const SHORTCUT =
  /^(?:(?:info|success|warning|danger)-(?:fg|surface|border)|neutral-(?:fg|emphasis|on-emphasis))$/;
const channelOf = (rest: string): Channel | null => {
  if (/^(?:surface|wash|emphasis)(?:-|$)/.test(rest)) return 'background';
  if (/^(?:fg|on-emphasis|on-inverse)(?:-|$)/.test(rest)) return 'foreground';
  if (/^border(?:-|$)/.test(rest)) return 'border';
  return null; // shadow-ink: a colour for composed shadows, not a utility role
};

interface Role {
  channel: Channel;
  hue: string;
  light: Rgb;
  dark: Rgb;
}
const roles: Record<string, Role> = {};
const shortcuts: Array<[string, Rgb, Rgb]> = [];
for (const [, utility, prop] of readFileSync(
  join(PROJECTS, 'styles', 'dist', 'tailwind', 'semantic.css'),
  'utf8',
).matchAll(/--color-([a-z0-9-]+):\s*rgb\(var\(--([a-z0-9-]+)\)\)/g)) {
  const light = v2('light', prop!);
  const dark = v2('dark', prop!);
  if (!light || !dark) throw new Error(`unresolved role --${prop}`);
  if (SHORTCUT.test(utility!)) {
    shortcuts.push([utility!, light, dark]);
    continue;
  }
  const hue = HUES.find((h) => utility!.startsWith(`${h}-`)) ?? 'neutral';
  const rest = utility!.startsWith(`${hue}-`) ? utility!.slice(hue.length + 1) : utility!;
  const channel = channelOf(rest);
  if (channel) roles[utility!] = { channel, hue, light, dark };
}
const same = (a: Rgb, b: Rgb): boolean => a.every((c, i) => c === b[i]);
for (const [utility, light, dark] of shortcuts) {
  if (!Object.values(roles).some((r) => same(r.light, light) && same(r.dark, dark)))
    throw new Error(`shortcut ${utility} does not alias any listed role`);
}

// v1 colours that v2 no longer publishes.
const removed: Record<string, [Rgb, Rgb]> = {};
for (const name of namesIn(join(v1Dir, 'css', 'colors-rgb.css'), /--([a-z0-9-]+):/g)) {
  if (name in primitives) continue;
  const light = v1('light', name);
  const dark = v1('dark', name);
  if (light && dark) removed[name] = [light, dark];
}

const rgb = (c: Rgb): string => `[${c.join(', ')}]`;
const pair = ([l, d]: [Rgb, Rgb]): string => `[${rgb(l)}, ${rgb(d)}]`;
const lines = [
  '/* AUTO-GENERATED by scripts/build-semantic-table.ts - do not edit by hand.',
  ' * Regenerate with `npx nx run codemod:generate.semantic` after a tokens change. */',
  "import { type SemanticTable } from './table.js';",
  '',
  'export const semanticTable: SemanticTable = {',
  '  primitives: {',
  ...Object.entries(primitives).map(([n, v]) => `    '${n}': ${pair(v)},`),
  '  },',
  '  roles: {',
  ...Object.entries(roles).map(
    ([n, r]) =>
      `    '${n}': { channel: '${r.channel}', hue: '${r.hue}', light: ${rgb(r.light)}, dark: ${rgb(r.dark)} },`,
  ),
  '  },',
  '  removed: {',
  ...Object.entries(removed).map(([n, v]) => `    '${n}': ${pair(v)},`),
  '  },',
  '};',
  '',
];
// Formatted like the rest of the repo, so lint-staged never rewrites a fresh table.
const prettierConfig = await resolveConfig(outPath);
writeFileSync(outPath, await format(lines.join('\n'), { ...prettierConfig, filepath: outPath }));
console.log(
  `Wrote ${outPath}: ${Object.keys(primitives).length} primitives, ${Object.keys(roles).length} roles, ${Object.keys(removed).length} removed v1 colours.`,
);
