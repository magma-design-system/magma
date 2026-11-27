import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  BORDER_ROLES,
  SURFACE_ROLES,
} from '@maggioli-design-system/design-tokens/src/lib/surface.mjs';
import { TEXT_ROLES } from '@maggioli-design-system/design-tokens/src/lib/text-role.mjs';
import { DEFAULT_TARGETS } from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js';
import { touchedCellsOfWeights, touchedPairs } from '../../engine/touched.js';
import {
  BORDER_RANGE,
  DEFAULT_THEME,
  MODES,
  percentOf,
  SURFACE_RANGE,
  surfaceOrderProblems,
  TEXT_TARGET_MAX,
  weightsOf,
  type LevelRange,
  type Levels,
  type Mode,
} from '../../engine/weights.js';
import { applyFrame } from '../../shared/frames/frame.js';
import { Range } from '../../shared/magma/magma.js';
import { msg, plural, useT } from '../../shared/i18n/i18n.js';
import { stageOf } from '../../shared/routes/routes.js';
import { BORDER_PURPOSE, SURFACE_PURPOSE, TEXT_PURPOSE } from '../../shared/ui/role-purposes.js';
import { TouchedPairs } from '../../shared/ui/touched-pairs.js';
import { GateBadge } from '../../shared/ui/verdict.js';
import { setBorderLevel, setSurfaceLevel, setTextTarget } from '../../state/surfaces.js';
import { useStudio } from '../../state/studio.js';
import { IT_WEIGHTS } from './i18n-it.js';
import './weights.css';

/*
  The stage Weights (#1403; Semantic surface until then): the weights of the preset, the lightness
  of its surfaces and borders in one mode and the targets of its texts, balanced while the product
  is in view (studio.object-model.md, section 5, "2. Pesi"). Chosen on its render (vittorio,
  2026-11-27): the tabs Light and Dark at its head, one mode at a time, the scene of the product
  beside following the tab; then the pairs of the contrast check the weights of the mode touch, in
  a closed detail as in Colours; then surfaces, borders and texts one under the other, the texts
  with one target for both modes, as the engine holds them. Built as Magma says today, without
  mds-preview, until #1487 lands in main. Which families generate surfaces is not here: it is a
  field of the family (Colours) and of the group (Groups). A surface moved past its neighbour pushes
  it along, so the order of depth holds (engine/weights.ts, vittorio, 2026-11-27).
*/

const MODE_LABEL: Record<Mode, string> = { light: msg('Light'), dark: msg('Dark') };
/** The name of a mode inside a text. */
const MODE_NAME: Record<Mode, string> = { light: msg('light'), dark: msg('dark') };

