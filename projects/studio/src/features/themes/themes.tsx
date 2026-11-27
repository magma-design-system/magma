import type { ComponentChild } from 'preact';
import { useMemo, useRef, useState } from 'preact/hooks';
import type { ColorMode } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config';
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { resolveBaseColor } from '../../engine/families.js';
import {
  accentChoices,
  accentSample,
  themeRows,
  themeSetsOf,
  tintChoices,
  type ThemeKind,
  type ThemeRow,
  type ThemeSets,
} from '../../engine/theme-list.js';
import { ACCENT_ROLES, accentOfTheme } from '../../engine/themes.js';
import { cellsOfTheme, touchedPairs } from '../../engine/touched.js';
import { Check, Field, Select, TextInput } from '../../shared/magma/magma.js';
import { msg, rich, useT, type T } from '../../shared/i18n/i18n.js';
import { hrefOf, stageOf, themeRoute } from '../../shared/routes/routes.js';
import { ThemeScene } from '../../shared/ui/theme-scene.js';
import { TouchedPairs } from '../../shared/ui/touched-pairs.js';
import { GateBadge, ThemeVerdict } from '../../shared/ui/verdict.js';
import { selectFamily } from '../../state/palette.js';
import { useStudio } from '../../state/studio.js';
import { setThemeAccent, setThemeModes, setThemeName } from '../../state/theme-choices.js';
import { deleteTheme, moveTheme } from '../../state/themes.js';
import { IT_THEMES } from './i18n-it.js';
import './themes.css';

/*
  The stage Themes (#1404; the Themes page of the Colors section until then): the theme at the
  centre, its tint, its accents and its modes judged on the scene (studio.object-model.md, section
  5, "3. Temi"). Around it: the themes in a list beside, the ready ones Magma ships and those of the
  product, each with the verdict of the contrast check per mode; the theme at the centre with its
  verdict, its pairs in a closed detail as in Colours, then its fields in line, the tint and the
  accents among the families with their sample and a link to Colours; the scene of the product
  beside, in a mode and a contrast. A new theme is born in the opening. The other themes speak only
  when one breaks: the toast of the shell (app/shell.tsx, BrokenThemes). Built as Magma says today:
  record-detail with the list beside, as Colours, until list and detail (#1262) lands.
*/

/** The title of the theme at the centre: the actions of the list give it the focus. */
const THEME_TITLE = 'themes-theme-title';

/** The colour modes a theme can be used in (#1274), as its select offers them. */
const MODE_CHOICES: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'light dark', label: msg('Light and dark') },
  { value: 'light', label: msg('Light only') },
  { value: 'dark', label: msg('Dark only') },
];

/** The groups of the list, in its order: the themes Magma ships (the base first), the product's. */
const LIST_GROUPS: ReadonlyArray<{ kinds: ThemeKind[]; title: string }> = [
  { kinds: ['base', 'ready'], title: msg('Ready themes') },
  { kinds: ['product'], title: msg('Themes of the product') },
];

/** What a theme is, under its name. */
const KIND_LINE: Record<ThemeKind, string> = {
  base: msg('The base theme: the page wears it with no {attribute}, in {root}.'),
  ready: msg('A ready theme Magma ships: a page wears it with {attribute}.'),
  product: msg('A theme of the product: a page wears it with {attribute}.'),
};

/** The label of an accent role in its field: `ai` is an acronym. */
const ACCENT_LABEL: Record<string, string> = { accent: msg('Accent'), ai: msg('AI accent') };

/** The address a theme is opened at: its name, or its family while its name cannot be used. */
const keyOf = (row: ThemeRow): string => (row.nameProblem ? row.family : row.name);

