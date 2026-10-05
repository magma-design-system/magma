/**
 * The colour table category L measures against (see
 * `scripts/build-semantic-table.ts`, which generates `semantic.generated.ts`).
 * Every value is an sRGB triple, light then dark, as the default theme paints it.
 */
export type Rgb = readonly [number, number, number];

/** Which utilities a semantic role may be offered to. */
export type SemanticChannel = 'background' | 'foreground' | 'border';

export interface SemanticRole {
  channel: SemanticChannel;
  /** `neutral`, `accent`, `accent-ai`, `info`, `success`, `warning`, `danger`. */
  hue: string;
  light: Rgb;
  dark: Rgb;
}

export interface SemanticTable {
  /** v2 raw palette colours, keyed by utility colour name: `tone-neutral-09`. */
  primitives: Record<string, readonly [Rgb, Rgb]>;
  /** Semantic roles of the Tailwind bridge, keyed by utility colour name: `surface-raised`. */
  roles: Record<string, SemanticRole>;
  /** v1 colours with no v2 utility (`tone-slate-08`, `brand-mindy-03`), with their v1 values. */
  removed: Record<string, readonly [Rgb, Rgb]>;
}