export function WeightsPage() {
  const t = useT(IT_WEIGHTS);
  const studio = useStudio();
  const config = studio.config.value;
  const report = studio.report.value;
  const scene = studio.scene.value;
  const choices = studio.themeChoices.value;
  const json = studio.json.value;
  const [mode, setMode] = useState<Mode>('light');
  const theme = weightsOf(config);
  const surfaces = theme.surfaces[mode] as Levels;
  const problems = surfaceOrderProblems(surfaces, SURFACE_ROLES);

  // the pairs of the contrast check the weights of the mode touch, measured after the render that
  // changed them (touched.ts, two runs of the check): the count follows the report at once
  const [touched, setTouched] = useState<{ mode: Mode; cells: Set<string> }>();
  useEffect(() => {
    const timer = setTimeout(
      () => setTouched({ mode, cells: touchedCellsOfWeights(config, mode, choices) }),
      0,
    );
    return () => clearTimeout(timer);
  }, [json, mode, choices]);
  const cells = touched?.mode === mode ? touched.cells : undefined;
  const pairs = useMemo(() => (cells ? touchedPairs(report, cells) : undefined), [cells, report]);

  // the region that scrolls is `relative`, the containing block of what it positions, as the shell
  // asks of every page (style.css, .studio): the hidden name of each slider (magma.css,
  // .studio-hidden) is absolute, and with no positioned ancestor it sits on the document below the
  // window, so the window scrolled too and the bar covered the strip of the stages
  return (
    <main class="@container/weights relative h-full min-h-0 overflow-y-auto px-(--magma-width-page-gutter) pt-inset pb-between-sections">
      <div class="grid content-start gap-x-between-containers @side/weights:grid-cols-[minmax(0,1fr)_calc(var(--spacing)*10400)] @side/weights:items-start">
        <div class="grid min-w-0 content-start gap-between-groups">
          {/* the head of the view: its title with the verdict of the contrast check beside it */}
          <header class="grid gap-title-content">
            <div class="flex flex-wrap items-center gap-inline">
              <mds-text typography="page" tag="h1">
                {t(stageOf('weights').label)}
              </mds-text>
              <GateBadge verdict={report.verdict} />
            </div>
            <mds-text typography="detail" tag="p" class="max-w-text text-fg-muted">
              {t(
                'Balance the surfaces, borders and texts of the preset, one mode at a time, looking at the product beside.',
              )}
            </mds-text>
          </header>

          {/* one mode at a time; the scene beside follows it */}
          <div>
            <mds-tab
              aria-label={t('Mode')}
              onmdsTabChange={(event: CustomEvent<{ id: number; value?: string }>) => {
                const value = MODES.find((one) => one === event.detail?.value);
                if (value) setMode(value);
              }}
            >
              {MODES.map((one) => (
                <mds-tab-item
                  type="button"
                  label={t(MODE_LABEL[one])}
                  value={one}
                  selected={one === mode}
                ></mds-tab-item>
              ))}
            </mds-tab>
          </div>

          <TouchedPairs pairs={pairs} mode={mode} />

          {/* a preset loaded out of order: the stage itself never writes one */}
          {problems.length > 0 && (
            <mds-banner
              variant="warning"
              headline={plural(
                t,
                problems.length,
                '{count} surface is lighter than the one above it',
                '{count} surfaces are lighter than the one above them',
              )}
            >
              {t(
                'In each mode a surface is never lighter than the one above it, from sunken to overlay; equal levels are allowed. Move either slider and the surfaces past it follow.',
              )}
              <ul>
                {problems.map((problem) => (
                  <li>{t('{role} at {level} over {above} at {aboveLevel}', { ...problem })}</li>
                ))}
              </ul>
            </mds-banner>
          )}

          <LevelGroup
            id="weights-surfaces"
            title={t('Surfaces')}
            caption={t('lightness in {mode}, {min}-{max}', {
              mode: t(MODE_NAME[mode]),
              ...SURFACE_RANGE[mode],
            })}
            roles={SURFACE_ROLES}
            levels={surfaces}
            purpose={SURFACE_PURPOSE}
            range={SURFACE_RANGE}
            mode={mode}
            onChange={(role, value) => setSurfaceLevel(studio, mode, role, value)}
          />
          <LevelGroup
            id="weights-borders"
            title={t('Borders')}
            caption={t('lightness in {mode}, {min}-{max}', {
              mode: t(MODE_NAME[mode]),
              ...BORDER_RANGE[mode],
            })}
            roles={BORDER_ROLES}
            levels={theme.borders[mode] as Levels}
            purpose={BORDER_PURPOSE}
            range={BORDER_RANGE}
            mode={mode}
            onChange={(role, value) => setBorderLevel(studio, mode, role, value)}
          />
          <TextTargets
            targets={
              (theme.text ?? DEFAULT_THEME.text) as Record<string, number | { step: number }>
            }
            onChange={(role, value) => setTextTarget(studio, role, value)}
          />
        </div>

        <aside
          class="hidden min-w-0 content-start gap-inline @side/weights:sticky @side/weights:top-inset @side/weights:grid"
          aria-label={t('The scene of the product')}
        >
          {scene?.themes[0] && <SceneOfMode theme={scene.themes[0]} css={scene.css} mode={mode} />}
        </aside>
      </div>
    </main>
  );
}

/**
 * The scene of the product beside the weights (scene.html): the base theme of the preset, the
 * first of the scene (scene-css.ts), whose surfaces are the whole page, in the mode of the tab; a
 * theme of one mode only stays in its mode and the line over the scene says so.
 */
function SceneOfMode({
  theme,
  css,
  mode,
}: {
  theme: { name: string; modes: readonly Mode[] };
  css: string;
  mode: Mode;
}) {
  const t = useT(IT_WEIGHTS);
  const frame = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(0);
  const shown: Mode = theme.modes.includes(mode) ? mode : theme.modes[0];

  useEffect(() => {
    const page = frame.current?.contentDocument;
    if (!page?.documentElement) return;
    applyFrame(page, {
      theme: theme.name,
      scheme: shown,
      contrast: false,
      css,
      modes: theme.modes,
    });
  }, [theme.name, shown, css, loaded]);

  return (
    <>
      <mds-text typography="detail" tag="p" class="text-fg-muted" data-scene-line>
        {shown === mode
          ? t('The scene of the product, in the theme {theme}, in {mode}: it follows the tab.', {
              theme: theme.name,
              mode: t(MODE_NAME[mode]),
            })
          : t('The theme {theme} has no {mode} mode: the scene shows it in {shown}.', {
              theme: theme.name,
              mode: t(MODE_NAME[mode]),
              shown: t(MODE_NAME[shown]),
            })}
      </mds-text>
      <iframe
        ref={frame}
        class="weights-frame"
        src="scene.html"
        title={t(
          shown === 'light'
            ? 'The product in the theme {theme}, light mode'
            : 'The product in the theme {theme}, dark mode',
          { theme: theme.name },
        )}
        onLoad={() => setLoaded((count) => count + 1)}
      />
    </>
  );
}

