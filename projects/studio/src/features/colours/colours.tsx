import type { ComponentChild } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type {
  ColorConfig,
  MagmaConfig,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import {
  resolveFormula,
  resolveRatiosName,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { hasSaturation } from '@maggioli-design-system/design-tokens/src/lib/saturation.mjs';
import { nearestColorName } from '../../engine/color-names.js';
import { chromaticOrder, groupOf, groupsInOrder } from '../../engine/colour-order.js';
import { colorspaceVerdict, type ColorspaceVerdict } from '../../engine/colorspace-verdict.js';
import {
  badgeOf,
  BUILTIN_ALIAS_NAMES,
  groupNameOf,
  groupNameProblem,
  isAlias,
  resolveBaseColor,
  themesUsing,
  withoutSaturation,
} from '../../engine/families.js';
import { generateScales, singleColorConfig, type ColorScales } from '../../engine/generator.js';
import { paintedBy, paintsAny, type Painted } from '../../engine/paints.js';
import { touchedCells, touchedPairs } from '../../engine/touched.js';
import { Check, ColorInput, Field, Select, TextInput } from '../../shared/magma/magma.js';
import { msg, plural, rich, useT, type T } from '../../shared/i18n/i18n.js';
import { GateBadge } from '../../shared/ui/verdict.js';
import { TouchedPairs } from '../../shared/ui/touched-pairs.js';
import { GROUPS_PAGE, hrefOf, stageOf, themeRoute } from '../../shared/routes/routes.js';
import {
  addFamily,
  autoNameFamily,
  deleteFamily,
  duplicateFamily,
  patchFamily,
  selectFamily,
} from '../../state/palette.js';
import { builtinScalesOf, scalesOf } from '../../state/scales.js';
import { toggleSurface } from '../../state/surfaces.js';
import { useStudio } from '../../state/studio.js';
import { FamilyFields, ReferenceFields, type ScaleChoice } from './family-fields.js';
import { Ramps, SceneSide } from './scene-side.js';
import { IT_COLOURS } from './i18n-it.js';
import './colours.css';

/*
  The stage Colours (#1403; the Palette until then): the family at the centre, to adjust a colour
  and see what it paints (studio.object-model.md, section 5, "1. Colori"). Around it: the families
  in a list beside, by group, in chromatic order inside each group (engine/colour-order.ts); in its
  head what it paints, in which themes, and the pairs of the contrast check it touches; every field
  in line, each value it inherits saying from whom; its contrast scale with its badge and a link to
  its page; the scene beside it. Chosen on its renders (vittorio, 2026-11-27): the list as today
  with New group beside Add color and an icon beside each group to its place in Groups; the pairs
  in a closed detail under the name, their count and their verdict in its title; the inherited
  value on a line under its field; the settings of the preset are in Groups (question 13 of the
  model). Built as Magma says today: record-detail with the list beside,
  until list and detail (#1262) lands; these renders are its proposals.
*/

/**
 * The title of the family selected: Edit, in the banner of a reference, opens the source and gives
 * its title the focus (tabindex -1), the next Tab reaching the actions of the family, then its
 * fields.
 */
const FAMILY_TITLE = 'palette-color-title';

/** A family the dialog adds, as the person writes it. */
interface Draft {
  // 'color' creates a family of its own, 'alias' a reference to another family
  kind: 'color' | 'alias';
  color: string;
  /** the family a reference follows (`<group>.<name>`) */
  alias: string;
  name: string;
  /** the group chosen among those there are, or NEW_GROUP to write a new one */
  group: string;
  /** the name of a new group, as typed */
  newGroup: string;
  manual: boolean;
}

/** The choice of the select of the groups that writes a new one. */
const NEW_GROUP = '';

export function ColoursPage() {
  const t = useT(IT_COLOURS);
  const studio = useStudio();
  const config = studio.config.value;
  const selectedName = studio.selectedName.value;
  const report = studio.report.value;
  const scene = studio.scene.value;
  const choices = studio.themeChoices.value;
  const selected = config.colors.find((one) => one.name === selectedName);
  const [listOpen, setListOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  // the families a reference may follow: those with a colour of their own
  const targets = chromaticOrder(config.colors.filter((one) => !isAlias(one))).map(
    (one) => one.name,
  );

  // the ramps of the family selected, solved by the real generator on the preset given
  const scalesOfFamily = (
    from: MagmaConfig,
    family: ColorConfig,
  ): [ColorScales | null, string | null] => {
    try {
      if (isAlias(family)) {
        const source = from.colors.find((one) => one.name === family.alias);
        if (!source)
          return [
            null,
            t('alias target "{name}" is not defined in this config', { name: family.alias ?? '' }),
          ];
        if (isAlias(source))
          return [
            null,
            t('alias target "{name}" is itself a reference; point it at a base-color family', {
              name: family.alias ?? '',
            }),
          ];
        // resolved through the real generator with the source present, so the alias re-export
        // finds it: the ramp of a reference is the one of its source
        const scales = generateScales({ ...from, colors: [source, family] });
        return [scales.get(family.name) ?? null, null];
      }
      return [generateScales(singleColorConfig(from, family)).get(family.name) ?? null, null];
    } catch (error) {
      return [null, String(error)];
    }
  };

  // what the ramps of the family selected depend on
  const deps = [
    JSON.stringify(selected),
    selected && isAlias(selected)
      ? JSON.stringify(config.colors.find((one) => one.name === selected.alias))
      : '',
    JSON.stringify(config.hueShift),
    JSON.stringify(config.saturation),
    JSON.stringify(config.ratios),
    config.colorspace,
    config.smooth,
    config.formula,
    t,
  ];
  const [ramps, rampsError] = useMemo(
    (): [ColorScales | null, string | null] =>
      selected ? scalesOfFamily(config, selected) : [null, null],
    deps,
  );
  // the same ramps with no saturation curve anywhere: the "before" of the saturation of the
  // family, drawn by its group and by the global one (saturation-editor.tsx)
  const flatRamps = useMemo((): ColorScales | null => {
    if (!selected) return null;
    const flat = withoutSaturation(config);
    const family = flat.colors.find((one) => one.name === selected.name);
    return family ? scalesOfFamily(flat, family)[0] : null;
  }, deps);

  // how the colorspace of the family selected holds its seed (colorspace-verdict.ts), graded after
  // the render that changed it: eight ramps of the family (some 30 ms in a browser, more in jsdom)
  // would hold every edit back. The verdict names its family: until the one selected is graded,
  // the field shows none, never the marks of the family before
  const [graded, setGraded] = useState<{
    family: string;
    verdict: ColorspaceVerdict | null;
  } | null>(null);
  useEffect(() => {
    if (!selected || isAlias(selected)) return;
    const timer = setTimeout(
      () => setGraded({ family: selected.name, verdict: colorspaceVerdict(t, config, selected) }),
      0,
    );
    return () => clearTimeout(timer);
  }, deps);
  const verdict = selected && graded?.family === selected.name ? graded.verdict : null;

  // what the family paints, and the themes that use it (paints.ts, families.ts)
  const painted: Painted | undefined = useMemo(
    () =>
      selected && scene
        ? paintedBy(selected.name, { config, themes: scene.themes, choices })
        : undefined,
    [selectedName, scene, choices],
  );
  const uses = useMemo(
    () => (selected && scene ? themesUsing(config, selected.name, scene.themes, choices) : []),
    [selectedName, scene, choices],
  );

  // the pairs of the contrast check the family touches, measured after the render that changed it
  // (touched.ts, some 75 ms): the count follows the report at once, the set the family
  const [touched, setTouched] = useState<{ family: string; json: string; cells: Set<string> }>();
  const json = studio.json.value;
  useEffect(() => {
    if (!selected) return;
    const timer = setTimeout(
      () =>
        setTouched({
          family: selected.name,
          json,
          cells: touchedCells(config, selected.name, choices),
        }),
      0,
    );
    return () => clearTimeout(timer);
  }, [selectedName, json, choices]);
  const cells = selected && touched?.family === selected.name ? touched.cells : undefined;
  const pairs = useMemo(() => (cells ? touchedPairs(report, cells) : undefined), [cells, report]);

  // the family a reference points at, opened from the banner of the reference: once that family
  // renders, its title comes into view and takes the focus. The request names the family: the
  // effects of the render before it, still pending when the person clicks, run at the start of the
  // next render, before the family is drawn, and must leave the request to the render of the
  // family (seen in CI on #1326)
  const openSource = useRef<string | null>(null);
  useEffect(() => {
    if (openSource.current !== selectedName) return;
    const title = document.getElementById(FAMILY_TITLE);
    if (!title) return;
    openSource.current = null;
    title.scrollIntoView({ block: 'start' });
    title.focus({ preventScroll: true });
  }, [selectedName]);

  // the scales a family of this formula chooses from, each with its number of steps and its origin
  const formula = selected ? resolveFormula(selected, config) : 'wcag3';
  const scales: ScaleChoice[] = useMemo(() => {
    const ratios = scalesOf(config.ratios, formula);
    const builtin = builtinScalesOf(formula);
    return Object.entries(ratios).map(([name, steps]) => {
      const original = builtin[name];
      const overridden =
        Array.isArray(original) &&
        (original.length !== steps.length || original.some((value, i) => value !== steps[i]));
      return {
        name,
        steps: steps.length,
        label: !Array.isArray(original)
          ? name
          : overridden
            ? t('{name} (built-in, overridden)', { name })
            : t('{name} (built-in)', { name }),
      };
    });
  }, [JSON.stringify(config.ratios), formula, t]);

  const colorMenu = useRef<HTMLMdsDropdownElement>(null);
  const closeMenu = () => {
    if (colorMenu.current) colorMenu.current.visible = false;
  };

  const openDialog = (newGroup: boolean) =>
    setDraft({
      kind: 'color',
      color: '#4f8fd9',
      alias: targets[0] ?? '',
      name: nearestColorName('#4f8fd9'),
      group: newGroup ? NEW_GROUP : 'label',
      newGroup: '',
      manual: false,
    });

  // the container of the layout, apart from its grid: a container cannot query itself
  return (
    <div class="@container/colours h-full">
      <div class="grid h-full grid-cols-[calc(var(--spacing)*6000)_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] @max-list-beside/colours:grid-cols-1">
        {/* where the list stands above the page, folded into the family selected: its arrow at the
          end, as the sections of the bar that open a menu (app-shell); hidden where the list
          stands beside the page (#1311, kept until question 9 of the object model is answered);
          in the gutter of the page, so it starts on the edge of the bar and the page under it
          (widths, workspace and start-edge) */}
        <div class="hidden px-(--magma-width-page-gutter) pt-inset @max-list-beside/colours:block">
          <mds-button
            type="button"
            icon={listOpen ? 'mi/baseline/expand-less' : 'mi/baseline/expand-more'}
            icon-position="right"
            variant="dark"
            tone="weak"
            class="w-full justify-between [--mds-button-label-transform:none]"
            label={selectedName}
            aria-expanded={listOpen ? 'true' : 'false'}
            aria-controls="colours-list"
            onClick={() => setListOpen(!listOpen)}
          ></mds-button>
        </div>
        <FamilyList
          t={t}
          config={config}
          selectedName={selectedName}
          open={listOpen}
          onSelect={(name) => {
            selectFamily(studio, name);
            setListOpen(false);
          }}
          onAdd={() => openDialog(false)}
          onNewGroup={() => openDialog(true)}
        />
        <main
          class={
            listOpen
              ? 'relative col-start-2 row-span-2 row-start-1 min-h-0 overflow-y-auto px-(--magma-width-page-gutter) pt-inset pb-between-sections @max-list-beside/colours:hidden'
              : 'relative col-start-2 row-span-2 row-start-1 min-h-0 overflow-y-auto px-(--magma-width-page-gutter) pt-inset pb-between-sections @max-list-beside/colours:col-start-1 @max-list-beside/colours:row-span-1 @max-list-beside/colours:row-start-2'
          }
        >
          {/* the head of the view: its title with the verdict of the contrast check beside it */}
          <header class="mb-between-sections grid gap-title-content">
            <div class="flex flex-wrap items-center gap-inline">
              <mds-text typography="page" tag="h1">
                {t(stageOf('colours').label)}
              </mds-text>
              <GateBadge verdict={report.verdict} />
            </div>
            <mds-text typography="detail" tag="p" class="max-w-text text-fg-muted">
              {t('Adjust a colour of the preset and see what it paints.')}
            </mds-text>
          </header>

          {selected && (
            <div class="@container/family">
              <div class="grid content-start gap-x-between-groups @side/family:grid-cols-[minmax(0,1fr)_calc(var(--spacing)*10400)] @side/family:items-start">
                <div class="mb-title-content flex items-center gap-inline @side/family:col-start-1">
                  <mds-text
                    id={FAMILY_TITLE}
                    typography="section"
                    tag="h2"
                    tabIndex={-1}
                    class="focus-visible:outline-(--magma-outline-focus) focus-visible:outline-offset-(--magma-outline-focus-offset)"
                  >
                    {selected.name}
                  </mds-text>
                  {/* the actions of the family in its menu, Delete last after a separator
                    (docs/agents/patterns/actions.md, destructive-in-menu) */}
                  <mds-button
                    id="palette-color-actions"
                    type="button"
                    icon="mi/baseline/more-vert"
                    variant="dark"
                    tone="text"
                    aria-label={t('Actions of {name}', { name: selected.name })}
                  ></mds-button>
                </div>
                <div class="mb-between-groups grid gap-inline @side/family:col-start-1">
                  <PaintsLine t={t} painted={painted} uses={uses} />
                  <TouchedPairs pairs={pairs} />
                </div>
                <div class="mb-between-groups @side/family:sticky @side/family:top-inset @side/family:col-start-2 @side/family:row-span-5 @side/family:row-start-1 @side/family:mb-0">
                  <SceneSide
                    family={selected.name}
                    painted={painted}
                    scene={scene?.css}
                    ramps={<Ramps scales={ramps} error={rampsError} />}
                  />
                </div>
                <section class="grid @side/family:col-start-1" aria-labelledby={FAMILY_TITLE}>
                  {isAlias(selected) ? (
                    <ReferenceFields
                      config={config}
                      family={selected}
                      builtin={BUILTIN_ALIAS_NAMES.has(selected.name)}
                      targets={targets}
                      resolved={resolveBaseColor(config, selected)}
                      onChange={(patch) => patchFamily(studio, selected.name, patch)}
                      onOpenSource={() => {
                        if (!selected.alias) return;
                        openSource.current = selected.alias;
                        selectFamily(studio, selected.alias);
                      }}
                    />
                  ) : (
                    <FamilyFields
                      config={config}
                      family={selected}
                      colorspaceVerdict={verdict}
                      saturationBefore={flatRamps?.light ?? null}
                      saturationAfter={ramps?.light ?? null}
                      formula={formula}
                      scales={scales}
                      paints={!painted || paintsAny(painted)}
                      inheritedColorspace={config.colorspace ?? 'HSL'}
                      inheritedRatios={resolveRatiosName(
                        { ...selected, ratios: undefined },
                        config,
                      )}
                      inheritedFormula={resolveFormula({ ...selected, formula: undefined }, config)}
                      inheritedExport={config.groups?.[groupOf(selected.name)]?.export ?? []}
                      hasGlobalShift={config.hueShift !== undefined}
                      hasGlobalSaturation={hasSaturation(config.saturation)}
                      onChange={(patch) => patchFamily(studio, selected.name, patch)}
                      onSurface={(on) => toggleSurface(studio, selected.name, on)}
                      onColorCommit={(hex) => autoNameFamily(studio, selected.name, hex)}
                    />
                  )}
                </section>
                <mds-dropdown
                  ref={colorMenu}
                  target="#palette-color-actions"
                  placement="bottom-start"
                  strategy="fixed"
                >
                  <div class="studio-dropdown">
                    <mds-button
                      type="button"
                      icon="mi/baseline/content-copy"
                      variant="dark"
                      tone="text"
                      class="studio-menu-link"
                      label={t('Duplicate')}
                      onClick={() => {
                        closeMenu();
                        duplicateFamily(studio, selected.name);
                      }}
                    ></mds-button>
                    <mds-separator></mds-separator>
                    <mds-button
                      type="button"
                      icon="mi/baseline/delete"
                      variant="error"
                      tone="text"
                      class="studio-menu-link"
                      label={t('Delete color')}
                      disabled={BUILTIN_ALIAS_NAMES.has(selected.name)}
                      title={
                        BUILTIN_ALIAS_NAMES.has(selected.name)
                          ? t('built-in variant: cannot be deleted')
                          : undefined
                      }
                      onClick={() => {
                        closeMenu();
                        deleteFamily(studio, selected.name);
                      }}
                    ></mds-button>
                  </div>
                </mds-dropdown>
              </div>
            </div>
          )}
        </main>
      </div>
      {draft && (
        <NewColourDialog
          t={t}
          config={config}
          draft={draft}
          targets={targets}
          onDraft={setDraft}
          onAdd={(family) => {
            addFamily(studio, family);
            setDraft(null);
          }}
          onClose={() => setDraft(null)}
        />
      )}
    </div>
  );
}

/** The list of the families, by group, in chromatic order inside each group. */
function FamilyList({
  t,
  config,
  selectedName,
  open,
  onSelect,
  onAdd,
  onNewGroup,
}: {
  t: T;
  config: MagmaConfig;
  selectedName: string;
  open: boolean;
  onSelect: (name: string) => void;
  onAdd: () => void;
  onNewGroup: () => void;
}) {
  const families = chromaticOrder(config.colors);
  // the list starts in the gutter of the page, on the edge the bar starts on (widths, workspace
  // and start-edge: one edge for the bar and what stands under it, vittorio 2026-11-27)
  return (
    <aside
      id="colours-list"
      class={
        open
          ? 'col-start-1 row-span-2 row-start-1 grid min-h-0 content-start gap-between-fields overflow-y-auto border-e border-border-muted px-(--magma-width-page-gutter) py-inset @max-list-beside/colours:row-span-1 @max-list-beside/colours:row-start-2 @max-list-beside/colours:border-e-0'
          : 'col-start-1 row-span-2 row-start-1 grid min-h-0 content-start gap-between-fields overflow-y-auto border-e border-border-muted px-(--magma-width-page-gutter) py-inset @max-list-beside/colours:hidden'
      }
      aria-label={t('The families of the preset')}
    >
      {/* the main action of the list, a part of the page: primary outline (actions.md,
          part-primary); a group is born with its first family, from the same dialog */}
      <div class="grid gap-inline">
        <mds-button
          type="button"
          icon="mi/baseline/add"
          variant="primary"
          tone="outline"
          class="w-full"
          label={t('Add color')}
          onClick={onAdd}
        ></mds-button>
        <mds-button
          type="button"
          icon="mi/baseline/create-new-folder"
          variant="dark"
          tone="text"
          class="w-full"
          label={t('New group')}
          onClick={onNewGroup}
        ></mds-button>
      </div>
      {groupsInOrder(families).map((group) => (
        <div class="grid gap-inline">
          <div class="flex items-center justify-between gap-inline">
            <mds-text typography="part" tag="h2">
              {group}
            </mds-text>
            <mds-button
              href={hrefOf(GROUPS_PAGE)}
              icon="mi/outline/tune"
              variant="dark"
              tone="text"
              size="sm"
              aria-label={t('The group {group}, in Groups', { group })}
            ></mds-button>
          </div>
          <ul class="m-0 grid list-none p-0 [--mds-button-label-transform:none]">
            {families
              .filter((family) => groupOf(family.name) === group)
              .map((family) => {
                const badge = badgeOf(t, config, family);
                const current = family.name === selectedName;
                return (
                  <li
                    class={
                      family.disabled ? 'relative opacity-(--magma-disabled-opacity)' : 'relative'
                    }
                  >
                    {/* until Magma has a list and detail (#1262): a button of Magma per family,
                        the one shown in the detail marked by aria-current and the weak tone; its
                        swatch the icon, painted with --colours-swatch (colours.css) */}
                    <mds-button
                      type="button"
                      icon="mdi/circle"
                      variant="dark"
                      tone={current ? 'weak' : 'text'}
                      aria-current={current ? 'true' : undefined}
                      class="colours-swatch w-full justify-start"
                      style={{ '--colours-swatch': resolveBaseColor(config, family) }}
                      label={family.name.split('.')[1]}
                      title={badge?.title}
                      onClick={() => onSelect(family.name)}
                    ></mds-button>
                    {/* the slot of mds-button takes text only: the badge sits on the end of the
                        row, the button under it takes the click and says the badge in its title */}
                    {badge && (
                      <mds-badge
                        variant="dark"
                        tone="weak"
                        label={badge.label}
                        class="pointer-events-none absolute end-inline top-1/2 -translate-y-1/2"
                      ></mds-badge>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </aside>
  );
}

/** How a theme uses a family: its tint, or the accent role it points at it. */
const USE_TEXT: Record<string, string> = {
  tint: msg('Tint of the theme {theme}'),
  accent: msg('Accent of the theme {theme}'),
  ai: msg('AI accent of the theme {theme}'),
};

/** What the family paints and the themes that use it, each named with a link to Themes. */
function PaintsLine({
  t,
  painted,
  uses,
}: {
  t: T;
  painted: Painted | undefined;
  uses: ReturnType<typeof themesUsing>;
}) {
  if (!painted) return null;
  const variants = [
    ...new Set(
      painted.variants
        .filter((one) => one.kind === 'Status' || one.kind === 'Label')
        .map((one) => one.variant),
    ),
  ];
  const parts: ComponentChild[][] = uses.map((use) =>
    rich(t, USE_TEXT[use.as] ?? USE_TEXT.accent, {
      // each theme named opens the stage Themes on it (#1404)
      theme: <mds-link href={hrefOf(themeRoute(use.theme))}>{use.theme}</mds-link>,
    }),
  );
  if (variants.length)
    parts.push([
      plural(
        t,
        variants.length,
        'It paints the variant {variants}',
        'It paints the variants {variants}',
        { variants: variants.join(', ') },
      ),
    ]);
  return (
    <mds-text typography="detail" tag="p" class="max-w-text text-fg-muted" data-paints>
      {paintsAny(painted) || parts.length
        ? parts.flatMap((part, index) => (index ? ['; ', ...part] : part)).concat('.')
        : t('It paints nothing of Magma: a case outside Magma, which goes out as tokens alone.')}
    </mds-text>
  );
}

/**
 * The dialog of a new family: a colour of its own or a reference, its group (one there is, or a
 * new one: a group is born with its first family, studio.object-model.md, section 4, Group), its
 * name. No dismissal by a click outside nor by Esc (interaction strict): an accidental click must
 * not lose the input; the X of the window and Cancel close it.
 */
function NewColourDialog({
  t,
  config,
  draft,
  targets,
  onDraft,
  onAdd,
  onClose,
}: {
  t: T;
  config: MagmaConfig;
  draft: Draft;
  targets: string[];
  onDraft: (next: Draft | ((was: Draft | null) => Draft | null)) => void;
  onAdd: (family: Parameters<typeof addFamily>[1]) => void;
  onClose: () => void;
}) {
  const update = (patch: Partial<Draft>) => onDraft((was) => was && { ...was, ...patch });
  const groups = groupsInOrder(config.colors);
  // a reference lives in the group of the references alone; a colour of its own never there
  const choices = [...new Set([...groups, 'label'])].filter((group) => group !== 'variant');
  const group = draft.kind === 'alias' ? 'variant' : draft.group;
  const written = group === NEW_GROUP ? groupNameOf(draft.newGroup) : group;
  const problem = group === NEW_GROUP ? groupNameProblem(written, draft.kind) : undefined;
  const title = draft.kind === 'alias' ? t('New reference') : t('New color');
  return (
    <mds-modal opened interaction="strict" aria-label={title} onmdsModalClose={onClose}>
      <mds-banner
        slot="window"
        variant="light"
        tone="box"
        dismissible
        headline={title}
        onmdsBannerClose={onClose}
      >
        <div class="studio-dialog">
          <fieldset class="m-0 grid min-w-0 gap-label-control border-0 p-0">
            <legend class="pb-label-control">
              <mds-text typography="label" tag="span">
                {t('Kind')}
              </mds-text>
            </legend>
            <div class="studio-row">
              <Check
                type="radio"
                name="palette-new-kind"
                value="color"
                checked={draft.kind === 'color'}
                onChecked={(checked) => checked && update({ kind: 'color' })}
              >
                {t('Own color')}
              </Check>
              <Check
                type="radio"
                name="palette-new-kind"
                value="alias"
                checked={draft.kind === 'alias'}
                disabled={targets.length === 0}
                onChecked={(checked) => {
                  if (!checked) return;
                  const target = draft.alias || targets[0] || '';
                  update({
                    kind: 'alias',
                    alias: target,
                    name: draft.manual ? draft.name : (target.split('.')[1] ?? draft.name),
                  });
                }}
              >
                {t('Reference')}
              </Check>
            </div>
            <mds-text typography="caption" tag="p" class="text-fg-muted">
              {targets.length === 0
                ? t('No base-color family to reference yet.')
                : t('A reference follows another family instead of solving a palette.')}
            </mds-text>
          </fieldset>
          {draft.kind === 'color' ? (
            // keyed apart: a colour field and a select are two controls, not one changing type
            <Field key="color" label={t('Color')}>
              <ColorInput
                value={draft.color}
                onValue={(hex) =>
                  update({ color: hex, name: draft.manual ? draft.name : nearestColorName(hex) })
                }
              />
            </Field>
          ) : (
            <Field key="references" label={t('References')}>
              <Select
                value={draft.alias}
                options={targets.map((name) => ({ value: name, label: name }))}
                onValue={(target) =>
                  update({
                    alias: target,
                    name: draft.manual ? draft.name : (target.split('.')[1] ?? draft.name),
                  })
                }
              />
            </Field>
          )}
          <Field label={t('Group')}>
            <Select
              value={group}
              disabled={draft.kind === 'alias'}
              options={
                draft.kind === 'alias'
                  ? [{ value: 'variant', label: 'variant' }]
                  : [
                      ...choices.map((one) => ({ value: one, label: one })),
                      { value: NEW_GROUP, label: t('New group') },
                    ]
              }
              onValue={(next) => update({ group: next })}
            />
          </Field>
          {group === NEW_GROUP && (
            <Field
              key="new-group"
              label={t('Name of the group')}
              variant={draft.newGroup && problem ? 'error' : undefined}
              message={problem ? t(problem) : undefined}
            >
              <TextInput value={draft.newGroup} onValue={(newGroup) => update({ newGroup })} />
            </Field>
          )}
          <Field label={t('Name')}>
            <TextInput
              value={draft.name}
              // a name the person types stops following the picker; the echo of a name the studio
              // sets never reaches here (magma.tsx)
              onValue={(name) => update({ name, manual: true })}
            />
          </Field>
          <div class="studio-row">
            <span
              class="studio-swatch"
              style={{
                background:
                  draft.kind === 'alias'
                    ? (config.colors.find((one) => one.name === draft.alias)?.color ??
                      'transparent')
                    : draft.color,
              }}
            />
            <mds-text typography="snippet" tag="code">
              {`${written}.${draft.name}`}
            </mds-text>
            <mds-text typography="snippet" tag="code" class="text-fg-muted">
              {draft.kind === 'alias' ? `-> ${draft.alias}` : draft.color}
            </mds-text>
          </div>
        </div>
        <mds-button
          slot="action"
          type="button"
          variant="dark"
          tone="outline"
          label={t('Cancel')}
          onClick={onClose}
        ></mds-button>
        <mds-button
          slot="action"
          type="button"
          disabled={!draft.name.trim() || !!problem || (draft.kind === 'alias' && !draft.alias)}
          label={draft.kind === 'alias' ? t('Add reference') : t('Add color')}
          onClick={() =>
            onAdd({
              kind: draft.kind,
              color: draft.color,
              alias: draft.alias,
              name: draft.name,
              group: written,
              manual: draft.manual,
            })
          }
        ></mds-button>
      </mds-banner>
    </mds-modal>
  );
}
