import chroma from "chroma-js";
import chalk from "chalk";
import { APCAcontrast, sRGBtoY } from "apca-w3";
import type { ColorTokenSet, MagmaConfig } from "./color.mjs";

/**
 * Text-role generation engine (issue #591, A7; spec:
 * projects/styles/SEMANTIC_COLOR_SPEC.md sections 5 and 9).
 *
 * Text roles are the FOREGROUND side of the theme, so - unlike surfaces, which
 * are placed by lightness (surface.mts) - they are chosen BY CONTRAST TARGET,
 * consistent with the tone scale's own APCA philosophy (spec section 5:
 * foreground = contrast-driven, background = lightness-driven).
 *
 * For each opted-in family and mode, a role declares an APCA Lc target checked
 * against the family's WORST-CASE (lowest-contrast) surface; the engine picks the
 * LEAST-contrast tone step that still meets it there - so the role stays legible
 * on EVERY surface it can sit on, not just the canvas. This is more ergonomic for
 * a theme author than picking a raw step (state the legibility intent, not the
 * mechanism) and it survives surface retunes. An explicit `{ step }` override is
 * available for exact control.
 *
 * Output mirrors surface.mts (`family -> { light, dark } role sets`) so it slots
 * into `color.text` and ships as `--text-<family>-<role>`, flipping per mode
 * through the same css-vars templates. The semantic layer (A9) aliases these.
 */

export const TEXT_ROLES = ["default", "muted", "subtle", "disabled"] as const;
export type TextRole = (typeof TEXT_ROLES)[number];

/** A role target: an APCA Lc magnitude (default), or an explicit tone step 1..10. */
export type TextLevel = number | { step: number };
export type TextConfig = Record<TextRole, TextLevel>;

type Mode = "light" | "dark";
type StepSet = Record<string, { value: string }>;
/** The minimal slice of the built `tokens.color` tree this engine reads. */
type ColorTree = {
  tone?: Record<string, Record<Mode, StepSet>>;
  surface?: Record<string, Record<Mode, StepSet>>;
};

const apcaLc = (fg: string, bg: string): number =>
  Math.abs(APCAcontrast(sRGBtoY(chroma(fg).rgb()), sRGBtoY(chroma(bg).rgb())) as number);

/**
 * Pick the tone step for one role/mode. With an explicit `{ step }` it returns
 * that step; otherwise the least-contrast step whose APCA magnitude still meets
 * the target on the WORST-CASE surface - the surface giving the lowest contrast
 * for that step - so the role stays legible on EVERY surface it can land on, not
 * just the canvas. Clamps to the highest-contrast step (with a warning) when the
 * target is unreachable on some surface.
 */
function pickStep(
  tone: StepSet,
  refSurfaces: string[],
  level: TextLevel,
  family: string,
  role: TextRole,
  mode: Mode,
): string {
  if (typeof level === "object") {
    const value = tone[String(level.step)]?.value;
    if (!value) {
      throw new Error(`text-role: ${family}.${role} explicit step ${level.step} is out of range (1..10)`);
    }
    return value;
  }

  // a step's contrast is its WORST (minimum APCA) across all surfaces
  const worstLc = (value: string) => Math.min(...refSurfaces.map((surface) => apcaLc(value, surface)));
  const candidates = Array.from({ length: 10 }, (_, i) => String(i + 1))
    .map((step) => tone[step]?.value)
    .filter((value): value is string => Boolean(value))
    .map((value) => ({ value, lc: worstLc(value) }));

  const meeting = candidates.filter((c) => c.lc >= level).sort((a, b) => a.lc - b.lc);
  if (meeting.length > 0) return meeting[0].value;

  const strongest = [...candidates].sort((a, b) => b.lc - a.lc)[0];
  console.warn(
    chalk.yellow(
      `text-role: ${family}.${role} (${mode}) target Lc ${level} is unreachable on every surface ` +
        `(max ${strongest.lc.toFixed(0)}); clamping to the highest-contrast step.`,
    ),
  );
  return strongest.value;
}

export interface TextTokens {
  /** family -> { light, dark } role sets, ready to slot into `color.text` */
  text: Record<string, ColorTokenSet>;
}

/**
 * Generate text-role tokens for every family that has BOTH a tone scale (the
 * candidate steps) and a surface (the reference), using the `theme.text`
 * targets. Returns an empty map when `theme.text` is absent or no family
 * qualifies, so existing output stays byte-identical.
 */
export function createTextTokens(config: MagmaConfig, tree: ColorTree): TextTokens {
  const text: Record<string, ColorTokenSet> = {};

  const textConfig = config.theme?.text;
  if (!textConfig) return { text };

  const families = Object.keys(tree.surface ?? {}).filter((family) => tree.tone?.[family]);

  families.forEach((family) => {
    const buildMode = (mode: Mode): StepSet => {
      const tone = tree.tone![family][mode];
      // every surface the text can sit on; the worst (lowest-contrast) one binds
      const refSurfaces = Object.values(tree.surface![family][mode] ?? {})
        .map((s) => s.value)
        .filter(Boolean);
      if (refSurfaces.length === 0) {
        throw new Error(`text-role: no surfaces for family "${family}" (${mode})`);
      }
      const roleSet: StepSet = {};
      TEXT_ROLES.forEach((role) => {
        roleSet[role] = { value: pickStep(tone, refSurfaces, textConfig[role], family, role, mode) };
      });
      return roleSet;
    };

    console.info(`Creating ${chalk.green("text")} ${family}`);
    text[family] = { light: buildMode("light"), dark: buildMode("dark") };
  });

  return { text };
}
