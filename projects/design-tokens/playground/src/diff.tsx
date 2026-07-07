import { useMemo } from 'preact/hooks';
import chroma from 'chroma-js';
import initialConfigJson from '../../.magma-design-tokensrc.json';
import { createColorTokens, type MagmaConfig } from '../../src/lib/color.mjs';

// The diff compares the palette generated from the edited config against the
// one generated from the committed configuration (.magma-design-tokensrc.json,
// bundled at build time). The generated token files under tokens/color are
// build artifacts and not committed, so the committed config is the stable
// baseline.

type StepMap = Record<string, { value: string }>;
interface Modes {
  light?: StepMap;
  dark?: StepMap;
}
type ColorTree = Record<string, Record<string, Modes>>;

interface DiffCell {
  step: string;
  value: string;
  from?: string;
  deltaE?: number;
  changed: boolean;
}

interface ColorDiff {
  path: string;
  label: string;
  status: 'changed' | 'new' | 'removed';
  maxDeltaE: number;
  changedCount: number;
  light: DiffCell[];
  dark: DiffCell[];
}

function paletteOf(config: MagmaConfig): ColorTree {
  return createColorTokens(config).tokens.color as unknown as ColorTree;
}

function diffMode(
  base: StepMap | undefined,
  curr: StepMap | undefined,
): { cells: DiffCell[]; changed: number; maxDeltaE: number } {
  // union of step keys, following the current order when present
  const keys = curr ? Object.keys(curr) : Object.keys(base ?? {});
  let changed = 0;
  let maxDeltaE = 0;
  const cells = keys.map((step): DiffCell => {
    const to = curr?.[step]?.value ?? '';
    const from = base?.[step]?.value;
    const isChanged = from === undefined || !to || from.toLowerCase() !== to.toLowerCase();
    const deltaE = from && to ? chroma.deltaE(from, to) : undefined;
    if (isChanged) {
      changed += 1;
      if (deltaE && deltaE > maxDeltaE) maxDeltaE = deltaE;
    }
    return { step, value: to || from || '#000000', from, deltaE, changed: isChanged };
  });
  return { cells, changed, maxDeltaE };
}

function diffColor(
  base: Modes | undefined,
  curr: Modes | undefined,
): Omit<ColorDiff, 'path' | 'label'> {
  const light = diffMode(base?.light, curr?.light);
  const dark = diffMode(base?.dark, curr?.dark);
  const changedCount = light.changed + dark.changed;
  const status: ColorDiff['status'] = !base ? 'new' : !curr ? 'removed' : 'changed';
  return {
    status,
    changedCount,
    maxDeltaE: Math.max(light.maxDeltaE, dark.maxDeltaE),
    light: light.cells,
    dark: dark.cells,
  };
}

function DiffRow({ label, cells }: { label: string; cells: DiffCell[] }) {
  return (
    <div class="diff-row">
      <span class="scale-label">{label}</span>
      <div class="diff-cells">
        {cells.map((cell) => (
          <div
            class={`diff-cell${cell.changed ? ' changed' : ''}`}
            style={{ background: cell.value }}
            title={
              cell.changed
                ? cell.from
                  ? `${cell.step}: ${cell.from} to ${cell.value}${cell.deltaE !== undefined ? ` (deltaE ${cell.deltaE.toFixed(1)})` : ''}`
                  : `${cell.step}: added (${cell.value})`
                : `${cell.step}: ${cell.value} (unchanged)`
            }
          />
        ))}
      </div>
    </div>
  );
}

export function DiffView({ config }: { config: MagmaConfig }) {
  const baseline = useMemo(() => paletteOf(initialConfigJson as unknown as MagmaConfig), []);
  const [current, error] = useMemo<[ColorTree | null, string | null]>(() => {
    try {
      return [paletteOf(config), null];
    } catch (e) {
      return [null, e instanceof Error ? e.message : String(e)];
    }
  }, [JSON.stringify(config)]);

  const diffs = useMemo<ColorDiff[]>(() => {
    if (!current) return [];
    const groups = [...new Set([...Object.keys(baseline), ...Object.keys(current)])];
    const out: ColorDiff[] = [];
    for (const group of groups) {
      const names = [
        ...new Set([...Object.keys(baseline[group] ?? {}), ...Object.keys(current[group] ?? {})]),
      ];
      for (const name of names) {
        const d = diffColor(baseline[group]?.[name], current[group]?.[name]);
        if (d.status !== 'changed' || d.changedCount > 0) {
          out.push({ ...d, path: `${group}.${name}`, label: name });
        }
      }
    }
    return out;
  }, [baseline, current]);

  if (error) return <div class="preview-error">{error}</div>;

  const changed = diffs.filter((d) => d.status === 'changed').length;
  const added = diffs.filter((d) => d.status === 'new').length;
  const removed = diffs.filter((d) => d.status === 'removed').length;

  return (
    <div class="diff-view">
      <p class="scales-hint">
        Differences between the current palette and the one generated from the committed
        configuration. Changed steps are outlined; the badge shows the largest perceptual distance
        (deltaE) across the color.
      </p>
      <div class="diff-summary">
        {diffs.length === 0 ? (
          <span>No differences from the committed configuration.</span>
        ) : (
          <span>
            {changed} changed, {added} new, {removed} removed
          </span>
        )}
      </div>
      {diffs.map((d) => (
        <div class="scale-card diff-card">
          <div class="scale-card-head">
            <h3 class="group-title">{d.path}</h3>
            <span class={`diff-badge diff-${d.status}`}>
              {d.status === 'new'
                ? 'new'
                : d.status === 'removed'
                  ? 'removed'
                  : `deltaE ${d.maxDeltaE.toFixed(1)} - ${d.changedCount} step${d.changedCount === 1 ? '' : 's'}`}
            </span>
          </div>
          <DiffRow label="light" cells={d.light} />
          <DiffRow label="dark" cells={d.dark} />
        </div>
      ))}
    </div>
  );
}
