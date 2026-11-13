import { useEffect, useRef, useState } from 'preact/hooks';
import './start.css';
import { applyFrame } from './frame.js';
import { DEMO_STEPS, demoStep, type DemoReading, type DemoStep } from './start-demo.js';
import { msg, rich, useT } from './i18n.js';
import { verdictLabel } from './verdict.js';
import {
  BEHAVIOR_PAGES,
  COLORS_PAGES,
  hrefOf,
  type ColorsView,
  type MenuItem,
  type Route,
} from './routes.js';

/*
  The Start page (#693): an introduction, not a tool. It says what the studio is for, in a hero
  that shows it, then the steps of the work and what each section changes, from one colour to the
  whole product.

  The hero says what the studio is and what it offers, beside a short play run by the engine of
  the studio (start-demo.ts) on a banner of a product, painted with the configuration of Magma
  drawn pale: its text pinned to pale steps and the ramp of its accent faded. Three trays come out from
  behind the banner, one at a time (vittorio, 2026-11-09):
  - the problem, over the banner: what is wrong with it;
  - the fix, under it: what the gate says of the banner, its texts, its icons and its actions
    against their floors, and a bar of the pairs brought back over theirs, while the targets and
    the ramp come back step by step, solved again and judged again at each one, as an edit on the
    pages of Colors would be;
  - fixed, under it: a smaller tray says so, with Replay.
  The trays move with the elastic easing of Magma (--ease-out-back, start.css); the banner stays
  where it is, its room for the trays kept above and under it, so the band never changes height.
  The play runs once, under five seconds (PLAY_MS), so it needs no pause (WCAG 2.2.2 asks one of
  what moves by itself for longer); Replay plays it again. With less motion asked it does not play
  by itself: the hero opens on the banner fixed, and Replay plays it with the trays still. The
  figures that change are hidden from assistive technologies, which would read them at every step;
  the caption, hidden from the eye, says what the play shows. The banner is a document of its own
  (hero.html, frame.ts), so its colours leave the studio alone.
*/

/**
 * How long a tray takes to come out, after the one before it went back: --duration-150 of delay
 * and --duration-500 of movement in start.css.
 */
export const TRAY_MS = 650;
/** How long the problem stays out, once its tray is out, to be read. */
export const PROBLEM_MS = 1100;
/** How long each step of the fix stays: the bar fills in about half a second. */
export const STEP_MS = 90;
/**
 * How long the banner stays fixed with its figures, the bar full, before the last tray says so:
 * time to read the three indicators green (vittorio, 2026-11-09). The longest hold of the play,
 * paid by the steps of the bar and the delay of the trays, so the play stays under five seconds.
 */
export const SETTLE_MS = 900;
/**
 * The whole play, from the first tray coming out to the last one out: the problem, the tray of the
 * fix, its steps after the first, the settle, the last tray. Under five seconds, so no pause, with
 * room for the timers, which run a few tens of milliseconds late at each step (measured in
 * Chromium: 4.95 s of play for 4.75 s of timings).
 */
export const PLAY_MS =
  TRAY_MS + PROBLEM_MS + TRAY_MS + (DEMO_STEPS - 1) * STEP_MS + SETTLE_MS + TRAY_MS;

/** The moments of the play: none out yet, then the tray of each. */
export type Phase = 'ready' | 'problem' | 'fixing' | 'fixed';

/** Whether the person asked for less motion: then the play does not run by itself. */
const lessMotion = (): boolean =>
  typeof matchMedia !== 'function' || matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * What the studio offers, in the hero. Each line is true of the studio as it is, and its source is
 * the comment above it: a line the studio stops holding goes with it.
 */
export const FEATURES: string[] = [
  // the Themes page: the colour modes each theme is used in (theme-choices.ts, `modes`)
  msg('Themes in light and dark, or in one mode of your choice'),
  // the contrast gate of the build of Magma, run on the configuration at every edit (gate.ts)
  msg('Contrast checked by itself at every edit'),
  // Palette and Contrast scales: the base colour of a family, the contrast of each step of its ramp
  msg('Colour ramps you shape step by step'),
  // the downloads (app.tsx): the Figma tokens (DTCG), the configuration and the tokens Magma
  // builds with, the CSS tokens, a GIMP palette
  msg('Exports for Figma, the design system, CSS and GIMP'),
];

/**
 * The play: its moment and the step on screen. Each step is computed once for the page
 * (demoStep), after the paint that asked for it; while the problem is read, the steps of the fix
 * are computed ahead, one a task, so the fix keeps its time and the engine does not run while a
 * tray moves. `banner` says the banner is on screen, painted: the first tray waits for it, or it
 * would come out from behind nothing.
 */
