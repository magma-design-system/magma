import type { Declaration } from 'postcss';
import { COMPONENTS_DIR, STYLES_DIR, TOKENS_DIR } from './meta';
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

type Tokens = Record<string, string>;

const TOKENS_CSS_DIR = path.resolve(TOKENS_DIR, 'dist/css');

// The generated semantic layer (`--magma-*`). Prefer the built `dist` (the form
// consumers load, a prerequisite the same way the token dist is); fall back to
// the in-package generated source.
const SEMANTIC_CSS_CANDIDATES = [
  path.resolve(STYLES_DIR, 'dist/css/semantic.css'),
  path.resolve(STYLES_DIR, 'css/semantic.css'),
];

/**
 * Minimal shape of a Stencil style-transform plugin. Stencil only runs plugins
 * that expose a `transform` hook for the matching `pluginType`; a bare PostCSS
 * plugin object placed in `config.plugins` is silently ignored, which is why
 * this injector has to wrap its PostCSS pass in a `transform`.
 */
interface StencilStylePlugin {
  name: string;
  pluginType: 'css';
  transform: (sourceText: string, id: string) => Promise<{ code: string } | null>;
}

/**
 * Recursively collect every `.css` file under a directory.
 */
const collectCssFiles = (dir: string): string[] => {
  const out: string[] = [];
  if (!fs.existsSync(dir)) {
    return out;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectCssFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      out.push(full);
    }
  }
  return out;
};

/**
 * Build a `name -> value` map for every design-token custom property declared
 * across all generated token stylesheets (colors, transitions, radii, shadows,
 * fonts, ...). These are the values inlined as `var()` fallbacks so component
 * CSS renders correctly even when the consumer has not loaded the token sheets.
 */
const loadDesignTokens = (): Tokens => {
  const tokens: Tokens = {};
  for (const file of collectCssFiles(TOKENS_CSS_DIR)) {
    const root = postcss.parse(fs.readFileSync(file, 'utf-8'), { from: file });
    root.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        const value = decl.value.trim();
        if (value.length > 0) {
          tokens[decl.prop.slice(2)] = value;
        }
      }
    });
  }
  return tokens;
};

/**
 * Build a `name -> value` map for the generated semantic layer (`--magma-*`,
 * `projects/styles/css/semantic.css`). Every entry is an indirection - e.g.
 * `--magma-surface-raised: var(--magma-tint-raised)` - that ultimately points at
 * a design-token primitive. Seeding them into the lookup lets `inject()` follow
 * the chain, so a bare `var(--magma-*)` in component CSS still resolves to a
 * concrete value when the consumer has not loaded the semantic sheet, exactly as
 * the raw `--tone-*` / `--surface-*` primitives already do.
 */
const loadSemanticTokens = (): Tokens => {
  const tokens: Tokens = {};
  const file = SEMANTIC_CSS_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!file) {
    return tokens;
  }
  const root = postcss.parse(fs.readFileSync(file, 'utf-8'), { from: file });
  root.walkDecls((decl) => {
    if (decl.prop.startsWith('--')) {
      const value = decl.value.trim();
      if (value.length > 0) {
        tokens[decl.prop.slice(2)] = value;
      }
    }
  });
  return tokens;
};

/**
 * Build a `name -> initial-value` map from every `@property --mds-*` block
 * declared by the components. The registered `initial-value` is the component
 * author's intended default, so it doubles as the natural `var()` fallback.
 */
const loadComponentDefaults = (): Tokens => {
  const defaults: Tokens = {};
  for (const file of collectCssFiles(COMPONENTS_DIR)) {
    const root = postcss.parse(fs.readFileSync(file, 'utf-8'), { from: file });
    root.walkAtRules('property', (atRule) => {
      const name = atRule.params.trim();
      if (!name.startsWith('--')) {
        return;
      }
      atRule.walkDecls('initial-value', (decl) => {
        const value = decl.value.trim();
        if (value.length > 0) {
          defaults[name.slice(2)] = value;
        }
      });
    });
  }
  return defaults;
};

export interface TokenFallbackPluginOptions {
  /** Inline design-token values (colors, radii, shadows, ...) as fallbacks. */
  injectTokenFallbacks?: boolean;
  /** Inline the semantic layer (`--magma-*`) indirections as fallbacks. */
  injectSemanticFallbacks?: boolean;
  /** Inline each `--mds-*` `@property` `initial-value` as a fallback. */
  injectComponentDefaults?: boolean;
  /** Log a warning for every bare `var()` with no resolvable fallback. */
  warnOnMissing?: boolean;
  /** Throw for every bare `var()` with no resolvable fallback. */
  failOnMissing?: boolean;
}

// Bare `var(--name)` with no existing fallback (closing paren right after the
// name). `var(--name, ...)` is intentionally NOT matched - it already has one.
const BARE_VAR = /var\(\s*--([a-z0-9-_]+)\s*\)/g;
const MAX_DEPTH = 12;

export default function tokenFallbackPlugin(
  options: TokenFallbackPluginOptions = {},
): StencilStylePlugin {
  const {
    injectTokenFallbacks = true,
    injectSemanticFallbacks = true,
    injectComponentDefaults = true,
    warnOnMissing = false,
    failOnMissing = false,
  } = options;

  // Built once per build. Primitive, semantic (`--magma-*`) and `--mds-*` names
  // never collide, so a flat lookup is enough; later spreads win on the off
  // chance they do. Semantic entries are indirections resolved recursively by
  // `inject()` down to the primitive values loaded alongside them.
  const lookup: Tokens = {
    ...(injectTokenFallbacks ? loadDesignTokens() : {}),
    ...(injectSemanticFallbacks ? loadSemanticTokens() : {}),
    ...(injectComponentDefaults ? loadComponentDefaults() : {}),
  };

  const reported = new Set<string>();

  const inject = (value: string, depth = 0): string => {
    if (depth >= MAX_DEPTH) {
      return value;
    }
    return value.replace(BARE_VAR, (whole, name: string) => {
      const fallback = lookup[name];
      if (fallback === undefined) {
        if ((failOnMissing || warnOnMissing) && !reported.has(name)) {
          reported.add(name);
          const message = `CSS variable with no resolvable fallback: --${name}`;
          if (failOnMissing) {
            throw new Error(`[token-fallback-injector] ${message}`);
          }
          console.warn(`[token-fallback-injector] ${message}`);
        }
        return whole;
      }
      // Resolve `var()`s nested inside the fallback too, so the inlined default
      // is self-sufficient down to a concrete value.
      return `var(--${name}, ${inject(fallback, depth + 1)})`;
    });
  };

  const injector = {
    postcssPlugin: 'token-fallback-injector',
    Declaration(decl: Declaration) {
      if (decl.value.includes('var(')) {
        decl.value = inject(decl.value);
      }
    },
  };

  return {
    name: 'token-fallback-injector',
    pluginType: 'css',
    async transform(sourceText: string, id: string) {
      // Cheap bail-out: nothing to inject when the stylesheet has no var().
      if (!sourceText || !sourceText.includes('var(')) {
        return null;
      }
      const result = await postcss([injector]).process(sourceText, { from: id });
      return { code: result.css };
    },
  };
}
