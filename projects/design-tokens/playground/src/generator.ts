import chroma from 'chroma-js';
import { createColorTokens, type ColorConfig, type MagmaConfig } from '../../src/lib/color.mjs';

export interface Step {
  value: string;
  /** achieved WCAG 2.x contrast ratio against the theme background */
  contrast: number;
}

export interface ColorScales {
  light: Step[];
  dark: Step[];
  lightColor?: string;
  darkColor?: string;
}

function wcag2Contrast(hex: string, background: 'white' | 'black'): number {
  const lum = chroma(hex).luminance();
  const bgLum = background === 'white' ? 1 : 0;
  const lighter = Math.max(lum, bgLum);
  const darker = Math.min(lum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}

function toSteps(
  palette: Record<string, { value: string }>,
  background: 'white' | 'black',
): Step[] {
  return Object.keys(palette)
    .filter((key) => key !== 'color')
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => ({
      value: palette[key].value,
      contrast: wcag2Contrast(palette[key].value, background),
    }));
}

/**
 * Run the real token generator on a config and index the scales by color
 * name. Pass a single-color config for fast per-keystroke previews.
 */
export function generateScales(config: MagmaConfig): Map<string, ColorScales> {
  const result = new Map<string, ColorScales>();
  const { tokens } = createColorTokens(config);
  const colorRoot = tokens.color as Record<
    string,
    Record<
      string,
      {
        light: Record<string, { value: string }>;
        dark: Record<string, { value: string }>;
      }
    >
  >;
  Object.keys(colorRoot).forEach((group) => {
    Object.keys(colorRoot[group]).forEach((name) => {
      const entry = colorRoot[group][name];
      result.set(`${group}.${name}`, {
        light: toSteps(entry.light, 'white'),
        dark: toSteps(entry.dark, 'black'),
        lightColor: entry.light.color?.value,
        darkColor: entry.dark.color?.value,
      });
    });
  });
  return result;
}

/** Config containing only the given color, for fast live preview. */
export function singleColorConfig(config: MagmaConfig, color: ColorConfig): MagmaConfig {
  return { ...config, colors: [color] };
}
