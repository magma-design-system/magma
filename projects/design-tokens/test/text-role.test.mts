import { APCAcontrast, sRGBtoY } from "apca-w3";
import chroma from "chroma-js";
import { expect, test } from "vitest";

import { createTextTokens, TEXT_ROLES } from "../src/lib/text-role.mjs";
import { createColorTokens, type MagmaConfig, type ColorTokensMap } from "../src/lib/color.mjs";
import { getColorsConfig } from "../src/lib/utils.mjs";
import {
  aliasesFromConfig,
  DEFAULT_TARGETS,
  evaluatePairs,
  type ColorTree,
} from "../src/lib/contrast-gate.js";
import { WASH_STEPS } from "../src/lib/wash.js";
import { semantic } from "../semantic.config.js";

const apca = (fg: string, bg: string) =>
  Math.abs(APCAcontrast(sRGBtoY(chroma(fg).rgb()), sRGBtoY(chroma(bg).rgb())) as number);

// A synthetic tree: black..white tone ramp on a white default surface, so higher
// step number = lighter = lower contrast on white.
const ramp = ["#000000", "#1a1a1a", "#333333", "#4d4d4d", "#666666", "#808080", "#999999", "#b3b3b3", "#cccccc", "#e6e6e6"];
const mockTree = {
  tone: {
    neutral: {
      light: Object.fromEntries(ramp.map((v, i) => [String(i + 1), { value: v }])),
      dark: Object.fromEntries(ramp.map((v, i) => [String(i + 1), { value: v }])),
    },
  },
  surface: {
    neutral: { light: { default: { value: "#ffffff" } }, dark: { default: { value: "#ffffff" } } },
  },
};
const withText = (text: unknown): MagmaConfig =>
  ({ colors: [], theme: { text } } as unknown as MagmaConfig);

test("no theme.text -> emits nothing", () => {
  expect(createTextTokens({ colors: [] } as unknown as MagmaConfig, mockTree)).toEqual({ text: {} });
});

test("by-target picks the least-contrast step that still meets the target", () => {
  const { text } = createTextTokens(withText({ default: 85, muted: 60, subtle: 45, disabled: 30 }), mockTree);
  const light = text.neutral.light;
  // every role meets its target on the white surface
  expect(apca(light.default.value, "#ffffff")).toBeGreaterThanOrEqual(85);
  expect(apca(light.muted.value, "#ffffff")).toBeGreaterThanOrEqual(60);
  expect(apca(light.subtle.value, "#ffffff")).toBeGreaterThanOrEqual(45);
  expect(apca(light.disabled.value, "#ffffff")).toBeGreaterThanOrEqual(30);
  // monotonic de-emphasis: default darkest, disabled lightest
  const lc = (r: keyof typeof light) => apca(light[r].value, "#ffffff");
  expect(lc("default")).toBeGreaterThan(lc("muted"));
  expect(lc("muted")).toBeGreaterThan(lc("subtle"));
  expect(lc("subtle")).toBeGreaterThan(lc("disabled"));
});

test("an explicit { step } override wins over the target search", () => {
  const { text } = createTextTokens(withText({ default: 85, muted: { step: 2 }, subtle: 45, disabled: 30 }), mockTree);
  expect(text.neutral.light.muted.value).toBe(ramp[1]); // step 2
});

test("an unreachable target clamps to the strongest step (no throw)", () => {
  const { text } = createTextTokens(withText({ default: 200, muted: 75, subtle: 45, disabled: 30 }), mockTree);
  expect(text.neutral.light.default.value).toBe(ramp[0]); // step 1, max contrast
});

test("integration: the real palette generates text roles meeting their targets in both modes", async () => {
  const rc = await getColorsConfig();
  const color = (createColorTokens(rc!.config as MagmaConfig).tokens as { color: ColorTokensMap }).color;
  const targets: Record<string, number> = { default: 85, muted: 75, subtle: 45, disabled: 30 };

  expect(color.text?.neutral).toBeDefined();
  for (const mode of ["light", "dark"] as const) {
    const refSurface = color.surface.neutral[mode].default.value;
    for (const role of TEXT_ROLES) {
      const value = color.text.neutral[mode][role].value;
      expect(apca(value, refSurface), `${role} (${mode})`).toBeGreaterThanOrEqual(targets[role]);
    }
  }
})

// A text sits on the washes of its family too (a banner, a badge, a chip): steps of its own ramp,
// not surfaces, so they do not follow theme.surfaces (#1414).
const washOf = (level: keyof typeof WASH_STEPS) => ramp[Number(WASH_STEPS[level]) - 1];

test("a role keeps the floor of the gate on the washes of its family, not only on its surfaces", () => {
  // white surfaces: the surfaces alone take the lightest step that meets the target on white
  const { text } = createTextTokens(withText({ default: 60, muted: 60, subtle: 45, disabled: 30 }), mockTree);
  const light = text.neutral.light;
  const onSurfacesOnly = ramp.filter((value) => apca(value, "#ffffff") >= 60).at(-1)!;
  // wash-soft carries the whole ladder, wash-base text-default (spec 9.1)
  expect(apca(light.muted.value, washOf("soft"))).toBeGreaterThanOrEqual(DEFAULT_TARGETS.text.muted);
  expect(apca(light.default.value, washOf("base"))).toBeGreaterThanOrEqual(DEFAULT_TARGETS.text.default);
  // the wash binds: a darker step than the surfaces alone would take
  expect(ramp.indexOf(light.muted.value)).toBeLessThan(ramp.indexOf(onSurfacesOnly));
});

test("integration: lighter surfaces keep every text over its floor on its own washes", async () => {
  const rc = await getColorsConfig();
  const config = structuredClone(rc!.config) as MagmaConfig;
  // the surfaces of the retune that found it (studio, 2026-11-13): solved on the surfaces alone,
  // the muted text of info, success, warning and danger fell 0.4 to 1.9 Lc under 75 on wash-soft
  const theme = config.theme as unknown as { surfaces: Record<string, Record<string, string>> };
  theme.surfaces = {
    light: { sunken: "95%", muted: "96%", default: "98%", raised: "99%", overlay: "100%" },
    dark: { sunken: "17%", muted: "19%", default: "27%", raised: "31%", overlay: "36%" },
  };
  const tree = (createColorTokens(config).tokens as { color: ColorTree }).color;
  const failing = evaluatePairs(tree, aliasesFromConfig(semantic))
    .filter((pair) => ["text-on-hue", "text-on-wash"].includes(pair.category))
    .filter((pair) => pair.severity === "error" && !pair.pass)
    .map((pair) => `${pair.key} ${pair.achieved}/${pair.target}`);
  expect(failing).toEqual([]);
});
