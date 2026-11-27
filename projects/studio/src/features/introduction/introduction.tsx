import { useEffect, useRef, useState } from 'preact/hooks';
import './introduction.css';
import { applyFrame } from '../../shared/frames/frame.js';
import { DEMO_STEPS, demoStep, type DemoReading, type DemoStep } from './demo.js';
import { msg, useT } from '../../shared/i18n/i18n.js';
import { verdictLabel } from '../../shared/ui/verdict.js';
import { hrefOf, STAGES, type Route, type StageId } from '../../shared/routes/routes.js';
import { IT_INTRODUCTION } from './i18n-it.js';

/*
  The introduction (#693; the Start page until #1402, studio.object-model.md, section 5): no
  entity at its centre, it says what the studio is for, with no control of the work. A hero shows
  it and leads to the opening, its way out ("Get started"); then the stages in order, from the
  opening to the full review, each with what it does and the link that opens it (vittorio,
  2026-11-27, on the renders: the list, an action on each row, primary weak).

  The hero says what the studio is and what it offers, beside a short play run by the engine of
  the studio (demo.ts) on a banner of a product, painted with the configuration of Magma
  drawn pale: its text pinned to pale steps and the ramp of its accent faded. Three trays come out from
  behind the banner, one at a time (vittorio, 2026-11-09):
  - the problem, over the banner: what is wrong with it;
  - the fix, under it: what the gate says of the banner, its texts, its icons and its actions
    against their floors, and a bar of the pairs brought back over theirs, while the targets and
    the ramp come back step by step, solved again and judged again at each one, as an edit on the
    pages of Colors would be;
  - fixed, under it: a smaller tray says so, with Replay.
  The trays move with the elastic easing of Magma (--ease-out-back, introduction.css); the banner stays
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
 * and --duration-500 of movement in introduction.css.
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

/** The translator of the page: its own Italian (i18n-it.ts), then the studio's. */
const useIntroT = () => useT(IT_INTRODUCTION);

/** Whether the person asked for less motion: then the play does not run by itself. */
const lessMotion = (): boolean =>
  typeof matchMedia !== 'function' || matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * What the studio offers, in the hero. Each line is true of the studio as it is, and its source is
 * the comment above it: a line the studio stops holding goes with it.
 */
