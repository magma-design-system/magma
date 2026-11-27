import { useEffect, useMemo, useState } from 'preact/hooks';
import type {
  ColorConfig,
  Formula,
  GroupConfig,
  MagmaConfig,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import {
  resolveExport,
  resolveFormula,
  resolveRatiosName,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { COLORSPACES } from '@maggioli-design-system/design-tokens/src/lib/schema.mjs';
import { chromaticOrder, groupOf, groupsInOrder } from '../../engine/colour-order.js';
import { isAlias, MAGMA_STEPS, withoutSaturation } from '../../engine/families.js';
import { NO_SURFACE_GROUPS, RESERVED_GROUPS } from '../../engine/groups.js';
import { generateScales, singleColorConfig, type Step } from '../../engine/generator.js';
import { Check, Field, Select, TextInput } from '../../shared/magma/magma.js';
import { msg, plural, useT } from '../../shared/i18n/i18n.js';
import { HueShiftEditor } from '../../shared/ui/hue-shift-editor.js';
import { SaturationEditor } from '../../shared/ui/saturation-editor.js';
import { GateBadge } from '../../shared/ui/verdict.js';
import { hrefOf, scaleRoute } from '../../shared/routes/routes.js';
import { exportSelection, guard } from '../../state/exports.js';
import { setExports, updateGroup } from '../../state/groups.js';
import { selectFamily, setGlobal } from '../../state/palette.js';
import { scalesOf } from '../../state/scales.js';
import { toggleGroupSurface } from '../../state/surfaces.js';
import { useStudio } from '../../state/studio.js';
import { BatchExportModal } from './batch.js';
import { IT_GROUPS } from './i18n-it.js';
import './groups.css';

/*
  The view Groups (#1403; the Groups page until then, which stays: vittorio, 2026-11-27), outside
  the stages as the Theme section and the rules are: what the families inherit, decided where it is
  decided (studio.object-model.md, section 5, Gruppi). First the preset, the settings every family
  inherits (question 13 of the model); then each group, its families in chromatic order, its
  contrast scale with its badge and a link to its page, its formula and its export; families ticked
  across groups become an export group, saved in their `export` field or downloaded (list with
  filters, `act-on-many`): the place of the cases outside Magma, and of any family. A family is
  edited in Colours, which each row leads to.
*/

/** The export field of a group as the person writes it: comma-separated names. */
const parseExport = (text: string): string[] =>
  text
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

/** The light ramp of a family: data, each step its own colour inline. */
function Ramp({ steps }: { steps: Step[] }) {
  return (
    <span class="flex overflow-hidden rounded-sm">
      {steps.map((step) => (
        <span
          class="groups-step"
          style={{ background: step.value }}
          title={`${step.value} - ${step.contrast.toFixed(2)}:1`}
        />
      ))}
    </span>
  );
}

/** The light ramp of a family on a preset, or null where the generator refuses it. */
function lightRampOf(config: MagmaConfig, family: ColorConfig | undefined): Step[] | null {
  if (!family || isAlias(family)) return null;
  try {
    return generateScales(singleColorConfig(config, family)).get(family.name)?.light ?? null;
  } catch {
    return null;
  }
}

export function GroupsPage() {
  const t = useT(IT_GROUPS);
  const studio = useStudio();
  const config = studio.config.value;
  const report = studio.report.value;
  const selectedName = studio.selectedName.value;
  const generation = studio.generation.value;
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [batch, setBatch] = useState<{ names: string[]; initialExport: string } | null>(null);
  // when on, the ticked families are lifted into a section on top to compare them
  const [groupSelected, setGroupSelected] = useState(false);
  // the export picked in "Select by export": it acts once, then the select goes back to its
  // placeholder, so the same export can be picked again (a render of its own, after the pick)
  const [exportPick, setExportPick] = useState('');
  useEffect(() => {
    if (exportPick) setExportPick('');
  }, [exportPick]);

  const families = chromaticOrder(config.colors);
  const groups = groupsInOrder(families);
  const namesInOrder = (keep: (family: ColorConfig) => boolean) =>
    families.filter(keep).map((family) => family.name);
  const exportNames = [
    ...new Set(config.colors.flatMap((family) => resolveExport(family, config) ?? [])),
  ].sort();
  const toggle = (name: string) =>
    setSelected((was) => {
      const next = new Set(was);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  // the global curves drawn on the family in view, as Colours drew them
  const inView = config.colors.find((family) => family.name === selectedName);
  const after = useMemo(() => lightRampOf(config, inView), [config, selectedName]);
  const before = useMemo(() => {
    const flat = withoutSaturation(config);
    return lightRampOf(
      flat,
      flat.colors.find((family) => family.name === selectedName),
    );
  }, [config, selectedName]);

  // one family: its tick with its swatch and its name, a badge where it overrides its group, its
  // scale, formula and export, its light ramp, and the way to it in Colours
  const member = (family: ColorConfig) => {
    const groupConfig = config.groups?.[groupOf(family.name)] ?? {};
    const inheritedRatios = groupConfig.ratios ?? 'default';
    const inheritedFormula = groupConfig.formula ?? config.formula ?? 'wcag3';
    const inheritedExport = groupConfig.export ?? [];
    // a real override only: a field of the family whose value differs from what it inherits
    const overrides = [
      family.ratios !== undefined && family.ratios !== inheritedRatios
        ? `ratios: ${family.ratios}`
        : null,
      family.formula !== undefined && family.formula !== inheritedFormula
        ? `formula: ${family.formula}`
        : null,
      family.export !== undefined && family.export.join(',') !== inheritedExport.join(',')
        ? `export: ${family.export.join(', ')}`
        : null,
    ].filter(Boolean);
    const exports = family.export ?? groupConfig.export ?? [];
    const ramp = generation.scales?.get(family.name);
    // keyed by the name: mds-input-switch reads its accessible name from its text once
    return (
      <div class="contents" key={family.name}>
        <span class="flex items-center gap-inline">
          <Check checked={selected.has(family.name)} onChecked={() => toggle(family.name)}>
            <span class="inline-flex items-center gap-inline">
              <span class="studio-swatch" style={{ background: family.color }} />
              {family.name.split('.')[1]}
            </span>
          </Check>
          {overrides.length > 0 && (
            <mds-badge
              label={t('override')}
              variant="info"
              tone="weak"
              title={t('overrides the group: {overrides}', { overrides: overrides.join(', ') })}
            />
          )}
        </span>
        <mds-text typography="caption" tag="p" class="text-fg-muted">
          {resolveRatiosName(family, config)} - {resolveFormula(family, config)}
          {exports.length > 0 && ` - ${exports.join(', ')}`}
        </mds-text>
        <span class="flex items-center gap-inline">
          <span class="min-w-0 flex-1">{ramp && <Ramp steps={ramp.light} />}</span>
          <mds-button
            href={hrefOf({ section: 'colours' })}
            icon="mi/baseline/arrow-forward"
            variant="dark"
            tone="text"
            size="sm"
            aria-label={t('Open {name} in Colours', { name: family.name })}
            onClick={() => selectFamily(studio, family.name)}
          ></mds-button>
        </span>
      </div>
    );
  };

  const ticked = families.filter((family) => selected.has(family.name));
  const membersGrid =
    'grid grid-cols-[minmax(max-content,calc(var(--magma-width-form)/2))_minmax(0,calc(var(--magma-width-form)/2))_minmax(0,1fr)] items-center gap-x-between-fields gap-y-inline';

  return (
    <main class="h-full min-h-0 overflow-y-auto px-(--magma-width-page-gutter) pt-inset pb-between-sections">
      <div class="grid content-start gap-between-containers">
        <header class="mb-title-content grid gap-title-content">
          <div class="flex flex-wrap items-center gap-inline">
            <mds-text typography="page" tag="h1">
              {t('Groups')}
            </mds-text>
            <GateBadge verdict={report.verdict} />
          </div>
          <mds-text typography="detail" tag="p" class="max-w-text text-fg-muted">
            {t(
              'What the families inherit: the settings of the preset, then those of each group. Tick families across groups to export them together, the cases outside Magma among them.',
            )}
          </mds-text>
        </header>

        {/* the preset first: the settings every family inherits (question 13 of the model) */}
        <mds-card>
          <mds-card-header>
            <span class="flex flex-wrap items-baseline gap-inline">
              <mds-text typography="part" tag="h2" id="groups-preset">
                {t('The preset')}
              </mds-text>
              <mds-text typography="detail" tag="p" class="text-fg-muted">
                {t('What every family inherits when it does not set it.')}
              </mds-text>
            </span>
          </mds-card-header>
          <mds-card-content>
            <div class="grid gap-between-groups">
              <div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,calc(var(--magma-width-form)/2)),1fr))] items-start gap-between-fields">
                <Field label={t('Colorspace')}>
                  <Select
                    value={config.colorspace ?? 'HSL'}
                    options={COLORSPACES.map((space) => ({ value: space, label: space }))}
                    onValue={(colorspace) => setGlobal(studio, 'colorspace', colorspace)}
                  />
                </Field>
                <div class="flex min-h-1200 items-end">
                  <Check
                    type="switch"
                    checked={config.smooth ?? false}
                    onChecked={(checked) => setGlobal(studio, 'smooth', checked)}
                  >
                    {t('Smooth')}
                  </Check>
                </div>
              </div>
              <HueShiftEditor
                title={t('Global hue shifting')}
                value={config.hueShift}
                onChange={(hueShift) => setGlobal(studio, 'hueShift', hueShift)}
              />
              {/* the global curve, drawn on the family in view */}
              <SaturationEditor
                title={t('Global saturation')}
                id="palette-global-saturation"
                value={config.saturation}
                before={before}
                after={after}
                onChange={(saturation) => setGlobal(studio, 'saturation', saturation)}
              />
            </div>
          </mds-card-content>
        </mds-card>

        {/* the selection of the batch (list-with-filters, act-on-many): how many, then the action
            on them; the view of the selection and the selection by export follow */}
        <div class="flex flex-wrap items-end justify-between gap-between-fields">
          <div class="flex flex-wrap items-center gap-x-between-fields gap-y-inline">
            <mds-text typography="detail" tag="p" role="status">
              {t('{count} selected', { count: selected.size })}
            </mds-text>
            <mds-button
              type="button"
              variant="primary"
              tone="outline"
              disabled={selected.size === 0}
              onClick={() =>
                setBatch({
                  names: namesInOrder((family) => selected.has(family.name)),
                  initialExport: '',
                })
              }
              label={t('Batch export')}
            ></mds-button>
            <Check type="switch" checked={groupSelected} onChecked={setGroupSelected}>
              {t('Group selected')}
            </Check>
          </div>
          <span class="w-[calc(var(--magma-width-form)/2)]">
            <Field label={t('Select by export')}>
              <Select
                size="md"
                value={exportPick}
                placeholder={t('Choose an export')}
                options={exportNames.map((name) => ({ value: name, label: name }))}
                onValue={(value) => {
                  setExportPick(value);
                  if (!value) return;
                  const names = namesInOrder((family) =>
                    (resolveExport(family, config) ?? []).includes(value),
                  );
                  setSelected(new Set(names));
                  setBatch({ names, initialExport: value });
                }}
              />
            </Field>
          </span>
        </div>
        {generation.error && <mds-banner variant="error">{generation.error}</mds-banner>}
        {groupSelected && ticked.length > 0 && (
          <mds-card>
            <mds-card-header>
              <span class="flex flex-wrap items-baseline gap-inline">
                <mds-text typography="part" tag="h2">
                  {t('Selected colors')}
                </mds-text>
                <mds-text typography="detail" tag="p" class="text-fg-muted">
                  {plural(t, ticked.length, '{count} color', '{count} colors')}
                </mds-text>
              </span>
            </mds-card-header>
            <mds-card-content>
              <div class={membersGrid}>{ticked.map(member)}</div>
            </mds-card-content>
          </mds-card>
        )}
        {groups.map((group) => {
          const groupConfig = config.groups?.[group] ?? {};
          const colors = families.filter((family) => groupOf(family.name) === group);
          const formula = (groupConfig.formula ?? config.formula ?? 'wcag3') as Formula;
          const scales = scalesOf(config.ratios, formula);
          const scale = groupConfig.ratios ?? 'default';
          const compatible = scales[scale]?.length === MAGMA_STEPS;
          const members = groupSelected ? colors.filter((one) => !selected.has(one.name)) : colors;
          const update = (patch: Partial<GroupConfig>) =>
            updateGroup(studio, group, { ...groupConfig, ...patch });
          return (
            <mds-card key={group}>
              <mds-card-header>
                <span class="flex flex-wrap items-baseline gap-inline">
                  <mds-text typography="part" tag="h2">
                    {group}
                  </mds-text>
                  <mds-text typography="detail" tag="p" class="text-fg-muted">
                    {plural(t, colors.length, '{count} color', '{count} colors')}
                  </mds-text>
                </span>
              </mds-card-header>
              <mds-card-content>
                <div class="grid gap-between-fields">
                  <div class="grid grid-cols-[repeat(3,minmax(0,calc(var(--magma-width-form)/2)))] items-start gap-inline">
                    <Field label={t('Formula')}>
                      <Select
                        size="md"
                        value={groupConfig.formula ?? ''}
                        options={[
                          {
                            value: '',
                            label: t('inherit ({value})', { value: config.formula ?? 'wcag3' }),
                          },
                          { value: 'wcag2', label: 'wcag2' },
                          { value: 'wcag3', label: 'wcag3' },
                        ]}
                        onValue={(value) =>
                          update({ formula: (value || undefined) as Formula | undefined })
                        }
                      />
                    </Field>
                    <div class="grid content-start gap-label-control">
                      <Field label={t('Contrast scale')}>
                        <Select
                          size="md"
                          key={Object.keys(scales).join('|')}
                          value={groupConfig.ratios ?? ''}
                          options={[
                            { value: '', label: t('inherit ({value})', { value: 'default' }) },
                            ...Object.keys(scales).map((name) => ({ value: name, label: name })),
                          ]}
                          onValue={(value) => update({ ratios: value || undefined })}
                        />
                      </Field>
                      <div class="flex flex-wrap items-center gap-inline">
                        <mds-badge
                          variant={compatible ? 'success' : 'warning'}
                          tone="weak"
                          label={
                            compatible ? t('Compatible with Magma') : t('Not compatible with Magma')
                          }
                        ></mds-badge>
                        <mds-link
                          href={hrefOf(scaleRoute(formula, scale, group))}
                          icon="mi/baseline/arrow-forward"
                          label={t('Open the scale {scale}', { scale })}
                        ></mds-link>
                      </div>
                    </div>
                    <Field label={t('Export')}>
                      <TextInput
                        size="md"
                        commit="leave"
                        value={(groupConfig.export ?? []).join(', ')}
                        placeholder={t('e.g. palette, default')}
                        onValue={(text) => {
                          const list = parseExport(text);
                          if (list.join(',') !== (groupConfig.export ?? []).join(','))
                            update({ export: list.length ? list : undefined });
                        }}
                      />
                    </Field>
                  </div>
                  {!NO_SURFACE_GROUPS.has(group) && (
                    <GroupSurface
                      group={group}
                      on={Boolean(groupConfig.surface)}
                      onSurface={(on) => toggleGroupSurface(studio, group, on)}
                    />
                  )}
                  <div class={membersGrid}>
                    {members.length > 0 ? (
                      members.map(member)
                    ) : (
                      <mds-text typography="detail" tag="p" class="col-span-full text-fg-muted">
                        {t('All the colors of the group are in the {section} section.', {
                          section: t('Selected colors'),
                        })}
                      </mds-text>
                    )}
                  </div>
                </div>
              </mds-card-content>
            </mds-card>
          );
        })}
      </div>
      {batch && (
        <BatchExportModal
          names={batch.names}
          config={config}
          initialExport={batch.initialExport}
          onSave={(names, exportList) => {
            setExports(studio, names, exportList);
            setBatch(null);
            setSelected(new Set());
          }}
          onExport={(names) =>
            guard(studio, {
              label: msg('Export selection'),
              proceed: msg('Export anyway'),
              run: () => exportSelection(studio, names),
            })
          }
          onClose={() => setBatch(null)}
        />
      )}
    </main>
  );
}

/**
 * Whether the families of a group generate surfaces, and with them a theme, when they do not decide
 * for themselves (#1403: out of Semantic surface, which Weights replaced; vittorio, 2026-11-27). A
 * group of status colours generates them always (engine/groups.ts, RESERVED_GROUPS): on and
 * locked, saying why; one a preset turned off can be turned on.
 */
function GroupSurface({
  group,
  on,
  onSurface,
}: {
  group: string;
  on: boolean;
  onSurface: (on: boolean) => void;
}) {
  const t = useT(IT_GROUPS);
  const reserved = RESERVED_GROUPS.has(group);
  return (
    <div class="grid content-start gap-label-control" data-surface-switch>
      <Check type="switch" checked={on} disabled={reserved && on} onChecked={onSurface}>
        {t('Generate surfaces')}
      </Check>
      <mds-text typography="caption" tag="p" class="max-w-text text-fg-muted">
        {reserved
          ? t(
              'Always on for the status colours: banners, toasts and badges paint their text on their tint, which needs the text roles the surfaces generate. A status colour is never a theme.',
            )
          : t(
              'Every family of the group that does not decide for itself generates surfaces, and becomes a theme.',
            )}
      </mds-text>
    </div>
  );
}
