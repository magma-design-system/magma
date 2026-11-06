import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import postcss, { type AtRule, type Node, type Rule } from 'postcss';
import { describe, expect, it } from 'vitest';

/*
 * A component refines dark mode in its own sheets (`*-pref-mode.css`, `*-pref-contrast-dark.css`),
 * on the `pref-mode` and `pref-theme-scheme` attributes it reflects from <html>. Those refinements
 * must turn dark where the palette does, which is decided once by `darkScheme`
 * (design-tokens/src/formats/dark-scheme.ts): the dark mode unless the theme is light only, a
 * theme locked to dark, and, with the OS dark, the system mode or no controller unless the theme
 * is light only. A sheet that forgets the theme locks a dark-only theme's components to light
 * while its palette is dark (#1274). The rule, in the attributes the sheets read:
 *
 * - `[pref-mode='dark']` carries `:not([pref-theme-scheme='light'])`, and its rule also lists the
 *   same selector with `[pref-theme-scheme='dark']` in its place;
 * - `[pref-mode='system']`, and `:not([pref-mode])` in a `prefers-color-scheme: dark` block,
 *   carry `:not([pref-theme-scheme='light'])`.
 */

const NOT_LIGHT = ":not([pref-theme-scheme='light'])";
const DARK_MODE = "[pref-mode='dark']";
const DARK_SCHEME = "[pref-theme-scheme='dark']";

const componentsDir = join(__dirname, '../../components');

const sheets = readdirSync(componentsDir).flatMap((component) => {
  const cssDir = join(componentsDir, component, 'css');
  try {
    return readdirSync(cssDir)
      .filter((file) => file.endsWith('.css'))
      .map((file) => join(cssDir, file));
  } catch {
    return [];
  }
});

/** The simple selectors of a compound: `[attr]`, and `:pseudo` or `:pseudo(...)` kept whole. */
const simpleSelectors = (compound: string): string[] => {
  const out: string[] = [];
  let i = 0;
  while (i < compound.length) {
    let j = i + 1;
    if (compound[i] === '[') {
      j = compound.indexOf(']', i) + 1;
    } else if (compound[i] === ':') {
      while (j < compound.length && /[\w-]/.test(compound[j])) j++;
      if (compound[j] === '(') {
        for (let depth = 0; j < compound.length; j++) {
          if (compound[j] === '(') depth++;
          else if (compound[j] === ')' && --depth === 0) {
            j++;
            break;
          }
        }
      }
    } else {
      while (j < compound.length && !'[:'.includes(compound[j])) j++;
    }
    out.push(compound.slice(i, j));
    i = j;
  }
  return out;
};

/** The compound inside `:host(...)`, or null when the selector has none. */
const hostCompound = (selector: string): string | null => {
  const start = selector.indexOf(':host(');
  if (start < 0) return null;
  for (let k = start + 6, depth = 1; k < selector.length; k++) {
    if (selector[k] === '(') depth++;
    else if (selector[k] === ')' && --depth === 0) return selector.slice(start + 6, k);
  }
  return null;
};

const inDarkMedia = (rule: Rule): boolean => {
  for (let node = rule.parent as Node | undefined; node; node = node.parent as Node | undefined) {
    if (node.type === 'atrule' && /prefers-color-scheme:\s*dark/.test((node as AtRule).params)) {
      return true;
    }
  }
  return false;
};

/** What a rule's selectors break of the rule above, one line each. */
const violations = (rule: Rule): string[] => {
  const darkMedia = inDarkMedia(rule);
  const listed = new Set(rule.selectors);
  return rule.selectors.flatMap((selector) => {
    const compound = hostCompound(selector);
    if (compound === null) return [];
    const simple = simpleSelectors(compound);
    const unlessLight = simple.includes(NOT_LIGHT);
    if (simple.includes(DARK_MODE)) {
      const twin = selector.replace(NOT_LIGHT, '').replace(DARK_MODE, DARK_SCHEME);
      return [
        ...(unlessLight ? [] : [`${selector}: the dark mode without ${NOT_LIGHT}`]),
        ...(listed.has(twin) ? [] : [`${selector}: no twin ${twin}`]),
      ];
    }
    const followsTheOs =
      simple.includes("[pref-mode='system']") ||
      (darkMedia && simple.includes(':not([pref-mode])'));
    return followsTheOs && !unlessLight ? [`${selector}: follows the OS without ${NOT_LIGHT}`] : [];
  });
};

describe('the dark refinements of the components', () => {
  it('are found', () => {
    const refining = sheets.filter((file) => readFileSync(file, 'utf8').includes(DARK_MODE));
    expect(refining.length).toBeGreaterThan(30);
  });

  it('turn dark where the palette does: the theme locks the mode both ways', () => {
    const found = sheets.flatMap((file) => {
      const root = postcss.parse(readFileSync(file, 'utf8'), { from: file });
      const lines: string[] = [];
      root.walkRules((rule) => {
        violations(rule).forEach((line) =>
          lines.push(
            `${file.slice(componentsDir.length + 1)}:${rule.source?.start?.line}: ${line}`,
          ),
        );
      });
      return lines;
    });
    expect(found).toEqual([]);
  });

  it('flag a refinement that forgets the theme', () => {
    const rules = (css: string): Rule[] => {
      const out: Rule[] = [];
      postcss.parse(css).walkRules((rule) => {
        out.push(rule);
      });
      return out;
    };
    const [forgetful] = rules(":host([pref-mode='dark']) { color: red; }");
    expect(violations(forgetful)).toHaveLength(2);

    const [system, none] = rules(
      "@media (prefers-color-scheme: dark) { :host([pref-mode='system']) { color: red; } :host(:not([pref-mode])) { color: red; } }",
    );
    expect(violations(system)).toHaveLength(1);
    expect(violations(none)).toHaveLength(1);

    const [mirrored] = rules(
      ":host([tone='weak'][pref-mode='dark']:not([pref-theme-scheme='light'])), :host([tone='weak'][pref-theme-scheme='dark']) { color: red; }",
    );
    expect(violations(mirrored)).toEqual([]);
  });
});
