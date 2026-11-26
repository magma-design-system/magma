import type { JSX } from 'preact';
import { useMemo } from 'preact/hooks';
import chroma from 'chroma-js';
import initialConfigJson from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json';
import {
  createColorTokens,
  type MagmaConfig,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { plural, useT } from '../../shared/i18n/i18n.js';
import { IT_DIFFS } from './i18n-it.js';
import './diffs.css';

/*
  The Diffs page (#1401, out of diff.tsx; the bar takes it over in #1402): the palette generated
  from the edited configuration against the one generated from the committed configuration
  (.magma-design-tokensrc.json, bundled at build time). The generated token files under
  tokens/color are build artifacts and not committed, so the committed configuration is the
  stable baseline. Written in the classes of Magma (src/tailwind.css); its sheet keeps the steps,
  which are data.
*/

/** The translator of the page: its own Italian (i18n-it.ts), then the studio's. */
const useDiffsT = () => useT(IT_DIFFS);

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

// one mode of a colour: its label, then its steps. The steps are data, each in its own colour
// inline; a changed step is ringed twice, so the ring reads on a light step and on a dark one
function DiffRow({ label, cells }: { label: string; cells: DiffCell[] }) {
  const t = useDiffsT();
  return (
    <div class="contents">
      <mds-text typography="caption" tag="p" class="text-fg-muted">
        {label}
      </mds-text>
      <div class="flex gap-inline">
        {cells.map((cell) => (
          <div
            class={cell.changed ? 'diffs-step diffs-step-changed' : 'diffs-step'}
            style={{ background: cell.value }}
            title={
              cell.changed
                ? cell.from
                  ? `${t('{step}: {from} to {to}', { step: cell.step, from: cell.from, to: cell.value })}${cell.deltaE !== undefined ? ` (\u0394E ${cell.deltaE.toFixed(1)})` : ''}`
                  : t('{step}: added ({value})', { step: cell.step, value: cell.value })
                : t('{step}: {value} (unchanged)', { step: cell.step, value: cell.value })
            }
          />
        ))}
      </div>
    </div>
  );
}

// the badge of a colour: how far it moved when it changed, a diff's own colours when it is new or
// gone (added green, removed red, changed amber)
const BADGE_VARIANT: Record<ColorDiff['status'], JSX.IntrinsicElements['mds-badge']['variant']> = {
  changed: 'warning',
  new: 'success',
  removed: 'error',
};

export function DiffView({ config }: { config: MagmaConfig }) {
  const t = useDiffsT();
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

  if (error) return <mds-banner variant="error">{error}</mds-banner>;

  const changed = diffs.filter((d) => d.status === 'changed').length;
  const added = diffs.filter((d) => d.status === 'new').length;
  const removed = diffs.filter((d) => d.status === 'removed').length;

  return (
    <div class="grid gap-between-containers">
      <mds-text typography="detail" tag="p" class="max-w-text text-fg-muted">
        {t(
          'Differences between the current palette and the one generated from the committed configuration. Changed steps are outlined; the badge shows the largest perceptual distance (deltaE) across the color.',
        )}
      </mds-text>
      <mds-text typography="detail" tag="p" role="status">
        {diffs.length === 0
          ? t('No differences from the committed configuration.')
          : t('{changed} changed, {added} new, {removed} removed', { changed, added, removed })}
      </mds-text>
      {diffs.map((d) => (
        <mds-card key={d.path}>
          <mds-card-header>
            <mds-text typography="part" tag="h2">
              {d.path}
            </mds-text>
            <mds-badge
              variant={BADGE_VARIANT[d.status]}
              tone="weak"
              label={
                d.status === 'new'
                  ? t('new')
                  : d.status === 'removed'
                    ? t('removed')
                    : `\u0394E ${d.maxDeltaE.toFixed(1)} - ${plural(t, d.changedCount, '{count} step', '{count} steps')}`
              }
            />
          </mds-card-header>
          <mds-card-content>
            <div class="grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-inline">
              <DiffRow label={t('light')} cells={d.light} />
              <DiffRow label={t('dark')} cells={d.dark} />
            </div>
          </mds-card-content>
        </mds-card>
      ))}
    </div>
  );
}
