import postcssrc from 'postcss-load-config';
import cssnano from 'cssnano';
import combine from 'postcss-combine-duplicated-selectors';
import mediaCombine from 'postcss-combine-media-query';
import discardComments from 'postcss-discard-comments';
import type { AtRule, Declaration, Plugin, Root, Rule } from 'postcss';

async function loadPlugins() {
  const ctx = {};

  try {
    const configPlugins = await postcssrc(ctx as unknown);
    return configPlugins.plugins;
  } catch (err) {
    if (err.message.startsWith('No PostCSS Config found in')) {
      return [];
    }

    throw new Error(
      `'stencil-tailwind-plugin' is not able to resolve modules required from configuration files. Make sure it is installed\nError: ${err.message}`,
    );
  }
}

function findIndexOfPlugin(configPlugins: postcssrc.ResultPlugin[], name: string) {
  return configPlugins.findIndex((plugin) => {
    if ('postcssPlugin' in plugin) {
      return plugin.postcssPlugin === name;
    }

    if (typeof plugin === 'function') {
      const createdPlugin = (plugin as typeof Function)();
      return 'postcssPlugin' in createdPlugin && createdPlugin.postcssPlugin === name;
    }

    return false;
  });
}

interface PostcssPlugins {
  before: postcssrc.ResultPlugin[];
  after: postcssrc.ResultPlugin[];
}

export function stripCommentsPlugin() {
  return discardComments({
    removeAll: true,
  });
}

// The condition Tailwind (4.1 and later) wraps a color-mix() over a var() in.
const COLOR_MIX_SUPPORTS =
  /^\(\s*color\s*:\s*color-mix\(\s*in\s+lab\s*,\s*red\s*,\s*red\s*\)\s*\)$/i;

/** The last declaration of `prop` among the siblings before `node`. */
const declarationBefore = (node: AtRule, prop: string): Declaration | undefined => {
  for (let sibling = node.prev(); sibling; sibling = sibling.prev()) {
    if (sibling.type === 'decl' && sibling.prop === prop) return sibling;
  }
  return undefined;
};

/** The last declaration of `prop` in the nearest rule of `selector` before `atRule`. */
const declarationInRuleBefore = (
  atRule: AtRule,
  selector: string,
  prop: string,
): Declaration | undefined => {
  for (let sibling = atRule.prev(); sibling; sibling = sibling.prev()) {
    if (sibling.type === 'rule' && (sibling as Rule).selector === selector) {
      return [...((sibling as Rule).nodes ?? [])]
        .reverse()
        .find((node): node is Declaration => node.type === 'decl' && node.prop === prop);
    }
  }
  return undefined;
};

/**
 * Undo the color-mix() polyfill of Tailwind. Tailwind rewrites every color-mix() over a var()
 * into a fallback (its first colour, the transparency dropped) and the color-mix() itself under
 * `@supports (color: color-mix(in lab, red, red))`. Once flattened, that block sits after its
 * rule, and postcss-combine-duplicated-selectors then pulls a later rule of the same selector
 * into the first one, above the block: the color-mix() wins over the declaration written after
 * it (#918, the arrow of mds-input-select took the blur colour of the variant over its own).
 * Every browser of the floor (.browserslistrc: Chrome 112, Firefox 121, Safari 16.5) has
 * color-mix() (Chrome 111, Firefox 113, Safari 16.2), so the fallback is never used: the
 * color-mix() goes back in place of its fallback, and the block goes. A block whose fallback
 * cannot be found fails the build instead of being left to reorder the cascade.
 */
export function dropColorMixPolyfillPlugin(): Plugin {
  return {
    postcssPlugin: 'drop-color-mix-polyfill',
    OnceExit(root: Root) {
      root.walkAtRules('supports', (atRule) => {
        if (!COLOR_MIX_SUPPORTS.test(atRule.params.trim())) {
          return;
        }
        const restore = (decl: Declaration, fallback: Declaration | undefined) => {
          if (!fallback) {
            throw atRule.error(`No fallback of ${decl.prop} before the color-mix() polyfill`);
          }
          fallback.value = decl.value;
          fallback.important = decl.important;
          decl.remove();
        };
        atRule.each((child) => {
          if (child.type === 'decl') {
            // nested in its rule (Tailwind without optimize): the fallback is a sibling before it
            restore(child, declarationBefore(atRule, child.prop));
          } else if (child.type === 'rule') {
            // flattened (Tailwind with optimize): the fallback is in the rule before the block
            const { selector } = child;
            child.each((decl) => {
              if (decl.type === 'decl') {
                restore(decl, declarationInRuleBefore(atRule, selector, decl.prop));
              }
            });
            if (!child.nodes?.length) {
              child.remove();
            }
          }
        });
        if (atRule.nodes?.length) {
          throw atRule.error('Unexpected content left in the color-mix() polyfill');
        }
        atRule.remove();
      });
    },
  };
}

// Le dichiarazioni d'ordine `@layer a, b, c;` vengono iniettate per-componente e poi
// concatenate insieme al CSS dei componenti funzionali importati (vedi
// store.getAllExternalCssDependencies). Ripetere una statement identica è innocuo ma
// gonfia ogni bundle: teniamo solo la prima occorrenza per ogni set di layer.
export function dedupeLayerStatementsPlugin(): Plugin {
  return {
    postcssPlugin: 'dedupe-layer-statements',
    OnceExit(root: Root) {
      const seen = new Set<string>();
      root.walkAtRules('layer', (rule) => {
        if (rule.nodes) {
          return; // solo statement bare `@layer a,b;`, non blocchi `@layer x { }`
        }
        const key = rule.params.replace(/\s+/g, '');
        if (seen.has(key)) {
          rule.remove();
        } else {
          seen.add(key);
        }
      });
    },
  };
}

export function getMinifyPlugins() {
  return [
    mediaCombine(),
    combine({ removeDuplicatedValues: true }),
    cssnano(),
    dedupeLayerStatementsPlugin(),
  ];
}

export async function getPostcssPlugins(): Promise<PostcssPlugins> {
  const configPlugins = await loadPlugins();

  const configPluginTailwindIdx = findIndexOfPlugin(configPlugins, '@tailwindcss/postcss');

  const beforeTailwind =
    configPluginTailwindIdx === -1 ? [] : configPlugins.slice(0, configPluginTailwindIdx);
  const afterTailwind =
    configPluginTailwindIdx === -1
      ? configPlugins
      : configPlugins.slice(configPluginTailwindIdx + 1);

  return {
    before: beforeTailwind,
    after: afterTailwind,
  };
}
