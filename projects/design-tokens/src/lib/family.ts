/**
 * The family of a ramp as the generated groups key it: a ramp keeps its group (`variant-primary`,
 * `status-error`), the groups the engine derives from it drop it (`--wash-primary-*`,
 * `--text-error-*`, `--emphasis-primary-*`), as `familyOf` of `surface.mts` does from the name of
 * the color (`variant.primary`). The group is the first segment: no group name has a dash.
 */
export const familyOfRamp = (ramp: string): string => ramp.slice(ramp.indexOf('-') + 1);
