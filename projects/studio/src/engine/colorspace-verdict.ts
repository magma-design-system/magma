import type {
  ColorConfig,
  MagmaConfig,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import {
  gradeRamps,
  measureRamp,
  type RampGrade,
  type RampVerdict,
} from '@maggioli-design-system/design-tokens/src/lib/ramp-grade.mjs';
import { COLORSPACES } from '@maggioli-design-system/design-tokens/src/lib/schema.mjs';
// the icons of the verdict, the ones mds-usage of Magma pairs with do, warn and dont: inlined at
// build time, so the icon is drawn with the message, with no request to the icon folder
import iconOk from '@material-icons/svg/svg/check_circle/baseline.svg?raw';
import iconWarning from '@material-icons/svg/svg/warning/baseline.svg?raw';
import iconError from '@material-icons/svg/svg/cancel/baseline.svg?raw';
import { generateScales, singleColorConfig } from './generator.js';
import type { T } from '../shared/i18n/text.js';

/** How a field stands, as mds-input-field takes it (its `variant`). */
type FieldVariant = 'error' | 'warning' | 'success';

/*
  How the colorspace of a family holds its seed, said in the message of its Colorspace field
  (#1454, vittorio 2026-11-18: in the message of the field, the reason with the mark). The ramp is
  the one the engine builds for the family in light and dark, with its colorspace and its smooth,
  own or inherited, and its saturation curve, which corrects exactly the saturation a colorspace
  loses; without the hue shift, a turn of the hue set on purpose (ramp-grade.mts measures and
  grades). When it does not pass, the colorspace that holds this colour best is named, graded the
  same way with the same smooth.
*/

export interface ColorspaceVerdict {
  variant: FieldVariant;
  /** The icon before the label of the field, an SVG mds-icon draws as it is. */
  icon: string;
  /** The lines of the message, joined by `;`: mds-input-field draws one line each. */
  message: string;
  /** The grade of the ramp in each colorspace, for the marks of the options of the select. */
  grades: Record<string, RampGrade>;
}

const VARIANT: Record<RampGrade, FieldVariant> = {
  ok: 'success',
  warning: 'warning',
  error: 'error',
};

const ICON: Record<RampGrade, string> = { ok: iconOk, warning: iconWarning, error: iconError };

const RANK: Record<RampGrade, number> = { ok: 0, warning: 1, error: 2 };

// the configuration and the family with no hue shift: a turn of the hue set on purpose is no
// fault of the colorspace
function withoutHueShift(config: MagmaConfig, family: ColorConfig): [MagmaConfig, ColorConfig] {
  const bare = { ...config };
  const own = { ...family };
  delete bare.hueShift;
  delete own.hueShift;
  return [bare, own];
}

/** The verdict of the ramps of a family, or the message of the engine when it cannot build them. */
function verdictOf(config: MagmaConfig, family: ColorConfig): RampVerdict {
  const [bare, own] = withoutHueShift(config, family);
  const scales = generateScales(singleColorConfig(bare, own)).get(family.name);
  if (!scales) throw new Error(`no ramp for ${family.name}`);
  return gradeRamps(
    [scales.light, scales.dark].map((ramp) =>
      measureRamp(
        ramp.map((step) => step.value),
        family.color,
      ),
    ),
  );
}

const percent = (share: number) => Math.round(share * 100);
const degrees = (value: number) => Math.round(value);

/** The colorspace of a family, its own or the one of the configuration, as the engine resolves it. */
export function colorspaceOf(config: MagmaConfig, family: ColorConfig): string {
  return family.colorspace ?? config.colorspace ?? 'HSL';
}

/**
 * The mark of each grade before the name of a colorspace in its select (an option is text, no
 * icon): the marks vittorio proposed on 2026-11-18, a tick, a warning sign, a no-entry sign.
 */
export const MARK: Record<RampGrade, string> = {
  ok: '\u2705',
  warning: '\u26a0\ufe0f',
  error: '\u26d4',
};

/** The verdict of the ramps of a family in every colorspace, with its smooth; null where the engine cannot build them. */
function verdictsOf(config: MagmaConfig, family: ColorConfig): Map<string, RampVerdict | null> {
  const verdicts = new Map<string, RampVerdict | null>();
  for (const space of COLORSPACES) {
    try {
      verdicts.set(
        space,
        verdictOf(config, { ...family, colorspace: space as ColorConfig['colorspace'] }),
      );
    } catch {
      verdicts.set(space, null);
    }
  }
  return verdicts;
}

/** The verdict on the colorspace of a family with a colour of its own; none for a reference. */
export function colorspaceVerdict(
  t: T,
  config: MagmaConfig,
  family: ColorConfig,
): ColorspaceVerdict | null {
  if (family.alias || !family.color) return null;
  const verdicts = verdictsOf(config, family);
  // the grade of every colorspace for the marks of the select: one the engine cannot build fails
  const grades = Object.fromEntries(
    [...verdicts].map(([space, verdict]) => [space, verdict?.grade ?? 'error']),
  ) as Record<string, RampGrade>;

  // the colorspace chosen is one of them: built again only when it failed, for the message of the
  // engine
  let verdict: RampVerdict;
  try {
    verdict = verdicts.get(colorspaceOf(config, family)) ?? verdictOf(config, family);
  } catch (error) {
    return {
      variant: 'error',
      icon: ICON.error,
      grades,
      message: t('The engine cannot build this ramp: {error}', {
        error: String((error as Error).message ?? error).replaceAll(';', ','),
      }),
    };
  }

  const { grade, hue, saturation } = verdict;
  if (grade === 'ok') {
    const parts = [
      ...(hue
        ? [t('the hue turns {degrees} degrees at most', { degrees: degrees(hue.degrees) })]
        : []),
      ...(saturation
        ? [
            t('every step keeps {share}% of the saturation of the seed or more', {
              share: percent(saturation.share),
            }),
          ]
        : []),
    ];
    return {
      variant: 'success',
      icon: ICON.ok,
      grades,
      message: parts.length
        ? t('The ramp holds the seed: {parts}', { parts: parts.join(', ') })
        : t('A grey seed: the ramp has no hue nor saturation to lose'),
    };
  }

  const lines: string[] = [];
  if (hue && hue.grade !== 'ok')
    lines.push(
      hue.side === 'dark'
        ? t('The hue turns {degrees} degrees in the dark steps', { degrees: degrees(hue.degrees) })
        : t('The hue turns {degrees} degrees in the light steps', {
            degrees: degrees(hue.degrees),
          }),
    );
  if (saturation && saturation.grade !== 'ok')
    lines.push(
      saturation.side === 'dark'
        ? t('The dark steps keep {share}% of the saturation of the seed', {
            share: percent(saturation.share),
          })
        : t('The light steps keep {share}% of the saturation of the seed', {
            share: percent(saturation.share),
          }),
    );

  // the colorspace that holds this colour best: the best grade, then the smaller hue turn, then
  // the more saturation kept; named only when it grades better than the one chosen
  const current = colorspaceOf(config, family);
  let best: { space: string; verdict: RampVerdict } | null = null;
  for (const [space, candidate] of verdicts) {
    if (space === current || candidate === null) continue;
    if (
      best === null ||
      RANK[candidate.grade] < RANK[best.verdict.grade] ||
      (RANK[candidate.grade] === RANK[best.verdict.grade] &&
        (candidate.hue?.degrees ?? 0) - (candidate.saturation?.share ?? 1) * 100 <
          (best.verdict.hue?.degrees ?? 0) - (best.verdict.saturation?.share ?? 1) * 100)
    )
      best = { space, verdict: candidate };
  }
  if (best && RANK[best.verdict.grade] < RANK[grade])
    lines.push(t('{space} holds this colour better', { space: best.space }));

  return { variant: VARIANT[grade], icon: ICON[grade], grades, message: lines.join(';') };
}
