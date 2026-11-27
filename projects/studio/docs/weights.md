# Weights

Stage 2: the weights of the preset, one mode at a time, balanced with the product in view.

Address: `#/weights` (alias `#/colors/semantic-surface`, the Semantic surface page it was).

**Weights** (`src/features/weights/`, `#/weights`; Semantic surface until #1403) is the second
stage: the weights of the preset, the `theme` block of the configuration (`src/engine/weights.ts`),
balanced with the product in view (chosen on its render, vittorio, 2026-11-27). Its head holds the
tabs Light and Dark, one mode at a time; then the pairs the weights of that mode touch
(`touchedCellsOfWeights`); then the surfaces and the borders, a slider per role in the mode of the
tab, each role named with what it is for (`src/shared/ui/role-purposes.ts`), and the texts, one
APCA target for both modes as the
engine holds them, each with the floor of the gate beside it. Beside, the scene of the product:
the base theme of the preset, whose surfaces are the whole page, in the mode of the tab. Which
families generate surfaces is not here: it is the switch of a family (Colours) and of a group
(Groups). It is built as Magma says today, without `mds-preview`, until epic #1487 lands.

In each mode the surfaces keep their order of depth, sunken <= muted <= default <= raised <=
overlay, equal levels allowed (vittorio, 2026-11-27): a slider moved past its neighbour pushes it
along, up or down (`pushSurfaces` of `src/engine/weights.ts`, `setSurfaceLevel` of
`src/state/surfaces.ts`), so the stage never writes a preset out of order, and a preset loaded out
of order shows a warning banner that names the surfaces out of place (`surfaceOrderProblems`).
