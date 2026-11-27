import { useT } from '../shared/i18n/i18n.js';
import { COLORS_PAGES, hrefOf, placeOf, STAGES, type Route } from '../shared/routes/routes.js';

/*
  The stages in order (#1402; a strip of links since #1595), as the pattern of the studio has them
  (magma/patterns/stages-in-order.md): on a stage and on a page beside one, the strip of the
  stages under the bar, aligned with the title of the page and right above it, one link per stage,
  the address holding the stage, the current one selected. A page that is no stage nor beside one
  has none.

  Why a strip of tabs and not a stepper (#1595, vittorio, 2026-11-27): a stepper is a wizard, a
  task done once in a fixed order; the studio is a tool the person comes back to, moving back and
  forth between its stages, as between the parts of a record (record-detail, the research of epic
  #1579). No status per stage (render A of #1595, not B: a task list, which Magma lacks) and no
  foot with the stage before and after: the strip opens every stage, and the exit is the bar's.
  Each item is the icon and the name of its stage, no number (vittorio, 2026-11-27): the order is
  the place in the strip; the icon is the one of STAGES, as the introduction and the changes of
  the bar show it.
*/

/**
 * The strip of the stages, under the bar: an `mds-tab` whose items are all links (`href`), so the
 * strip is a navigation and not a tablist; its name is the `nav` around it. The stage of the page,
 * or the stage a page beside one belongs to, is the selected item, announced as the current one.
 * Every stage is one click away, the ones after the current one too. On a narrow window the strip
 * keeps one row and scrolls, the selected stage in view, a shadow at the edge where more stages
 * are (`overflow`); a select in its place waits for mds-tab (#1593, narrow="select").
 */
export function StageTabs({ route }: { route: Route }) {
  const t = useT();
  const place = placeOf(route);
  if (!place) return null;
  return (
    <nav aria-label={t('Stages')} class="flex-none px-(--magma-width-page-gutter) pt-inset">
      <mds-tab overflow>
        {STAGES.map((stage, index) => (
          <mds-tab-item
            href={hrefOf(stage.route)}
            icon={stage.icon}
            label={t(stage.label)}
            value={stage.id}
            selected={index === place.index}
          ></mds-tab-item>
        ))}
      </mds-tab>
    </nav>
  );
}

/** The page of today a route of Colors opens: its name and icon in the table of the pages. */
const pageOf = (route: Route) =>
  route.section === 'colors' ? COLORS_PAGES.find((page) => page.id === route.view) : undefined;

/**
 * The head of a stage and of a page beside it, above its title, while the pages of today stand in
 * for the views of the object model (until #1403): on a page beside a stage, the way back to its
 * stage, named after it (stages-in-order, `side-page`); on a stage with pages beside it, the links
 * to them, which the menu of Colors held before the stages. The object model reaches Scale from the
 * scale of a family and Group from the group in the list: #1403 puts the links there.
 */
export function StageLead({ route }: { route: Route }) {
  const t = useT();
  const place = placeOf(route);
  if (!place) return null;
  if (place.place === 'side-page')
    return (
      <div class="mb-title-content">
        <mds-button
          href={hrefOf(place.stage.route)}
          icon="mi/baseline/arrow-back"
          variant="dark"
          tone="text"
          size="sm"
          label={t(place.stage.label)}
        ></mds-button>
      </div>
    );
  const beside = place.stage.beside.flatMap((page) => {
    const row = pageOf(page);
    return row ? [{ route: page, row }] : [];
  });
  if (!beside.length) return null;
  return (
    <nav
      aria-label={t('Beside {stage}', { stage: t(place.stage.label) })}
      class="mb-title-content flex flex-wrap gap-inline"
    >
      {beside.map(({ route: page, row }) => (
        <mds-button
          href={hrefOf(page)}
          icon={row.icon.replace('/baseline/', '/outline/')}
          variant="dark"
          tone="text"
          size="sm"
          label={t(row.label)}
        ></mds-button>
      ))}
    </nav>
  );
}
