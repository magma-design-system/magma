import { useT } from '../shared/i18n/i18n.js';
import { exitOf, guard } from '../state/exports.js';
import { useStudio } from '../state/studio.js';
import {
  aroundStage,
  hrefOf,
  placeOf,
  STAGES,
  type Route,
  type StageLink,
} from '../shared/routes/routes.js';

/*
  The stages in order (#1402), as the pattern of the studio has them
  (magma/patterns/stages-in-order.md, chosen on its renders, vittorio, 2026-11-27): the stepper
  under the bar on a stage and on a page beside one, the current stage marked, the ones before it
  done; at the end of a stage the way back and the way forward, named after where they lead, the
  last stage ending with the exit. A page that is no stage nor beside one has neither. The shell
  draws the stepper and hands the foot to the page, which puts it at the end of the region that
  scrolls: a page knows nothing of the flow.
*/

/**
 * The stages under the bar. A done stage is a button of the stepper: activated, it opens the
 * address of its stage, as a link would; a stage after the current one opens only through the way
 * forward (stages-in-order, `ahead-by-forward`).
 */
export function StageBar({ route, onOpen }: { route: Route; onOpen: (route: Route) => void }) {
  const t = useT();
  const place = placeOf(route);
  if (!place) return null;
  return (
    <nav aria-label={t('Stages')} class="flex-none px-(--magma-width-page-gutter) pt-inset">
      <mds-stepper-bar items-done={place.index + 1}>
        {STAGES.map((stage) => (
          <mds-stepper-bar-item
            step={stage.numbered}
            icon={stage.icon}
            icon-checked="mi/baseline/done"
            label={t(stage.label)}
            value={stage.id}
            onmdsStepperBarItemDone={() => onOpen(stage.route)}
          ></mds-stepper-bar-item>
        ))}
      </mds-stepper-bar>
    </nav>
  );
}

/** The name of a view the foot opens: its number and name, `3. Themes`. */
const nameOf = (t: ReturnType<typeof useT>, link: StageLink): string =>
  link.number ? `${link.number}. ${t(link.label)}` : t(link.label);

/**
 * The exit, at the end of the last stage: the action of the bar that saves or downloads the
 * preset, through the contrast gate.
 */
function Exit() {
  const t = useT();
  const studio = useStudio();
  const action = exitOf(studio);
  const saves = studio.served.value !== null && !studio.served.value.readOnly;
  return (
    <mds-button
      icon={saves ? 'mi/baseline/save' : 'mi/baseline/file-download'}
      label={t(action.label)}
      onClick={() => guard(studio, action)}
    ></mds-button>
  );
}

/**
 * The foot of a stage, at the end of its page: the way back first, outlined, the way forward last,
 * the main action; on the last stage the exit in its place. Nothing on a page that is no stage.
 */
export function StageFoot({ route }: { route: Route }) {
  const t = useT();
  const place = placeOf(route);
  if (place?.place !== 'stage') return null;
  const { before, after } = aroundStage(place.index);
  return (
    <nav
      aria-label={t('The stage before and after')}
      class="flex flex-wrap items-center justify-between gap-inline border-t border-border-muted pt-inset"
    >
      <mds-button
        href={hrefOf(before.route)}
        variant="dark"
        tone="outline"
        icon="mi/baseline/arrow-back"
        label={nameOf(t, before)}
      ></mds-button>
      {after ? (
        <mds-button
          href={hrefOf(after.route)}
          icon="mi/baseline/arrow-forward"
          icon-position="right"
          label={nameOf(t, after)}
        ></mds-button>
      ) : (
        <Exit />
      )}
    </nav>
  );
}
