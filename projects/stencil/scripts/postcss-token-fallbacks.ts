import type { Declaration, Plugin } from 'postcss';
import { TOKENS_DIR } from './meta';
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

const tokens = path.resolve(TOKENS_DIR, 'dist/css/colors-rgb.css');

type Tokens = Record<string, string>;

const loadTokensFromCSS = (path: string): Tokens => {
  console.info('🎨 Loading CSS tokens from design-tokens');
  const css = fs.readFileSync(path, 'utf-8');
  const root = postcss.parse(css);

  const tokens: Tokens = {};

  root.walkDecls((decl) => {
    if (decl.prop.startsWith('--')) {
      const parsed = valueParser(decl.value).nodes;
      if (parsed.length > 0) {
        tokens[decl.prop.replace('--', '')] = decl.value.trim();
      }
    }
  });

  return tokens;
};

const colorTokens = loadTokensFromCSS(tokens);

export interface TokenFallbackPluginOptions {
  warnOnMissing?: boolean;
  failOnMissing?: boolean;
}

export default function tokenFallbackPlugin(options: TokenFallbackPluginOptions = {}): Plugin {
  const { warnOnMissing = true, failOnMissing = false } = options;
  console.info('⛑️ Apply colors tokens fallbacks');

  return {
    postcssPlugin: 'token-fallback-injector',
    Declaration(decl: Declaration) {
      const varRegex = /var\(--([a-z0-9-_]+)\)/g;
      console.info('token-fallback-injector');

      decl.value = decl.value.replace(varRegex, (_, tokenName) => {
        const fallback = colorTokens[tokenName];

        if (!fallback) {
          const message = `⚠️ CSS Token not found: ${tokenName} used "${decl.toString()}"`;

          if (failOnMissing) {
            throw new Error(message);
          }
          if (warnOnMissing) {
            console.warn('⚠️', message);
          }

          return `var(--${tokenName})`;
        }
        console.info(`var(--${tokenName}, ${fallback})`);
        // Se trovato, aggiunge il fallback
        return `var(--${tokenName}, ${fallback})`;
      });

      console.info(decl.value);
    },
  };
}

tokenFallbackPlugin.postcss = true;