export function ThemesPage({
  theme: asked,
  foot,
  onTheme,
}: {
  /** The theme the address names, by its name (or its family), else the base. */
  theme?: string;
  foot?: ComponentChild;
  /** The address of the theme at the centre changed (a new name): written in place. */
  onTheme: (theme: string) => void;
}) {
  const t = useT(IT_THEMES);
  const studio = useStudio();
  const config = studio.config.value;
  const json = studio.json.value;
  const choices = studio.themeChoices.value;
  const report = studio.report.value;
  const scene = studio.scene.value;
  const [listOpen, setListOpen] = useState(false);
  const menu = useRef<HTMLMdsDropdownElement>(null);

  // the role sets of the families, solved by the real generator on the preset
  const generated = useMemo(() => themeSetsOf(config), [json]);
  const rows = useMemo(
    () => (generated.color ? themeRows(config, generated.color, choices) : []),
    [generated, choices],
  );
  // the theme the address names: by its name, a name that can be used first (two themes meet on a
  // name only while one of them cannot use it), else by its family, else the base
  const current =
    rows.find((row) => !row.nameProblem && row.name === asked) ??
    rows.find((row) => row.name === asked || row.family === asked) ??
    rows[0];
  const gate = current && report.themes.find((one) => one.family === current.family);
  const pairs = useMemo(
    () => (current ? touchedPairs(report, cellsOfTheme(report, current.name)) : undefined),
    [report, current?.name],
  );

  const closeMenu = () => {
    if (menu.current) menu.current.visible = false;
  };

  return (
    <div class="@container/themes h-full">
      <div class="grid h-full grid-cols-[calc(var(--spacing)*6000)_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] @max-list-beside/themes:grid-cols-1">
        {/* where the list stands above the page, folded into the theme at the centre, as in
          Colours (#1311) */}
        <div class="hidden px-inline pt-inset @max-list-beside/themes:block">
          <mds-button
            type="button"
            icon={listOpen ? 'mi/baseline/expand-less' : 'mi/baseline/expand-more'}
            icon-position="right"
            variant="dark"
            tone="weak"
            class="w-full justify-between [--mds-button-label-transform:none]"
            label={current?.name ?? ''}
            aria-expanded={listOpen ? 'true' : 'false'}
            aria-controls="themes-list"
            onClick={() => setListOpen(!listOpen)}
          ></mds-button>
        </div>
        <ThemeList
          t={t}
          config={config}
          rows={rows}
          report={report}
          current={current}
          open={listOpen}
          onOpen={() => setListOpen(false)}
        />
        <main
          class={
            listOpen
              ? 'relative col-start-2 row-span-2 row-start-1 min-h-0 overflow-y-auto px-(--magma-width-page-gutter) pt-inset pb-between-sections @max-list-beside/themes:hidden'
              : 'relative col-start-2 row-span-2 row-start-1 min-h-0 overflow-y-auto px-(--magma-width-page-gutter) pt-inset pb-between-sections @max-list-beside/themes:col-start-1 @max-list-beside/themes:row-span-1 @max-list-beside/themes:row-start-2'
          }
        >
          {/* the head of the view: its title with the verdict of the contrast check beside it */}
          <header class="mb-between-sections grid gap-title-content">
            <div class="flex flex-wrap items-center gap-inline">
              <mds-text typography="page" tag="h1">
                {t(stageOf('themes').label)}
              </mds-text>
              <GateBadge verdict={report.verdict} />
            </div>
            <mds-text typography="detail" tag="p" class="max-w-text text-fg-muted">
              {t('The tint, the accents and the modes of a theme, judged on the scene.')}
            </mds-text>
          </header>

          {generated.error && (
            <mds-banner variant="error" headline={t('The preset generates no theme')}>
              {generated.error}
            </mds-banner>
          )}

          {current && generated.sets && (
            <div class="@container/theme">
              <div class="grid content-start gap-x-between-groups @side/theme:grid-cols-[minmax(0,1fr)_calc(var(--spacing)*10400)] @side/theme:items-start">
                <div class="mb-title-content flex flex-wrap items-center gap-inline @side/theme:col-start-1">
                  <mds-text
                    id={THEME_TITLE}
                    typography="section"
                    tag="h2"
                    tabIndex={-1}
                    class="focus-visible:outline-(--magma-outline-focus) focus-visible:outline-offset-(--magma-outline-focus-offset)"
                  >
                    {current.name}
                  </mds-text>
                  <KindBadge t={t} kind={current.kind} />
                  {/* the actions of the theme in its menu, Delete last (actions.md,
                    destructive-in-menu); the base theme is :root and has none */}
                  {current.kind !== 'base' && (
                    <mds-button
                      id="themes-theme-actions"
                      type="button"
                      icon="mi/baseline/more-vert"
                      variant="dark"
                      tone="text"
                      aria-label={t('Actions of {theme}', { theme: current.name })}
                    ></mds-button>
                  )}
                </div>
                <div class="mb-between-groups grid gap-inline @side/theme:col-start-1">
                  <mds-text typography="detail" tag="p" class="max-w-text text-fg-muted">
                    {rich(t, KIND_LINE[current.kind], {
                      attribute: <code>{`data-theme-name="${current.name}"`}</code>,
                      root: <code>{':root'}</code>,
                    })}
                  </mds-text>
                  <ThemeVerdict theme={gate} />
                  <TouchedPairs pairs={pairs} whole />
                </div>
                {/* the scene beside, where the view has the room of a column for it (--container-side);
                  narrower it is not drawn, as in Weights: a page as tall as a phone would push the work down */}
                <div class="hidden @side/theme:sticky @side/theme:top-inset @side/theme:col-start-2 @side/theme:row-span-5 @side/theme:row-start-1 @side/theme:block">
                  <SceneBeside t={t} theme={current} css={scene?.css} />
                </div>
                <section
                  class="grid max-w-form content-start gap-between-fields @side/theme:col-start-1"
                  aria-labelledby={THEME_TITLE}
                >
                  <ThemeFields
                    t={t}
                    config={config}
                    sets={generated.sets}
                    rows={rows}
                    theme={current}
                    onRenamed={(name) => onTheme(name)}
                  />
                </section>
                {current.kind !== 'base' && (
                  <mds-dropdown
                    ref={menu}
                    target="#themes-theme-actions"
                    placement="bottom-start"
                    strategy="fixed"
                  >
                    <div class="studio-dropdown">
                      <mds-button
                        type="button"
                        icon="mi/baseline/delete"
                        variant="error"
                        tone="text"
                        class="studio-menu-link"
                        label={t('Delete theme')}
                        onClick={() => {
                          closeMenu();
                          deleteTheme(studio, current.family);
                          onTheme('');
                        }}
                      ></mds-button>
                    </div>
                  </mds-dropdown>
                )}
              </div>
            </div>
          )}
          {foot && <div class="mt-between-sections">{foot}</div>}
        </main>
      </div>
    </div>
  );
}