function usePlay(banner: boolean) {
  const [phase, setPhase] = useState<Phase>(() => (lessMotion() ? 'fixed' : 'ready'));
  const [step, setStep] = useState(() => (lessMotion() ? DEMO_STEPS : 0));
  const [shown, setShown] = useState<DemoStep | undefined>();
  const compute = demoStep;

  useEffect(() => {
    const timer = setTimeout(() => setShown(compute(step)), 0);
    return () => clearTimeout(timer);
  }, [step]);

  // the first tray comes out after a paint with none out, so it moves, once the banner is there;
  // the fix after the problem
  useEffect(() => {
    if (phase === 'ready') {
      if (!banner) return;
      const timer = setTimeout(() => setPhase('problem'), 0);
      return () => clearTimeout(timer);
    }
    if (phase !== 'problem') return;
    const ahead = Array.from({ length: DEMO_STEPS }, (_, index) =>
      setTimeout(() => compute(index + 1), TRAY_MS),
    );
    const timer = setTimeout(() => setPhase('fixing'), TRAY_MS + PROBLEM_MS);
    return () => [...ahead, timer].forEach(clearTimeout);
  }, [phase, banner]);

  // the steps of the fix, the first once its tray is out, then the fixed banner a while
  useEffect(() => {
    if (phase !== 'fixing' || shown?.step !== step) return;
    const timer =
      step >= DEMO_STEPS
        ? setTimeout(() => setPhase('fixed'), SETTLE_MS)
        : setTimeout(() => setStep(step + 1), step === 0 ? TRAY_MS : STEP_MS);
    return () => clearTimeout(timer);
  }, [phase, step, shown]);

  return {
    phase,
    shown,
    replay: () => {
      setStep(0);
      setPhase('ready');
    },
  };
}

/**
 * Focus on an mds-button: it has no method for it and does not delegate the focus of its host, so
 * the native button it renders takes it.
 */
const focusButton = (host: HTMLElement | null) =>
  (host?.shadowRoot?.querySelector('button') ?? host)?.focus();

/** An indicator of the banner, a pair as the gate judges it: its Lc, and its floor. */
function Reading({ reading }: { reading: DemoReading }) {
  const { cell } = reading;
  const pass = cell.state === 'pass';
  const t = useT();
  return (
    <div class="start-reading">
      <mds-text typography="label" tag="dt" class="studio-muted">
        {t(reading.check.label)}
      </mds-text>
      <dd>
        <mds-text typography="h6" tag="span">{`Lc ${Math.round(cell.achieved)}`}</mds-text>
        <mds-badge
          variant={pass ? 'success' : 'error'}
          label={t(pass ? 'Meets {target}' : 'Below {target}', { target: cell.target })}
        ></mds-badge>
      </dd>
    </div>
  );
}

