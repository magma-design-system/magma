/**
 * The bundled jumps between Magma majors, and which of them a run applies.
 *
 * The jump is chosen, never guessed (#1297): the v1 -> v2 rules are not
 * harmless on v2 code (the behaviour guards add attributes that keep the v1
 * defaults), and the installed version of magma cannot tell where the code
 * stands, since a product may upgrade the packages before or after the
 * rewrite. Without `--from`, a run migrates Magma 2 code to Magma 3; `--from 1`
 * runs the two jumps in order, each on what the previous one wrote.
 */
import { manifest as v1ToV2 } from './manifest.js';
import { manifestV3 as v2ToV3 } from './manifest-v3.js';
import { ruleId } from './registry.js';
import { type Manifest } from './schema.js';

/** The major the code is on: the first jump to apply. */
export type FromMajor = 1 | 2;

export const DEFAULT_FROM: FromMajor = 2;

/** The bundled jumps, keyed by the major they start from. */
export const JUMPS: Record<FromMajor, Manifest> = { 1: v1ToV2, 2: v2ToV3 };

/** The manifests a run applies, in order: from `from` up to the latest major. */
export const chainFrom = (from: FromMajor): Manifest[] =>
  ([1, 2] as const).filter((major) => major >= from).map((major) => JUMPS[major]);

/** How a finding names its jump: `1.12.0 -> 2.0.0`, `2 -> 3`. */
export const jumpName = (manifest: Manifest): string =>
  `${manifest.fromVersion} -> ${manifest.toVersion}`;

/**
 * The flags of a jump that the next one makes moot. The v1 -> v2 rename of a
 * colour property to its `-rgb` name flags the value for a conversion to
 * channels (`valueFormatChanged`); when the next jump renames it again to a
 * property that takes a colour, the value the product wrote (a hex, `rgb()`)
 * is right as it is, and converting it to channels by hand would break it.
 * Keyed by the rule id of the earlier jump.
 */
export const supersededFlags = (chain: readonly Manifest[]): Set<string> => {
  const ids = new Set<string>();
  for (let i = 0; i + 1 < chain.length; i++) {
    const next = chain[i + 1]!;
    const colors = new Set(next.global.colorTokens?.names ?? []);
    const renamedToColor = new Set<string>();
    for (const component of Object.values(next.components))
      for (const rule of component.rules)
        if (rule.kind === 'cssVarRename' && colors.has(rule.to)) renamedToColor.add(rule.from);
    for (const component of Object.values(chain[i]!.components))
      for (const rule of component.rules)
        if (rule.kind === 'cssVarRename' && rule.valueFormatChanged && renamedToColor.has(rule.to))
          ids.add(ruleId(component.tag, rule));
  }
  return ids;
};
