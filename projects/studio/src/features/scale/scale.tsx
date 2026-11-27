import { useEffect, useMemo, useState } from 'preact/hooks';
import type { ColorConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import {
  resolveFormula,
  resolveRatiosName,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { COLOR_MODES } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import { chromaticOrder, groupOf, groupsInOrder } from '../../engine/colour-order.js';
import { MAGMA_STEPS } from '../../engine/families.js';
import { paintedBy, paintsAny } from '../../engine/paints.js';
import { touchedCellsOfScale, touchedPairs } from '../../engine/touched.js';
import type { Scheme } from '../../shared/frames/frame.js';
import { Field, Select } from '../../shared/magma/magma.js';
import { plural, useT } from '../../shared/i18n/i18n.js';
import { TouchedPairs } from '../../shared/ui/touched-pairs.js';
import {
  GROUPS_PAGE,
  hrefOf,
  scaleRoute,
  type Formula,
  type Route,
} from '../../shared/routes/routes.js';
import { selectFamily } from '../../state/palette.js';
import {
  addScale,
  builtinScalesOf,
  changeScale,
  deleteScale,
  renameScale,
  restoreBuiltinSteps,
  scalesOf,
} from '../../state/scales.js';
import { useStudio } from '../../state/studio.js';
import {
  axisFor,
  closeMenu,
  CommitInput,
  DistributionControls,
  DistributionStrip,
  numberOf,
  RenameDialog,
  roundTo,
  sameStops,
  ScaleStates,
  SCHEMES,
  translated,
  FORMULA_OPTIONS,
  type EasingName,
} from './scale-parts.js';
import { IT_SCALE } from './i18n-it.js';

/*
  The page of a contrast scale (#1403; Contrast scales listed every scale until then): one scale at
  the centre, to adjust the targets its families share (studio.object-model.md, section 5, Scala),
  chosen on its renders (vittorio, 2026-11-27). In its head the way back, named after where the
  person came from (the family selected, or the group in the address: stages-in-order, side-page),
  the name of the scale with its badges and its menu, the formula and the scale as two selects that
  open any scale, one no family uses included, and the line that says why it holds the roles of
  Magma or not. Then the pairs it touches, the families that use it (one the sample), its
  distribution, and the states of the sample beside it. The number of steps of a built-in scale
  stays (question 10 of the object model): no step added nor removed, a line says to duplicate it;
  one a preset redefined with another number, used by families that paint Magma, is an error with
  the action that takes it back. What takes work away asks nothing and is undone from a toast.
*/

export function ScalePage({
  route,
  onOpen,
}: {
  route: Extract<Route, { section: 'scale' }>;
  /** Opens another page: another scale, the copy of one, the scale renamed. */
  onOpen: (route: Route, options?: { replace?: boolean }) => void;
}) {
  const t = useT(IT_SCALE);
  const studio = useStudio();
  const config = studio.config.value;
  const choices = studio.themeChoices.value;
  const report = studio.report.value;
  const scene = studio.scene.value;
  const selectedName = studio.selectedName.value;
  const { formula, name, group } = route;
  const ratioSet = scalesOf(config.ratios, formula);
  const values = ratioSet[name];
  const builtin = builtinScalesOf(formula)[name];
  const loadedStops = scalesOf(studio.loadedRatios.value, formula)[name];
  const [dialog, setDialog] = useState<'rename' | null>(null);
  const [easing, setEasing] = useState<EasingName>('manual');
  const [picked, setScheme] = useState<Scheme>('light');

  // a scale gone (deleted, renamed elsewhere): the default of its formula, in place
  useEffect(() => {
    if (!values) onOpen(scaleRoute(formula, 'default', group), { replace: true });
  }, [!values]);

  // the families of the formula that use the scale, by group, in chromatic order
  const users = useMemo(
    () =>
      chromaticOrder(
        config.colors.filter(
          (family) =>
            resolveFormula(family, config) === formula &&
            resolveRatiosName(family, config) === name,
        ),
      ),
    [config, formula, name],
  );
  // the sample: the family selected when it uses the scale, else the first that does
  const sample: ColorConfig | undefined =
    users.find((family) => family.name === selectedName) ?? users[0];
  const themes = scene?.themes ?? [];
  const painted = useMemo(
    () => (sample ? paintedBy(sample.name, { config, themes, choices }) : undefined),
    [sample?.name, config, themes, choices],
  );
  // the families that paint Magma on the scale: a number of steps they do not hold breaks them
  const painting = useMemo(
    () => users.filter((family) => paintsAny(paintedBy(family.name, { config, themes, choices }))),
    [users, config, themes, choices],
  );

  // the pairs of the check the scale touches, measured after the render that changed it
  const json = studio.json.value;
  const [touched, setTouched] = useState<{ key: string; cells: Set<string> }>();
  const key = `${formula}/${name}`;
  useEffect(() => {
    if (!values) return;
    const timer = setTimeout(
      () => setTouched({ key, cells: touchedCellsOfScale(config, formula, name, values, choices) }),
      0,
    );
    return () => clearTimeout(timer);
  }, [key, json, choices]);
  const pairs = useMemo(
    () => (touched?.key === key ? touchedPairs(report, touched.cells) : undefined),
    [touched, report, key],
  );

  if (!values) return null;

  const compatible = values.length === MAGMA_STEPS;
  const overridden =
    Array.isArray(builtin) &&
    (builtin.length !== values.length || builtin.some((value, i) => value !== values[i]));
  // a built-in scale with another number of steps than its own, on which families paint Magma
  const broken = Array.isArray(builtin) && builtin.length !== values.length && painting.length > 0;
  const axis = axisFor(formula, values);
  const step = axis.precision === 0 ? 1 : 0.01;
  const resetOff = !loadedStops
    ? t('the loaded configuration has no scale named {name}', { name })
    : easing === 'manual' && sameStops(values, loadedStops)
      ? t('{name} holds the steps of the loaded configuration', { name })
      : null;
  const manualChange = (next: number[]) => {
    changeScale(studio, formula, name, next);
    setEasing('manual');
  };

  // the states of the sample on the scale: the theme it is seen in, its modes
  const source = sample?.alias;
  const statesTheme = painted && painted.variants.length > 0 && !source ? painted.theme : undefined;
  const modes: readonly Scheme[] = statesTheme?.modes ?? COLOR_MODES;
  const scheme: Scheme = modes.includes(picked) ? picked : modes[0];

  // the way back: the group the person came from, else the family selected, in Colours
  const back = group
    ? { href: hrefOf(GROUPS_PAGE), label: t('The group {group}', { group }) }
    : { href: hrefOf({ section: 'colours' }), label: selectedName };

  return (
    <main class="@container/scale h-full min-h-0 overflow-y-auto px-(--magma-width-page-gutter) pt-inset pb-between-sections">
      <div class="grid content-start gap-x-between-groups @side/scale:grid-cols-[minmax(0,1fr)_calc(var(--spacing)*10400)] @side/scale:items-start">
        <div class="grid min-w-0 content-start gap-between-groups">
          <header class="grid gap-title-content">
            <div>
              <mds-button
                href={back.href}
                icon="mi/baseline/arrow-back"
                variant="dark"
                tone="text"
                size="sm"
                class="[--mds-button-label-transform:none]"
                label={back.label}
              ></mds-button>
            </div>
            <div class="flex flex-wrap items-center gap-inline">
              <mds-text typography="page" tag="h1">
                {name}
              </mds-text>
              {Array.isArray(builtin) && (
                <mds-badge
                  variant="dark"
                  tone="weak"
                  label={overridden ? t('Built-in, overridden') : t('Built-in')}
                ></mds-badge>
              )}
              <mds-badge
                variant={compatible ? 'success' : 'warning'}
                tone="weak"
                label={compatible ? t('Compatible with Magma') : t('Not compatible with Magma')}
              ></mds-badge>
              <mds-button
                id="scale-actions"
                type="button"
                icon="mi/baseline/more-vert"
                variant="dark"
                tone="text"
                aria-label={t('Actions of the scale {name}', { name })}
              ></mds-button>
            </div>
            <mds-text typography="detail" tag="p" class="max-w-text text-fg-muted" data-why>
              {compatible
                ? t(
                    'The roles of Magma name {steps} steps by number: this scale has {count}. Its targets move freely, the contrast check measures them.',
                    { steps: MAGMA_STEPS, count: values.length },
                  )
                : t(
                    'The roles of Magma name {steps} steps by number: this scale has {count}, so it serves only the families outside Magma.',
                    { steps: MAGMA_STEPS, count: values.length },
                  )}
            </mds-text>
            {/* any scale opens from here, one no family uses included (vittorio, 2026-11-27) */}
            <div class="flex flex-wrap items-end gap-inline [&>mds-input-field]:w-5600">
              <Field label={t('Formula')}>
                <Select
                  value={formula}
                  options={translated(t, FORMULA_OPTIONS)}
                  onValue={(next) =>
                    onOpen(
                      scaleRoute(
                        next as Formula,
                        scalesOf(config.ratios, next as Formula)[name] ? name : 'default',
                        group,
                      ),
                    )
                  }
                />
              </Field>
              <Field label={t('Scale')}>
                <Select
                  key={Object.keys(ratioSet).join('|')}
                  value={name}
                  options={Object.keys(ratioSet).map((one) => ({ value: one, label: one }))}
                  onValue={(next) => onOpen(scaleRoute(formula, next, group))}
                />
              </Field>
            </div>
          </header>

          {broken && (
            <mds-banner
              variant="error"
              headline={plural(
                t,
                painting.length,
                '{count} family that paints Magma is on {steps} steps',
                '{count} families that paint Magma are on {steps} steps',
                { steps: values.length },
              )}
            >
              {t(
                'Their roles point at steps whose value changed: the preset redefined this built-in scale before its number of steps was locked.',
              )}
              <mds-button
                slot="action"
                variant="error"
                label={t('Back to the {count} built-in steps', { count: builtin.length })}
                onClick={() => restoreBuiltinSteps(studio, formula, name)}
              ></mds-button>
            </mds-banner>
          )}

          <TouchedPairs pairs={pairs} />

          {/* the families that use it, by group; the one chosen is the sample beside */}
          <section class="grid gap-inline" aria-labelledby="scale-used-by">
            <mds-text typography="part" tag="h2" id="scale-used-by">
              {t('Used by')}
            </mds-text>
            {users.length === 0 ? (
              <mds-text typography="detail" tag="p" class="text-fg-muted">
                {t('No family uses this scale right now.')}
              </mds-text>
            ) : (
              <dl class="m-0 grid gap-inline">
                {groupsInOrder(users).map((one) => (
                  <div class="flex flex-wrap items-center gap-inline">
                    <mds-text typography="label" tag="dt" class="text-fg-muted">
                      {one}
                    </mds-text>
                    <dd class="m-0 flex flex-wrap gap-inline">
                      {users
                        .filter((family) => groupOf(family.name) === one)
                        .map((family) => (
                          <mds-chip
                            label={family.name.split('.')[1]}
                            // a reference has no colour of its own: the empty ring
                            swatch={family.color ?? 'transparent'}
                            selectable
                            selected={family.name === sample?.name}
                            onmdsChipSelect={(
                              event: CustomEvent<{ element: HTMLElement; selected?: boolean }>,
                            ) => {
                              selectFamily(studio, family.name);
                              // one family is the sample: clicked again, its chip stays selected
                              if (!event.detail?.selected)
                                (event.detail.element as { selected?: boolean }).selected = true;
                            }}
                          ></mds-chip>
                        ))}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          {/* the distribution of the steps; their number only on a scale that is not built-in */}
          <section
            class="grid gap-between-fields rounded-lg border border-border-muted p-inset"
            aria-labelledby="scale-distribution"
          >
            <mds-text typography="part" tag="h2" id="scale-distribution">
              {t('Distribution')}
            </mds-text>
            <DistributionStrip
              values={values}
              axis={axis}
              formula={formula}
              onChange={manualChange}
            />
            <div
              class="flex flex-wrap items-center gap-inline"
              role="group"
              aria-label={t('The steps of {name}', { name })}
            >
              {values.map((value, index) => (
                <div class="flex items-center">
                  <CommitInput
                    type="number"
                    size="md"
                    class="[&_mds-input]:w-2800"
                    label={t('Step {step}', { step: index + 1 })}
                    min={axis.min}
                    max={axis.max}
                    step={step}
                    value={String(value)}
                    onCommit={(raw) => {
                      const typed = numberOf(raw);
                      if (typed === null) return;
                      const clamped = Math.min(axis.max, Math.max(axis.min, typed));
                      const next = [...values];
                      next[index] = roundTo(clamped, axis.precision);
                      manualChange(next.sort((a, b) => a - b));
                    }}
                  />
                  {!Array.isArray(builtin) && (
                    <mds-button
                      type="button"
                      icon="mi/baseline/close"
                      size="sm"
                      variant="dark"
                      tone="text"
                      aria-label={t('Remove step {step}', { step: index + 1 })}
                      disabled={values.length <= 2}
                      onClick={() => manualChange(values.filter((_, i) => i !== index))}
                    ></mds-button>
                  )}
                </div>
              ))}
            </div>
            {Array.isArray(builtin) ? (
              <mds-text typography="caption" tag="p" class="text-fg-muted" data-locked>
                {t('Built-in: its number of steps stays {count}. To change it, duplicate it.', {
                  count: builtin.length,
                })}
              </mds-text>
            ) : (
              <div>
                <mds-button
                  type="button"
                  icon="mi/baseline/add"
                  variant="dark"
                  tone="outline"
                  label={t('Add step')}
                  disabled={values.length >= 24}
                  onClick={() => {
                    let gapIndex = 0;
                    let gapSize = -1;
                    for (let i = 0; i < values.length - 1; i++)
                      if (values[i + 1] - values[i] > gapSize) {
                        gapSize = values[i + 1] - values[i];
                        gapIndex = i;
                      }
                    const next = [...values];
                    next.splice(
                      gapIndex + 1,
                      0,
                      roundTo((values[gapIndex] + values[gapIndex + 1]) / 2, axis.precision),
                    );
                    manualChange(next);
                  }}
                ></mds-button>
              </div>
            )}
            <DistributionControls
              axis={axis}
              values={values}
              easing={easing}
              locked={Array.isArray(builtin)}
              onEasingChange={setEasing}
              onApply={(next) => changeScale(studio, formula, name, next)}
            >
              <mds-button
                type="button"
                icon="mi/baseline/restart-alt"
                size="lg"
                variant="dark"
                tone="outline"
                disabled={resetOff !== null}
                title={
                  resetOff ??
                  t(
                    'back to the steps of {name} in the loaded configuration, distribution manual',
                    { name },
                  )
                }
                label={t('Reset')}
                onClick={() => loadedStops && manualChange([...loadedStops])}
              ></mds-button>
            </DistributionControls>
          </section>
        </div>

        {/* beside, the states of the sample solved on the scale, one mode at a time */}
        <aside
          class="mt-between-groups grid gap-between-containers @side/scale:sticky @side/scale:top-inset @side/scale:mt-0"
          aria-label={t('The states of the sample')}
        >
          {statesTheme && sample && (
            <>
              <mds-tab
                aria-label={t('Mode')}
                onmdsTabChange={(event: CustomEvent<{ id: number; value?: string }>) => {
                  const value = event.detail?.value as Scheme | undefined;
                  if (value) setScheme(value);
                }}
              >
                {SCHEMES.map((one) => (
                  <mds-tab-item
                    type="button"
                    label={t(one.label)}
                    value={one.id}
                    selected={one.id === scheme}
                    disabled={!modes.includes(one.id)}
                  ></mds-tab-item>
                ))}
              </mds-tab>
              <ScaleStates
                config={config}
                family={sample.name}
                scale={name}
                formula={formula}
                painted={painted!}
                theme={statesTheme}
                scheme={scheme}
                choices={choices}
              />
            </>
          )}
          {!statesTheme && (
            <mds-text typography="detail" tag="p" class="text-fg-muted">
              {source
                ? t('{name} takes the ramp of {source} whatever its scale.', {
                    name: sample?.name ?? '',
                    source,
                  })
                : sample
                  ? t(
                      '{name} paints no component of Magma: no variant of a component takes it, no theme points an accent at it and no theme is drawn from it.',
                      { name: sample.name },
                    )
                  : t('No family uses this scale right now.')}
            </mds-text>
          )}
        </aside>
      </div>

      {/* the actions of the scale: Delete last after a separator, undone from a toast */}
      <mds-dropdown target="#scale-actions" placement="bottom-end" strategy="fixed">
        <div class="studio-dropdown">
          <mds-button
            type="button"
            icon="mi/baseline/content-copy"
            variant="dark"
            tone="text"
            class="studio-menu-link"
            label={t('Duplicate')}
            onClick={(event: Event) => {
              closeMenu(event);
              onOpen(scaleRoute(formula, addScale(studio, formula, name), group));
            }}
          ></mds-button>
          <mds-button
            type="button"
            icon="mi/baseline/edit"
            variant="dark"
            tone="text"
            class="studio-menu-link"
            disabled={Array.isArray(builtin)}
            title={Array.isArray(builtin) ? t('built-in scales cannot be renamed') : undefined}
            label={t('Rename')}
            onClick={(event: Event) => {
              closeMenu(event);
              setDialog('rename');
            }}
          ></mds-button>
          <mds-separator></mds-separator>
          <mds-button
            type="button"
            icon="mi/baseline/delete"
            variant="error"
            tone="text"
            class="studio-menu-link"
            disabled={name === 'default'}
            title={name === 'default' ? t('the default scale is mandatory') : undefined}
            label={t('Delete')}
            onClick={(event: Event) => {
              closeMenu(event);
              deleteScale(studio, formula, name);
            }}
          ></mds-button>
        </div>
      </mds-dropdown>
      {dialog === 'rename' && (
        <RenameDialog
          name={name}
          ratioSet={ratioSet}
          onRename={(next) => {
            if (renameScale(studio, formula, name, next))
              onOpen(scaleRoute(formula, next, group), { replace: true });
          }}
          onClose={() => setDialog(null)}
        />
      )}
    </main>
  );
}
