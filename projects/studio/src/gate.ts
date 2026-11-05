import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { createColorTokens } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import {
  applyBaseline,
  gatePairs,
  type Baseline,
  type ColorTree,
} from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js';
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config';
import baselineFile from '@maggioli-design-system/design-tokens/contrast-baseline.json';

/** What the contrast gate says of a configuration, in one line: the badge of the Colors menu. */
export type GateVerdict =
  | { state: 'pass'; accepted: number }
  | { state: 'fail'; violations: number }
  | { state: 'error'; message: string };

/**
 * The verdict of the APCA gate on a configuration (#698): the pairs `nx run
 * design-tokens:contrast` measures (`gatePairs`, the base layer and every named theme), judged
 * against the baseline of design-tokens as the CI judges them. `pass` counts the known offenders
 * the baseline accepts; `fail` the enforced pairs below their target and not accepted, the ones
 * that would fail the build.
 */
export function gateVerdict(config: MagmaConfig): GateVerdict {
  try {
    const { tokens } = createColorTokens(JSON.parse(JSON.stringify(config)) as MagmaConfig);
    const tree = (tokens as { color: ColorTree }).color;
    const { base, themes } = gatePairs(tree, semantic, semantic.themes);
    const results = [...base, ...themes.flatMap((theme) => theme.results)];
    const baseline = ((baselineFile as { pairs?: Baseline }).pairs ?? {}) as Baseline;
    const outcome = applyBaseline(results, baseline);
    return outcome.violations.length
      ? { state: 'fail', violations: outcome.violations.length }
      : { state: 'pass', accepted: outcome.baselinedFailures.length };
  } catch (error) {
    return { state: 'error', message: error instanceof Error ? error.message : String(error) };
  }
}