/** The name of a role and what it is for, the first column of a group of weights. */
function RoleName({ role, purpose }: { role: string; purpose: string }) {
  return (
    <div class="grid">
      <mds-text typography="detail" tag="span">
        {role}
      </mds-text>
      <mds-text typography="caption" tag="span" class="text-fg-muted">
        {purpose}
      </mds-text>
    </div>
  );
}

/** The head of a group of weights: its name, and what its sliders measure. */
function GroupHead({ id, title, caption }: { id: string; title: string; caption: string }) {
  return (
    <div class="mb-title-content flex flex-wrap items-baseline gap-inline">
      <mds-text typography="part" tag="h2" id={id}>
        {title}
      </mds-text>
      <mds-text typography="caption" tag="span" class="text-fg-muted">
        {caption}
      </mds-text>
    </div>
  );
}

interface LevelGroupProps {
  id: string;
  title: string;
  caption: string;
  roles: readonly string[];
  levels: Levels;
  purpose: Record<string, string>;
  range: LevelRange;
  mode: Mode;
  onChange: (role: string, percent: number) => void;
}

/**
 * The lightness of each role of a group (surfaces, borders) in the mode of the tab. The sliders of
 * a mode are its own, mounted anew by the tab (`key`): an mds-input-range kept across the tabs
 * would take the level of the other mode while it still has the bounds of this one, clamp it and
 * hand the clamped level back as a change (seen in the browser: every surface at 50%).
 */
function LevelGroup({
  id,
  title,
  caption,
  roles,
  levels,
  purpose,
  range,
  mode,
  onChange,
}: LevelGroupProps) {
  const t = useT(IT_WEIGHTS);
  return (
    <section aria-labelledby={id}>
      <GroupHead id={id} title={title} caption={caption} />
      <div class="weights-grid" data-group={id} key={mode}>
        {roles.map((role) => (
          <>
            <RoleName role={role} purpose={t(purpose[role])} />
            <Range
              value={percentOf(levels[role])}
              min={range[mode].min}
              max={range[mode].max}
              label={`${title} ${role}, ${t(MODE_NAME[mode])}`}
              onValue={(value) => onChange(role, value)}
            />
          </>
        ))}
      </div>
    </section>
  );
}

/**
 * The text targets are an APCA Lc magnitude, one for both modes (text-role.mts), so they stand the
 * same under either tab. A `{ step }` pin is shown read-only. Beside each target, the floor the
 * contrast check holds the role to (DEFAULT_TARGETS of contrast-gate.ts), marked when the target is
 * under it (#1418): the engine keeps a text over its floor on the washes of its family (#1414), so
 * the part of a slider under the floor does not make the text weaker.
 */
function TextTargets({
  targets,
  onChange,
}: {
  targets: Record<string, number | { step: number }>;
  onChange: (role: string, target: number) => void;
}) {
  const t = useT(IT_WEIGHTS);
  return (
    <section aria-labelledby="weights-texts">
      <GroupHead
        id="weights-texts"
        title={t('Texts')}
        caption={t('APCA Lc target, the same in both modes')}
      />
      <div class="weights-grid weights-grid--floor" data-group="weights-texts">
        {TEXT_ROLES.map((role) => {
          const level = targets[role];
          return (
            <>
              <RoleName role={role} purpose={t(TEXT_PURPOSE[role])} />
              {typeof level === 'object' ? (
                <mds-text typography="caption" tag="span" class="text-fg-muted">
                  {t('step {step} (pinned)', { step: level.step })}
                </mds-text>
              ) : (
                <Range
                  value={level ?? 0}
                  min={0}
                  max={TEXT_TARGET_MAX}
                  label={t('Text {role}, target', { role })}
                  onValue={(value) => onChange(role, value)}
                />
              )}
              <TextFloor role={role} level={level} />
            </>
          );
        })}
      </div>
    </section>
  );
}

/** The floor of the check for a text role, and whether the target stands under it. */
function TextFloor({
  role,
  level,
}: {
  role: string;
  level: number | { step: number } | undefined;
}) {
  const t = useT(IT_WEIGHTS);
  const floor = DEFAULT_TARGETS.text[role as keyof typeof DEFAULT_TARGETS.text];
  if (floor === undefined) return <span />;
  const under = typeof level === 'number' && level < floor;
  return (
    <span class="flex flex-wrap items-center gap-inline">
      <mds-text typography="caption" tag="span" class="text-fg-muted">
        {t('floor {floor}', { floor })}
      </mds-text>
      {under && (
        <mds-badge
          variant="warning"
          tone="weak"
          label={t('under the floor')}
          title={t(
            'The contrast gate holds this text to Lc {floor}, on the surfaces and on the washes that carry it.',
            { floor },
          )}
        ></mds-badge>
      )}
    </span>
  );
}
