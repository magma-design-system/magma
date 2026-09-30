/**
 * Explicit contrast-formula bounds (issue #578, A5).
 *
 * The usable range of each contrast formula was previously implicit, so a ratio
 * target above the ceiling (like the `tone` scale's `115`) silently clamped to a
 * pure extreme with no warning. These constants make the bounds explicit and are
 * the single source of truth shared by the generator (ratio validation) and the
 * APCA gate (A3, issue #575) - no duplicated magic numbers.
 *
 * APCA Lc has a hard range of ~0 to ~106 (normal polarity; ~-108 reverse - Magma
 * flips the sign in dark). Below ~Lc 8 APCA reports 0 (a low-contrast dead zone).
 * WCAG2 ratios range 1 to 21.
 */

export type ContrastFormula = 'wcag2' | 'wcag3';

export interface ContrastBounds {
  /** Lowest meaningful target. */
  min: number;
  /** Highest reachable target; above this the step clamps to the pure extreme. */
  max: number;
  /** APCA only: below this Lc the formula reports 0 (dead zone). */
  lowClamp?: number;
  /** APCA only: soft ceiling; targets above this sit very close to the extreme. */
  nearMax?: number;
}

export const CONTRAST_RANGE: Record<ContrastFormula, ContrastBounds> = {
  wcag2: { min: 1, max: 21 },
  // Lc magnitude; the sign is flipped in dark mode
  wcag3: { min: 0, lowClamp: 8, nearMax: 100, max: 106 },
};

export type RatioIssueKind = 'above-max' | 'near-max' | 'dead-zone' | 'below-min';

/**
 * `warn`  = out-of-range: the step clamps to a pure extreme or collapses to the
 *           background (genuinely broken). resolveRatios logs these.
 * `info`  = near-ceiling: reachable but very close to the extreme. Surfaced by
 *           the playground band, not logged (would be noisy on normal scales).
 */
export type RatioIssueSeverity = 'warn' | 'info';

export interface RatioIssue {
  index: number;
  value: number;
  kind: RatioIssueKind;
  severity: RatioIssueSeverity;
  message: string;
}

/** Classify a single ratio target against a formula's bounds; null if in range. */
export function classifyRatioTarget(
  value: number,
  formula: ContrastFormula,
): Omit<RatioIssue, 'index'> | null {
  const bounds = CONTRAST_RANGE[formula];

  if (value > bounds.max) {
    return {
      value,
      kind: 'above-max',
      severity: 'warn',
      message: `target ${value} is above the ${formula} ceiling (${bounds.max}); it clamps to the pure extreme`,
    };
  }
  if (value < bounds.min) {
    return {
      value,
      kind: 'below-min',
      severity: 'warn',
      message: `target ${value} is below the ${formula} floor (${bounds.min})`,
    };
  }
  if (bounds.lowClamp !== undefined && value > bounds.min && value < bounds.lowClamp) {
    return {
      value,
      kind: 'dead-zone',
      severity: 'warn',
      message: `target ${value} is below the APCA low-contrast clamp (${bounds.lowClamp}); it collapses toward the background`,
    };
  }
  if (bounds.nearMax !== undefined && value > bounds.nearMax && value <= bounds.max) {
    return {
      value,
      kind: 'near-max',
      severity: 'info',
      message: `target ${value} is near the APCA ceiling (${bounds.max}); the step sits very close to the pure extreme`,
    };
  }
  return null;
}

/** Classify every target in a ratio scale; empty when all are in range. */
export function validateRatioScale(scale: number[], formula: ContrastFormula): RatioIssue[] {
  const issues: RatioIssue[] = [];
  scale.forEach((value, index) => {
    const issue = classifyRatioTarget(value, formula);
    if (issue !== null) issues.push({ index, ...issue });
  });
  return issues;
}
