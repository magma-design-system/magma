import type { Ref } from 'preact';
import type { Change, Said } from '../engine/changes.js';
import { plural, useT, type T } from '../shared/i18n/i18n.js';
import { hrefOf, STAGES } from '../shared/routes/routes.js';
import { say, useStudio } from '../state/studio.js';

/*
  The changes in the bar (#1402, the bar replaces the page Diffs): how many values of the preset
  changed since the last exit, always in view (object model, section 4, Preset: "always visible:
  the changes made, how many, in which stage"), and, behind the button, the list by stage, each
  stage a link that opens it, each change with its value before and after. Chosen on its render
  (vittorio, 2026-11-27, option A: the changes in view, the exit beside them). The changes are the
  state's (state/studio.ts, `changes`, engine/changes.ts).
*/

/** The button the panel opens from. */
export const CHANGES_ID = 'studio-changes';
const TITLE_ID = 'studio-changes-title';
/** How many changes of a stage the panel lists before saying how many more. */
const SHOWN = 8;

/** How many changes, in words: none, one, many. */
const countOf = (t: T, count: number): string =>
  count ? plural(t, count, '{count} change', '{count} changes') : t('No changes');

const valueOf = (t: T, said?: Said): string | undefined =>
  said && (said.word ? t(said.text) : said.text);

/** What a change did, after the name of what changed: `Base colour: from #c62828 to #d32f2f`. */
export function changeLine(t: T, change: Change): string {
  if (change.kind === 'added') return t('new in the preset');
  if (change.kind === 'removed') return t('gone from the preset');
  const field = change.field && (change.field.plain ? change.field.text : t(change.field.text));
  const vars = {
    field: field ?? '',
    before: valueOf(t, change.before) ?? '',
    after: valueOf(t, change.after) ?? '',
  };
  if (change.before && change.after)
    return t(field ? '{field}: from {before} to {after}' : 'from {before} to {after}', vars);
  if (change.after) return t(field ? '{field}: now {after}' : 'now {after}', vars);
  if (change.before) return t(field ? '{field}: was {before}' : 'was {before}', vars);
  return t(field ? '{field}: a new value' : 'a new value', vars);
}

/** The button of the bar: how many changes since the last exit. */
export function ChangesButton() {
  const t = useT();
  const count = useStudio().changes.value.length;
  return (
    <mds-button
      slot="nav"
      id={CHANGES_ID}
      variant="dark"
      tone="outline"
      icon="mi/baseline/difference"
      label={countOf(t, count)}
    ></mds-button>
  );
}

/** The panel of the button: the changes by stage, in the order of the stages. */
export function ChangesPanel({ panel }: { panel?: Ref<HTMLMdsDropdownElement> }) {
  const t = useT();
  const changes = useStudio().changes.value;
  const stages = STAGES.map((stage, index) => ({
    stage,
    index,
    list: changes.filter((change) => change.stage === stage.id),
  })).filter(({ list }) => list.length > 0);
  return (
    <mds-dropdown
      ref={panel}
      target={`#${CHANGES_ID}`}
      placement="bottom-end"
      strategy="fixed"
      role="group"
      aria-labelledby={TITLE_ID}
    >
      <div class="grid max-w-text gap-inline p-inset">
        <mds-text id={TITLE_ID} typography="detail" tag="p" class="text-fg-muted">
          {changes.length
            ? plural(
                t,
                changes.length,
                '{count} change since the last exit',
                '{count} changes since the last exit',
              )
            : t('No changes since the last exit.')}
        </mds-text>
        {stages.map(({ stage, index, list }, at) => (
          <>
            {at > 0 && <mds-separator></mds-separator>}
            <div class="grid gap-inline">
              <mds-button
                href={hrefOf(stage.route)}
                variant="dark"
                tone="text"
                size="sm"
                icon={stage.icon}
                class="justify-start"
                label={`${stage.numbered ? `${index + 1}. ` : ''}${t(stage.label)}: ${countOf(t, list.length)}`}
              ></mds-button>
              {list.slice(0, SHOWN).map((change) => (
                <mds-text typography="detail" tag="p" class="ps-inset">
                  <b>{say(t, change.subject)}</b>: {changeLine(t, change)}
                </mds-text>
              ))}
              {list.length > SHOWN && (
                <mds-text typography="caption" tag="p" class="ps-inset text-fg-muted">
                  {t('and {count} more', { count: list.length - SHOWN })}
                </mds-text>
              )}
            </div>
          </>
        ))}
      </div>
    </mds-dropdown>
  );
}
