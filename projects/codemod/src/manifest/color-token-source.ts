/**
 * Which custom properties the DTCG sets of design-tokens and styles type as a
 * colour: the source of `color-tokens.generated.ts`, shared by its generator
 * (`scripts/build-color-tokens.ts`) and by the test that holds the committed
 * list to the built sets.
 *
 * A colour is a token whose `$type`, its own or inherited from its group as
 * the DTCG format says, is `color`; its custom property is
 * `$extensions["it.maggioli.magma"].css` (docs/CONTRACTS.md, "The DTCG sets of
 * design-tokens"). Every tier counts (primitive, semantic, internal): the
 * format changed for all of them.
 */

interface TokenNode {
  $type?: string;
  $extensions?: Record<string, { css?: string } | undefined>;
  [key: string]: unknown;
}

export interface ColorTokenScan {
  /** The custom properties, without `--`, sorted and unique. */
  names: string[];
  /** Colour tokens with no custom property: the contract is broken. */
  missing: string[];
}

/** Collect the colour custom properties of parsed `*.tokens.json` files, keyed by file name. */
export const collectColorTokens = (files: Record<string, unknown>): ColorTokenScan => {
  const names = new Set<string>();
  const missing: string[] = [];
  const walk = (node: unknown, inherited: string | undefined, path: string[], file: string) => {
    if (!node || typeof node !== 'object') return;
    const token = node as TokenNode;
    const type = token.$type ?? inherited;
    if ('$value' in token) {
      if (type !== 'color') return;
      const css = token.$extensions?.['it.maggioli.magma']?.css;
      if (typeof css === 'string' && css.startsWith('--')) names.add(css.slice(2));
      else missing.push(`${file}: ${path.join('.')}`);
      return;
    }
    for (const [key, child] of Object.entries(token))
      if (!key.startsWith('$')) walk(child, type, [...path, key], file);
  };
  for (const [file, json] of Object.entries(files)) walk(json, undefined, [], file);
  return { names: [...names].sort(), missing };
};