export const FEATURES: string[] = [
  // the stage Themes: the colour modes each theme is used in (theme-choices.ts, `modes`)
  msg('Themes in light and dark, or in one mode of your choice'),
  // the contrast gate of the build of Magma, run on the configuration at every edit (gate.ts)
  msg('Contrast checked by itself at every edit'),
  // Palette and Contrast scales: the base colour of a family, the contrast of each step of its ramp
  msg('Colour ramps you shape step by step'),
  // the downloads (the menu of the exit, app/config-menu.tsx): the Figma tokens (DTCG), the configuration and the tokens Magma
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
  const t = useIntroT();
  return (
    <div class="intro-reading">
      <mds-text typography="label" tag="dt" class="text-fg-muted">
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
  const replayButton = useRef<HTMLMdsButtonElement>(null);
  const replayed = useRef(false);
  const [loaded, setLoaded] = useState(0);
  const [painted, setPainted] = useState(false);
  const [height, setHeight] = useState<number | undefined>();
  const play = usePlay(painted);
  const { phase, shown } = play;
  const t = useIntroT();

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
  // until it does, the height of introduction.css stands
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
    <section class="intro-hero" aria-labelledby="intro-title">
      <div class="intro-frame intro-hero-grid">
        {/* the title and what the studio is, then what it offers, a group apart */}
        <header class="intro-hero-head">
          <div class="intro-hero-intro">
            <mds-text typography="page" tag="h1" id="intro-title">
              {t('The theme of your product, readable by everyone')}
            </mds-text>
            <mds-text typography="detail" tag="p">
              {t(
                'Magma Studio is where a product shapes its theme on Magma. You state how much contrast the text needs, and the studio picks the colours that meet it, in every theme and both modes.',
              )}
            </mds-text>
            <div>
              {/* the way out of the introduction: the opening (object model, section 5) */}
              <mds-button
                href={hrefOf({ section: 'opening' })}
                variant="light"
                icon="mi/baseline/arrow-forward"
                icon-position="right"
                label={t('Get started')}
              ></mds-button>
            </div>
          </div>
          <mds-list class="intro-features">
            {FEATURES.map((feature) => (
              <mds-list-item icon="mi/baseline/check-circle">{t(feature)}</mds-list-item>
            ))}
          </mds-list>
        </header>
        <figure class="intro-stage" ref={stage} tabIndex={-1} data-phase={phase}>
          <div class="intro-tray intro-tray-over intro-note" {...tray(phase === 'problem')}>
            <mds-icon
              name="mi/baseline/warning"
              class="intro-note-icon intro-note-problem"
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
            class="intro-stage-frame"
            src="hero.html"
            title={t('A banner of a product, painted with the configuration of the animation')}
            style={height ? { blockSize: `${height}px` } : undefined}
            onLoad={() => setLoaded((count) => count + 1)}
          />
          {/* what the gate says of the banner at each step of the fix: figures for the eye,
              hidden from assistive technologies, which the caption tells what the play shows */}
          <div class="intro-tray intro-tray-under" {...tray(phase === 'fixing')}>
            <dl class="intro-readings" aria-hidden="true">
              {shown?.readings.map((reading) => (
                <Reading reading={reading} />
              ))}
            </dl>
            <div class="intro-meter" aria-hidden="true">
              <mds-text typography="caption" tag="p">
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
          <div class="intro-tray intro-tray-under intro-note" {...tray(phase === 'fixed')}>
            <mds-icon
              name="mi/baseline/check-circle"
              class="intro-note-icon intro-note-fixed"
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
          <figcaption class="sr-only">
            {t(
              'A banner painted with the configuration Magma builds with, drawn pale: its text pinned to pale steps of its ramp, under the floors of the contrast gate, and the ramp of its accent faded, so its text, its icon and its main action read poorly. Then the studio brings both back step by step, solving the colours again at each one, until every pair the gate judges meets its floor.',
            )}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/** The views of the flow the introduction lists: the opening, then the stages. */
type ViewId = 'opening' | StageId;

/** What each view does, in a sentence: its aim in the object model (section 5). */
const DOES: Record<ViewId, string> = {
  opening: msg("Open the preset to work on: Magma's, a ready theme, a brand colour or your draft."),
  colours: msg('Shape a colour and see what it paints, with its scales and its groups.'),
  weights: msg('Balance surfaces, borders, text and transparent roles, one mode at a time.'),
  themes: msg('Choose the tint, the accents and the modes of each theme, judged on the scene.'),
  exceptions: msg(
    'Decide how a function shared by several components paints, in every state and on every ground.',
  ),
  'full-review': msg('Judge every theme in every mode, then save or download the preset.'),
};

/** A view of the flow as the list shows it. */
export interface FlowView {
  id: ViewId;
  /** The name of the view, in English (msg). */
  label: string;
  icon: string;
  /** The caption over its name: its number, or where it stands beside the stages. */
  caption: { text: string; vars?: Record<string, number> };
  route: Route;
}

/** The views of the flow, in order: the opening, then the stages of the table of the pages. */
export const FLOW: FlowView[] = [
  {
    id: 'opening',
    label: msg('Opening'),
    icon: 'mi/baseline/login',
    caption: { text: msg('Before the stages') },
    route: { section: 'opening' },
  },
  ...STAGES.map((stage, index) => ({
    id: stage.id,
    label: stage.label,
    icon: stage.icon,
    caption: stage.numbered
      ? { text: msg('Stage {number}'), vars: { number: index + 1 } }
      : { text: msg('After the stages') },
    route: stage.route,
  })),
];

/**
 * The stages in order, one row each: its icon, its caption and name, what it does, and the link
 * that opens it, in the primary weak tone so it reads as an action without competing with Get
 * started (vittorio, 2026-11-27). Written in the classes of Magma.
 */
function Stages() {
  const t = useIntroT();
  return (
    <section class="intro-frame grid gap-between-containers" aria-labelledby="intro-stages">
      <header class="grid gap-title-content">
        <mds-text typography="section" tag="h2" id="intro-stages">
          {t('How the work goes')}
        </mds-text>
        <mds-text typography="detail" tag="p" class="max-w-text text-fg-muted">
          {t(
            'One stage at a time, in order: each stage works on the one before, and the bar of the stages says where you are.',
          )}
        </mds-text>
      </header>
      {/* an li, not an mds-list-item: a list item of Magma holds text only, a row holds a title,
          a sentence and a link */}
      <ol
        class="m-0 grid list-none grid-cols-[auto_auto_minmax(0,1fr)_auto] gap-x-between-containers gap-y-inline p-0"
        role="list"
      >
        {FLOW.map((view) => (
          <li class="col-span-full grid grid-cols-subgrid items-baseline border-t border-border-muted pt-inline">
            <mds-icon name={view.icon} class="text-fg-muted" aria-hidden="true"></mds-icon>
            <div class="grid">
              <mds-text typography="caption" tag="p" class="text-fg-muted">
                {t(view.caption.text, view.caption.vars)}
              </mds-text>
              <mds-text typography="part" tag="h3">
                {t(view.label)}
              </mds-text>
            </div>
            <mds-text typography="detail" tag="p" class="max-w-text">
              {t(DOES[view.id])}
            </mds-text>
            <mds-button
              href={hrefOf(view.route)}
              variant="primary"
              tone="weak"
              size="sm"
              icon="mi/baseline/arrow-forward"
              icon-position="right"
              label={t('Open {view}', { view: t(view.label) })}
            ></mds-button>
          </li>
        ))}
      </ol>
      <mds-text typography="detail" tag="p" class="max-w-text text-fg-muted">
        {t(
          'Outside the stages, from the bar: the Theme section, where you judge the theme on a page of a product, and the rules of Magma, read only.',
        )}
      </mds-text>
    </section>
  );
}

/** The introduction: the hero, then the stages in order. */
export function IntroductionPage() {
  return (
    <main class="studio-section relative grid min-h-0 flex-1 content-start gap-between-sections overflow-y-auto pb-between-sections">
      <Hero />
      <Stages />
    </main>
  );
}