/** What a theme is, as a badge beside its name: the product's need none. */
function KindBadge({ t, kind }: { t: T; kind: ThemeKind }) {
  if (kind === 'base') return <mds-badge variant="dark" tone="weak" label={t('base')}></mds-badge>;
  if (kind === 'ready')
    return <mds-badge variant="dark" tone="weak" label={t('ready')}></mds-badge>;
  return null;
}

/** The themes of the preset, the ready ones then the product's, each with its verdict per mode. */
function ThemeList({
  t,
  config,
  rows,
  report,
  current,
  open,
  onOpen,
}: {
  t: T;
  config: MagmaConfig;
  rows: ThemeRow[];
  report: ReturnType<typeof useStudio>['report']['value'];
  current: ThemeRow | undefined;
  open: boolean;
  onOpen: () => void;
}) {
  return (
    <aside
      id="themes-list"
      class={
        open
          ? 'col-start-1 row-span-2 row-start-1 grid min-h-0 content-start gap-between-fields overflow-y-auto border-e border-border-muted px-inline py-inset @max-list-beside/themes:row-span-1 @max-list-beside/themes:row-start-2 @max-list-beside/themes:border-e-0'
          : 'col-start-1 row-span-2 row-start-1 grid min-h-0 content-start gap-between-fields overflow-y-auto border-e border-border-muted px-inline py-inset @max-list-beside/themes:hidden'
      }
      aria-label={t('The themes of the preset')}
    >
      {/* a new theme is born in the opening (the model, section 5): the way there, the main
        action of the list, a part of the page (actions.md, part-primary) */}
      <mds-button
        href={hrefOf({ section: 'opening' })}
        icon="mi/baseline/add"
        variant="primary"
        tone="outline"
        class="w-full"
        label={t('New theme')}
        title={t('A new theme is born in the opening, from a ready theme or a brand colour')}
      ></mds-button>
      {LIST_GROUPS.map((group) => {
        const themes = rows.filter((row) => group.kinds.includes(row.kind));
        if (!themes.length) return null;
        return (
          <div class="grid gap-inline">
            <mds-text typography="part" tag="h2">
              {t(group.title)}
            </mds-text>
            <ul class="m-0 grid list-none gap-inline p-0 [--mds-button-label-transform:none]">
              {themes.map((row) => {
                const here = row.family === current?.family;
                const source = config.colors.find((one) => one.name === row.fullName);
                return (
                  <li class="grid gap-label-control">
                    {/* until Magma has a list and detail (#1262): a link of Magma per theme, the
                      one at the centre marked by aria-current and the weak tone; its swatch the
                      icon, painted with the colour of its tint (--themes-swatch, themes.css) */}
                    <mds-button
                      href={hrefOf(themeRoute(keyOf(row)))}
                      icon="mdi/circle"
                      variant="dark"
                      tone={here ? 'weak' : 'text'}
                      aria-current={here ? 'page' : undefined}
                      class="themes-swatch w-full justify-start"
                      style={{
                        '--themes-swatch': source ? resolveBaseColor(config, source) : undefined,
                      }}
                      label={row.name}
                      onClick={onOpen}
                    ></mds-button>
                    <div class="ps-inline">
                      <ThemeVerdict
                        theme={report.themes.find((one) => one.family === row.family)}
                      />
                      {row.nameProblem && (
                        <mds-text typography="caption" tag="p" class="text-fg-muted">
                          {t('Not painted until it has a name it can use')}
                        </mds-text>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </aside>
  );
}

/**
 * The fields of the theme at the centre: its name (a theme of the product), its tint, its accents,
 * its modes; each family named with a link to Colours, where it is adjusted.
 */
function ThemeFields({
  t,
  config,
  sets,
  rows,
  theme,
  onRenamed,
}: {
  t: T;
  config: MagmaConfig;
  sets: ThemeSets;
  rows: ThemeRow[];
  theme: ThemeRow;
  onRenamed: (name: string) => void;
}) {
  const studio = useStudio();
  const choices = studio.themeChoices.value;
  const tints = tintChoices(config, rows, theme.family);
  const accents = accentChoices(sets);
  const familyOf = (variant: string) =>
    config.colors.find((one) => one.name === `variant.${variant.replace('variant-', '')}`);

  return (
    <>
      {theme.kind === 'product' && (
        <Field
          label={t('Name')}
          message={theme.nameProblem ?? undefined}
          variant={theme.nameProblem ? 'error' : undefined}
        >
          <TextInput
            value={theme.name}
            commit="leave"
            variant={theme.nameProblem ? 'error' : undefined}
            onValue={(value) => {
              const name = value.trim();
              setThemeName(studio, theme.family, name);
              onRenamed(name);
            }}
          />
        </Field>
      )}

      <div class="grid gap-label-control">
        {theme.kind === 'product' ? (
          <Field label={t('Tint')}>
            <Select
              size="md"
              value={theme.fullName}
              onValue={(name) => moveTheme(studio, theme.family, name)}
              options={tints.map((name) => ({ value: name, label: name }))}
            />
          </Field>
        ) : (
          <mds-text typography="label" tag="p">
            {t('Tint')}
          </mds-text>
        )}
        <FamilyLine
          t={t}
          config={config}
          name={theme.fullName}
          note={
            theme.kind === 'base'
              ? t('The tint of the base theme is the neutral family of Magma.')
              : theme.kind === 'ready'
                ? t(
                    'The tint of a ready theme comes with its file: open it in the opening to make a theme of your own.',
                  )
                : undefined
          }
        />
      </div>

      {ACCENT_ROLES.map((role) => {
        const variant = accentOfTheme(theme.family, role, choices);
        const family = familyOf(variant);
        return (
          <div class="grid gap-label-control">
            <Field label={t(ACCENT_LABEL[role] ?? role)}>
              <Select
                size="md"
                value={variant}
                onValue={(next) => setThemeAccent(studio, theme.family, role, next)}
                options={accents.map((one) => ({
                  value: one,
                  label:
                    one === semantic.accents[role]
                      ? t('{variant} (base)', { variant: one.replace('variant-', '') })
                      : one.replace('variant-', ''),
                }))}
              />
            </Field>
            <div class="flex flex-wrap items-center gap-inline">
              {(['light', 'dark'] as const).map((mode) => (
                <AccentSample
                  t={t}
                  role={role}
                  mode={mode}
                  sample={accentSample(sets, theme.family, variant, mode)}
                />
              ))}
            </div>
            {family && <FamilyLine t={t} config={config} name={family.name} />}
          </div>
        );
      })}

      <Field label={t('Modes')}>
        <Select
          size="md"
          value={theme.modes.join(' ')}
          onValue={(value) => setThemeModes(studio, theme.family, value.split(' ') as ColorMode[])}
          options={MODE_CHOICES.map((choice) => ({ ...choice, label: t(choice.label) }))}
        />
      </Field>
    </>
  );
}

/** A family the theme takes a colour from: its swatch, its name, the link to it in Colours. */
function FamilyLine({
  t,
  config,
  name,
  note,
}: {
  t: T;
  config: MagmaConfig;
  name: string;
  note?: string;
}) {
  const studio = useStudio();
  const family = config.colors.find((one) => one.name === name);
  return (
    <mds-text typography="caption" tag="p" class="text-fg-muted">
      <span
        class="themes-family-swatch"
        style={{ '--themes-swatch': family ? resolveBaseColor(config, family) : undefined }}
        aria-hidden="true"
      ></span>{' '}
      {rich(t, '{family}, in {colours}', {
        family: <code>{name}</code>,
        colours: (
          <mds-link
            href={hrefOf(stageOf('colours').route)}
            onClick={() => selectFamily(studio, name)}
          >
            {t(stageOf('colours').label)}
          </mds-link>
        ),
      })}
      {note && <> {note}</>}
    </mds-text>
  );
}

/**
 * An accent applied on the theme in a mode: its solid fill with its ink and their APCA Lc, its soft
 * wash with its ink. The colours are the data of the sample (themes.css paints the frame).
 */
function AccentSample({
  t,
  role,
  mode,
  sample,
}: {
  t: T;
  role: string;
  mode: 'light' | 'dark';
  sample: ReturnType<typeof accentSample>;
}) {
  return (
    <span class="themes-sample" data-mode={mode}>
      <mds-text typography="caption" tag="span" class="text-fg-muted">
        {t(mode === 'light' ? 'Light' : 'Dark')}
      </mds-text>
      <span class="themes-sample-fill" style={{ background: sample.fill, color: sample.ink }}>
        {role}
      </span>
      {/* a sample of type, the same in every language */}
      <span class="themes-sample-soft" style={{ background: sample.wash, color: sample.fg }}>
        {'Aa'}
      </span>
      <mds-text typography="caption" tag="span">
        {`Lc ${sample.lc}`}
      </mds-text>
    </span>
  );
}

/**
 * The scene beside the theme: the page of a product in the theme, in the mode of its tabs (a mode
 * the theme does not offer cannot be chosen, and says why) and with more contrast when asked: the
 * conditions it is judged under (the model, section 4, "Prove").
 */
function SceneBeside({ t, theme, css }: { t: T; theme: ThemeRow; css: string | undefined }) {
  const [picked, setPicked] = useState<ColorMode>('light');
  const [contrast, setContrast] = useState(false);
  const mode: ColorMode = theme.modes.includes(picked) ? picked : theme.modes[0];
  const only = () =>
    theme.modes[0] === 'light'
      ? t('{theme} is light only', { theme: theme.name })
      : t('{theme} is dark only', { theme: theme.name });
  return (
    <aside class="grid min-w-0 gap-inline" aria-label={t('The scene of the product')}>
      <div
        class="flex flex-wrap items-center justify-between gap-inline"
        role="toolbar"
        aria-label={t('The conditions of the scene')}
      >
        <mds-tab
          aria-label={t('Mode')}
          onmdsTabChange={(event: CustomEvent<{ id: number; value?: string }>) => {
            const value = (['light', 'dark'] as const).find((one) => one === event.detail?.value);
            if (value) setPicked(value);
          }}
        >
          {(['light', 'dark'] as const).map((one) => (
            <mds-tab-item
              type="button"
              label={t(one === 'light' ? 'Light' : 'Dark')}
              value={one}
              selected={one === mode}
              disabled={!theme.modes.includes(one)}
              title={theme.modes.includes(one) ? undefined : only()}
            ></mds-tab-item>
          ))}
        </mds-tab>
        <Check checked={contrast} onChecked={setContrast} type="switch">
          {t('More contrast')}
        </Check>
      </div>
      {theme.nameProblem ? (
        <mds-text typography="detail" tag="p" class="text-fg-muted">
          {t('The scene paints the theme once its name can be used.')}
        </mds-text>
      ) : (
        <ThemeScene
          theme={theme.name}
          modes={theme.modes}
          css={css}
          scheme={mode}
          contrast={contrast}
          title={t('The theme {theme} on a page of a product', { theme: theme.name })}
        />
      )}
    </aside>
  );
}
