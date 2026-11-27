// The groups of families the studio treats apart (out of surfaces.tsx, #1399): read by the switch
// of the surfaces of a family (Colours) and of a group (Groups), the Themes page and the CSS of the
// scene.

/**
 * Groups RESERVED to the status messages: the group of the `status-*` families the
 * coloured hues of semantic.config.ts (`hues`) draw from. Their families MUST
 * generate surfaces, shown checked and locked: a status component (banner, toast,
 * badge) paints text on its own tinted background, and that pair only has a contrast
 * guarantee when the family carries generated `--text-*` roles (text-role picks the
 * step against the WORST of the family's surfaces). Left optional, a status family
 * would fall back to hand-picked ramp steps in each component - which is what it does
 * today. And they never become a theme (themes.ts): a theme repaints the whole
 * interface, so a page painted in a status colour would mix with the messages that
 * colour carries. Every other group, one created in the studio included, can be one.
 */
export const RESERVED_GROUPS = new Set(['status']);

/**
 * Groups that never generate surfaces: `variant` holds the alias-only accent families
 * (constraint A3, issue #613), references that re-export the ramp of their source, so neither
 * the group nor its families offer the switch.
 */
export const NO_SURFACE_GROUPS = new Set(['variant']);