function Hero() {
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLElement>(null);
  const replayButton = useRef<HTMLElement>(null);
  const replayed = useRef(false);
  const [loaded, setLoaded] = useState(0);
  const [painted, setPainted] = useState(false);
  const [height, setHeight] = useState<number | undefined>();
  const play = usePlay(painted);
  const { phase, shown } = play;
  const t = useT();

  // the banner painted with the step on screen; the first paint of hero.html, once it has loaded,
  // starts the play
  useEffect(() => {
    if (!shown) return;
    const page = frame.current?.contentDocument;
    if (page?.documentElement)
      applyFrame(page, { theme: shown.theme, scheme: 'light', contrast: false, css: shown.css });
    if (loaded) setPainted(true);
  }, [shown, loaded]);

  // the frame is the banner: it takes the height of the page it holds, which its width decides.
  // CSS cannot size an iframe to its content (frame-sizing is not shipped), so the hero reads it;
  // until it does, the height of start.css stands
  useEffect(() => {
    const page = frame.current?.contentDocument;
    const view = page?.defaultView;
    if (!page?.body || typeof view?.ResizeObserver !== 'function') return;
    const observer = new view.ResizeObserver(() =>
      setHeight(Math.ceil(page.body.getBoundingClientRect().height) || undefined),
    );
    observer.observe(page.body);
    return () => observer.disconnect();
  }, [loaded]);

  // Replay goes back with its tray: the focus waits on the stage, and comes back to Replay when
  // the play ends there, so a keyboard never loses it
  const replay = () => {
    replayed.current = true;
    stage.current?.focus();
    play.replay();
  };
  useEffect(() => {
    if (phase !== 'fixed' || !replayed.current) return;
    replayed.current = false;
    if (document.activeElement === stage.current) focusButton(replayButton.current);
  }, [phase]);

  // a tray back behind the banner is out of reach: neither read nor focused
  const tray = (open: boolean) => ({ 'data-open': open ? '' : undefined, inert: !open });
  return (
    <section class="start-hero" aria-labelledby="start-title">
      <div class="start-frame start-hero-grid">
        {/* the title and what the studio is, then what it offers, a group apart */}
        <header class="start-hero-head">
          <div class="start-hero-intro">
            <mds-text typography="page" tag="h1" id="start-title">
              {t('The theme of your product, readable by everyone')}
            </mds-text>
            <mds-text typography="detail" tag="p">
              {t(
                'Magma Studio is where a product shapes its theme on Magma. You state how much contrast the text needs, and the studio picks the colours that meet it, in every theme and both modes.',
              )}
            </mds-text>
          </div>
          <mds-list class="start-features">
            {FEATURES.map((feature) => (
              <mds-list-item icon="mi/baseline/check-circle">{t(feature)}</mds-list-item>
            ))}
          </mds-list>
        </header>
        <figure class="start-stage" ref={stage} tabIndex={-1} data-phase={phase}>
          <div class="start-tray start-tray-over start-note" {...tray(phase === 'problem')}>
            <mds-icon
              name="mi/baseline/warning"
              class="start-note-icon start-note-problem"
              aria-hidden="true"
            ></mds-icon>
            <mds-text typography="detail" tag="p">
              {t(
                'The text, the icon and the main action of this banner are under their contrast targets.',
              )}
            </mds-text>
          </div>
          <iframe
            ref={frame}
            class="start-stage-frame"
            src="hero.html"
            title={t('A banner of a product, painted with the configuration of the animation')}
            style={height ? { blockSize: `${height}px` } : undefined}
            onLoad={() => setLoaded((count) => count + 1)}
          />
          {/* what the gate says of the banner at each step of the fix: figures for the eye,
              hidden from assistive technologies, which the caption tells what the play shows */}
          <div class="start-tray start-tray-under" {...tray(phase === 'fixing')}>
            <dl class="start-readings" aria-hidden="true">
              {shown?.readings.map((reading) => (
                <Reading reading={reading} />
              ))}
            </dl>
            <div class="start-meter" aria-hidden="true">
              <mds-text typography="caption" tag="p" class="start-meter-label">
                {shown && verdictLabel(t, shown.verdict)}
              </mds-text>
              <mds-progress
                progress={shown?.solved ?? 0}
                variant={shown?.tone ?? 'error'}
                size="md"
              ></mds-progress>
            </div>
          </div>
          {/* after the fix in the order of the page, so it comes out over the tray going back */}
          <div class="start-tray start-tray-under start-note" {...tray(phase === 'fixed')}>
            <mds-icon
              name="mi/baseline/check-circle"
              class="start-note-icon start-note-fixed"
              aria-hidden="true"
            ></mds-icon>
            <mds-text typography="detail" tag="p">
              {t('The contrast issues are fixed: the gate of Magma passes.')}
            </mds-text>
            <mds-button
              ref={replayButton}
              variant="light"
              size="sm"
              icon="mi/baseline/replay"
              icon-position="right"
              onClick={replay}
              label={t('Replay')}
            ></mds-button>
          </div>
          <figcaption class="studio-hidden">
            {t(
              'A banner painted with the configuration Magma builds with, drawn pale: its text pinned to pale steps of its ramp, under the floors of the contrast gate, and the ramp of its accent faded, so its text, its icon and its main action read poorly. Then the studio brings both back step by step, solving the colours again at each one, until every pair the gate judges meets its floor.',
            )}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

const palette: Route = { section: 'colors', view: 'colors' };
const colorsPage = (view: ColorsView) => COLORS_PAGES.find((page) => page.id === view)!;

interface Step {
  title: string;
  text: string;
  /** A link to a page: its label, translated where it is drawn, and its values. */
  link?: { label: string; vars?: Record<string, string>; route: Route; icon: string };
}

/** The steps of the work, in its order (#693, "The plan"). */
const stepsOf = (draftView?: ColorsView): Step[] => [
  {
    title: msg('Start from a configuration'),
    text: msg(
      'The studio opens on the configuration Magma builds with. Import your own from the Config menu of the bar: your edits stay in this browser as a draft until you reset them.',
    ),
    link: draftView
      ? {
          label: msg('Continue on {page}'),
          vars: { page: colorsPage(draftView).label },
          route: { section: 'colors', view: draftView },
          icon: 'mi/baseline/arrow-forward',
        }
      : { label: msg('Open the palette'), route: palette, icon: 'mi/baseline/arrow-forward' },
  },
  {
    title: msg('Change it where the change belongs'),
    text: msg(
      'Each section works at one level, from one colour to the whole product. Make a change at the narrowest level that holds it: the levels after it follow.',
    ),
  },
  {
    title: msg('Keep the contrast gate green'),
    text: msg(
      'The gate of the build of Magma judges every edit. The badge beside each title of Colors, and the count on its menu, say how many pairs fall below their floor.',
    ),
    link: {
      label: colorsPage('contrast').label,
      route: { section: 'colors', view: 'contrast' },
      icon: 'mi/outline/fact-check',
    },
  },
  {
    title: msg('Judge it on a product, then take it'),
    text: msg(
      'The Theme section shows the theme on a page of a product, in both modes and under the preferences of a person. The Config menu of the bar hands over what a product loads: the configuration, the tokens, the Figma tokens.',
    ),
    link: { label: msg('Theme'), route: { section: 'theme' }, icon: 'mi/outline/format-size' },
  },
];

function Steps({ draftView }: { draftView?: ColorsView }) {
  const t = useT();
  return (
    <section class="start-frame start-section" aria-labelledby="start-steps">
      <mds-text typography="section" tag="h2" id="start-steps">
        {t('How the work goes')}
      </mds-text>
      {/* an li, not an mds-list-item: a list item of Magma holds text only, a step holds a
          title, a paragraph and a link */}
      <ol class="start-steps" role="list">
        {stepsOf(draftView).map((step) => (
          <li class="start-step">
            <mds-text typography="part" tag="h3">
              {t(step.title)}
            </mds-text>
            <mds-text typography="detail" tag="p" class="studio-muted">
              {t(step.text)}
            </mds-text>
            {step.link && (
              <mds-button
                href={hrefOf(step.link.route)}
                variant="dark"
                tone="text"
                icon={step.link.icon}
                icon-position={step.link.icon.endsWith('arrow-forward') ? 'right' : undefined}
                class="start-step-link"
                label={t(step.link.label, {
                  ...Object.fromEntries(
                    Object.entries(step.link.vars ?? {}).map(([name, value]) => [name, t(value)]),
                  ),
                })}
              ></mds-button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

interface Level {
  name: string;
  /** The section of the bar the level lives in. */
  section: string;
  icon: string;
  /** What a change at this level acts on. */
  unit: string;
  changes: string;
  reaches: string;
  pages: Array<{ label: string; route: Route; icon: string }>;
}

const colorsLinks = (...views: ColorsView[]) =>
  views.map((view) => {
    const page = colorsPage(view);
    return { label: page.label, route: { section: 'colors', view } as Route, icon: page.icon };
  });

const linkOf = <Id extends string>(item: MenuItem<Id>, route: Route) => ({
  label: item.label,
  route,
  icon: item.icon,
});

/**
 * The levels of the studio, from the finest to the broadest: each is built on the one before
 * (the generator solves the roles from the ramps, a theme repoints the roles, a product paints
 * with the theme), so a change reaches every level after it. What each page sets is what its
 * summary says (VIEW_SUMMARY of app.tsx, the panels of shell.tsx).
 */
export const LEVELS: Level[] = [
  {
    name: msg('Colour'),
    section: msg('Colors'),
    icon: 'mi/baseline/palette',
    unit: msg('One family of colour, or a group of them'),
    changes: msg(
      'The base colour of a family, the contrast ratios its ramp of steps is solved at in light and dark, the formula and the export of its group.',
    ),
    reaches: msg('Every step of the family, and every role and theme that paints with it.'),
    pages: colorsLinks('colors', 'scales', 'groups'),
  },
  {
    name: msg('Role'),
    section: msg('Colors'),
    icon: 'mi/baseline/account-tree',
    unit: msg('The roles every theme shares'),
    changes: msg(
      'The families that generate surfaces, the lightness of the surfaces and the borders, the contrast target of each role of the text.',
    ),
    reaches: msg(
      'Every surface, border and text of every theme: the studio picks the step of each ramp that meets each target.',
    ),
    pages: colorsLinks('surface'),
  },
  {
    name: msg('Theme'),
    section: msg('Colors'),
    icon: 'mi/baseline/theater-comedy',
    unit: msg('One theme'),
    changes: msg(
      'The family a theme is drawn from, its name, the accents it repoints and the colour modes it is used in.',
    ),
    reaches: msg('The pages of a product that switch the theme in, with data-theme-name.'),
    pages: colorsLinks('themes'),
  },
  {
    name: msg('Product'),
    section: msg('Theme'),
    icon: 'mi/baseline/web',
    unit: msg('The theme on a page of a product'),
    changes: msg(
      'What the theme is judged under: the mode, more contrast, the preferences of a person, the width of the page. Typography, shape, density and depth come next.',
    ),
    reaches: msg('Nothing is saved from here yet: it is where a theme is judged as a whole.'),
    pages: [{ label: msg('Theme'), route: { section: 'theme' }, icon: 'mi/baseline/format-size' }],
  },
  {
    name: msg('Composition'),
    section: msg('Behavior'),
    icon: 'mi/baseline/style',
    unit: msg('Every page of every product'),
    changes: msg(
      'Nothing: these pages read what Magma decided, the design language, the patterns and the blocks, and the layer of the product.',
    ),
    reaches: msg('How the pages of a product are put together, whatever the theme.'),
    pages: BEHAVIOR_PAGES.map((page) => linkOf(page, { section: 'behavior', page: page.id })),
  },
];

function Levels() {
  const t = useT();
  return (
    <section class="start-frame start-section" aria-labelledby="start-levels">
      <header class="start-section-head">
        <mds-text typography="section" tag="h2" id="start-levels">
          {t('Where each change is made')}
        </mds-text>
        <mds-text typography="detail" tag="p" class="studio-muted">
          {t(
            'From one colour to the whole product. Each level is built on the one before, so a change reaches every level after it.',
          )}
        </mds-text>
      </header>
      {/* an li, not an mds-list-item: a list item of Magma holds text only, a level holds a
          title, its values and its links */}
      <ol class="start-levels" role="list">
        {LEVELS.map((level, index) => (
          <li class="start-level">
            <div class="start-level-name">
              <span class="start-level-icon">
                <mds-icon name={level.icon}></mds-icon>
              </span>
              <div class="start-level-title">
                <mds-text typography="caption" tag="p" class="studio-muted">
                  {`${index + 1} \u00b7 ${t(level.section)}`}
                </mds-text>
                <mds-text typography="part" tag="h3">
                  {t(level.name)}
                </mds-text>
              </div>
            </div>
            <dl class="start-level-values">
              <div>
                <mds-text typography="label" tag="dt" class="studio-muted">
                  {t('You act on')}
                </mds-text>
                <dd>
                  <mds-text typography="detail" tag="p">
                    <b>{t(level.unit)}</b>
                  </mds-text>
                  <mds-text typography="detail" tag="p">
                    {t(level.changes)}
                  </mds-text>
                </dd>
              </div>
              <div>
                <mds-text typography="label" tag="dt" class="studio-muted">
                  {t('It reaches')}
                </mds-text>
                <dd>
                  <mds-text typography="detail" tag="p">
                    {t(level.reaches)}
                  </mds-text>
                </dd>
              </div>
            </dl>
            <nav
              class="start-level-pages"
              aria-label={t('The pages of {level}', { level: t(level.name) })}
            >
              {level.pages.map((page) => (
                <mds-button
                  href={hrefOf(page.route)}
                  variant="dark"
                  tone="text"
                  icon={page.icon.replace('/baseline/', '/outline/')}
                  class="studio-menu-link"
                  label={t(page.label)}
                ></mds-button>
              ))}
            </nav>
          </li>
        ))}
      </ol>
      <mds-text typography="detail" tag="p" class="studio-muted start-checks">
        {rich(
          t,
          'At every level, {check} lists every pair the gate judges, and {diffs} compares the palette with the one Magma builds with.',
          {
            check: (
              <mds-link href={hrefOf({ section: 'colors', view: 'contrast' })}>
                {t(colorsPage('contrast').label)}
              </mds-link>
            ),
            diffs: (
              <mds-link href={hrefOf({ section: 'colors', view: 'diff' })}>
                {t(colorsPage('diff').label)}
              </mds-link>
            ),
          },
        )}
      </mds-text>
    </section>
  );
}

/**
 * The Start page. `draftView` is the page of Colors the draft of the person was on, which the
 * first step offers to continue on.
 */
export function StartPage({ draftView }: { draftView?: ColorsView }) {
  return (
    <main class="studio-section studio-page start">
      <Hero />
      <Steps draftView={draftView} />
      <Levels />
    </main>
  );
}
