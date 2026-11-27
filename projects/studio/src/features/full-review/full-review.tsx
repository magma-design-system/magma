import type { ComponentChild } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import type { Mode } from '@maggioli-design-system/design-tokens/src/lib/contrast-gate.js';
import type { GatePair } from '../../engine/gate.js';
import {
  reviewItems,
  reviewSummary,
  type LookState,
  type ReviewItem,
} from '../../engine/review.js';
import { Check } from '../../shared/magma/magma.js';
import { msg, plural, rich, type T } from '../../shared/i18n/i18n.js';
import { hrefOf, reviewRoute, stageOf, themeRoute } from '../../shared/routes/routes.js';
import { ThemeScene } from '../../shared/ui/theme-scene.js';
import { GateBadge } from '../../shared/ui/verdict.js';
import { markLooked, unmarkLooked } from '../../state/review.js';
import { useStudio } from '../../state/studio.js';
import { MODE_NAMES, PairsTable, useFullReviewT } from './pairs.js';

/*
  The full review (#1404; the Contrast check page until then): every theme judged in every mode
  before the exit (studio.object-model.md, section 5, "Giro completo"). Around the verification at
  its centre: each theme per mode in a list beside, marked as looked at until a change touches it
  (engine/review.ts), the ones that block said; the item at the centre with its scene beside, in
  its mode, and its pairs, those that block, the reported ones and the debt the baseline accepts;
  the exit at its foot, the way forward of the last stage, which asks first while the verification
  is red (gate-dialog.tsx, confirm-action `ask-first-many`). Each stage shows the verification
  filtered on itself, the full review the whole of it. Built as Magma says today: record-detail
  with the list beside, as Colours and Themes, until the review checklist (#1490) lands; its
  renders are the proposal of that pattern.
*/

/** The title of the item at the centre. */
const ITEM_TITLE = 'full-review-item-title';

/** The icon of how an item stands for the person: a shape for each, never the colour alone. */
const LOOK_ICON: Record<LookState, string> = {
  open: 'mi/baseline/radio-button-unchecked',
  looked: 'mi/baseline/check-circle',
  changed: 'mi/baseline/history',
};

/** How an item stands for the person, in words. */
const LOOK_WORD: Record<LookState, string> = {
  open: msg('not looked at'),
  looked: msg('looked at'),
  changed: msg('changed after you looked'),
};

type PairGroup = 'blocking' | 'reported' | 'debt';

/** The groups of the pairs of an item, in the order of the model: what blocks, what is reported, the debt. */
const PAIR_GROUPS: ReadonlyArray<{ id: PairGroup; title: string; none: string; about: string }> = [
  {
    id: 'blocking',
    title: msg('Blocking'),
    none: msg('No pair blocks.'),
    about: msg('Under their floor: the build of Magma refuses the preset while one is here.'),
  },
  {
    id: 'reported',
    title: msg('Reported'),
    none: msg('No pair is reported.'),
    about: msg('Under their target, reported by the check: they do not block.'),
  },
  {
    id: 'debt',
    title: msg('Debt'),
    none: msg('No debt.'),
    about: msg(
      'Under their floor, accepted by the baseline of design-tokens: the debt in view, with how much is missing.',
    ),
  },
];

export function FullReviewPage({
  theme: asked,
  mode: askedMode,
  foot,
  onItem,
}: {
  /** The theme of the item the address names, by its name. */
  theme?: string;
  mode?: Mode;
  foot?: ComponentChild;
  /** The item at the centre, written in the address in place: a mark keeps it there. */
  onItem: (theme: string, mode: Mode) => void;
}) {
  const t = useFullReviewT();
  const studio = useStudio();
  const report = studio.report.value;
  const looks = studio.looks.value;
  const scene = studio.scene.value;
  const [listOpen, setListOpen] = useState(false);
  const items = useMemo(() => reviewItems(report, looks), [report, looks]);
  const summary = reviewSummary(items);
  // the item the address names, else the first one left to look at, else the first
  const current =
    items.find((item) => item.theme === asked && item.mode === askedMode) ??
    items.find((item) => item.look !== 'looked') ??
    items[0];

  if (report.verdict.state === 'error')
    return (
      <main class="min-h-0 overflow-y-auto px-(--magma-width-page-gutter) py-between-sections">
        <mds-banner class="max-w-text" variant="warning" headline={t('Contrast not measured')}>
          {report.verdict.message}
        </mds-banner>
        {foot && <div class="mt-between-sections">{foot}</div>}
      </main>
    );

  return (
    <div class="@container/review h-full">
      <div class="grid h-full grid-cols-[calc(var(--spacing)*6000)_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] @max-list-beside/review:grid-cols-1">
        {/* where the list stands above the page, folded into the item at the centre (#1311); the
          list and its bar in the gutter of the page, as in Colours (#1596) */}
        <div class="hidden px-(--magma-width-page-gutter) pt-inset @max-list-beside/review:block">
          <mds-button
            type="button"
            icon={listOpen ? 'mi/baseline/expand-less' : 'mi/baseline/expand-more'}
            icon-position="right"
            variant="dark"
            tone="weak"
            class="w-full justify-between [--mds-button-label-transform:none]"
            label={current ? `${current.theme}, ${t(MODE_NAMES[current.mode])}` : ''}
            aria-expanded={listOpen ? 'true' : 'false'}
            aria-controls="full-review-list"
            onClick={() => setListOpen(!listOpen)}
          ></mds-button>
        </div>
        <ReviewList
          t={t}
          items={items}
          current={current}
          open={listOpen}
          onOpen={() => setListOpen(false)}
        />
        <main
          class={
            listOpen
              ? 'relative col-start-2 row-span-2 row-start-1 min-h-0 overflow-y-auto px-(--magma-width-page-gutter) pt-inset pb-between-sections @max-list-beside/review:hidden'
              : 'relative col-start-2 row-span-2 row-start-1 min-h-0 overflow-y-auto px-(--magma-width-page-gutter) pt-inset pb-between-sections @max-list-beside/review:col-start-1 @max-list-beside/review:row-span-1 @max-list-beside/review:row-start-2'
          }
        >
          {/* the head of the view: its title with the verdict of the contrast check beside it, and
            how the review stands */}
          <header class="mb-between-sections grid gap-title-content">
            <div class="flex flex-wrap items-center gap-inline">
              <mds-text typography="page" tag="h1">
                {t(stageOf('full-review').label)}
              </mds-text>
              <GateBadge verdict={report.verdict} />
            </div>
            <mds-text typography="detail" tag="p" class="max-w-text text-fg-muted">
              {t('Judge every theme in every mode before the exit.')}
            </mds-text>
            <mds-text typography="detail" tag="p" role="status" data-summary>
              {[
                t('{looked} of {items} looked at', summary),
                ...(summary.changed
                  ? [
                      plural(
                        t,
                        summary.changed,
                        '{count} changed after you looked',
                        '{count} changed after you looked',
                      ),
                    ]
                  : []),
                summary.blocking
                  ? plural(t, summary.blocking, '{count} blocks the exit', '{count} block the exit')
                  : t('none blocks the exit'),
              ].join(', ')}
            </mds-text>
          </header>

          {current && (
            <ItemDetail
              t={t}
              item={current}
              next={items.find((item) => item.look !== 'looked' && item.key !== current.key)}
              css={scene?.css}
              onMark={() => onItem(current.theme, current.mode)}
            />
          )}
          {foot && <div class="mt-between-sections">{foot}</div>}
        </main>
      </div>
    </div>
  );
}

/** Every theme per mode, in the order of the themes, each with how it stands. */
function ReviewList({
  t,
  items,
  current,
  open,
  onOpen,
}: {
  t: T;
  items: ReviewItem[];
  current: ReviewItem | undefined;
  open: boolean;
  onOpen: () => void;
}) {
  const themes = [...new Set(items.map((item) => item.theme))];
  return (
    <aside
      id="full-review-list"
      class={
        open
          ? 'col-start-1 row-span-2 row-start-1 grid min-h-0 content-start gap-between-fields overflow-y-auto border-e border-border-muted px-(--magma-width-page-gutter) py-inset @max-list-beside/review:row-span-1 @max-list-beside/review:row-start-2 @max-list-beside/review:border-e-0'
          : 'col-start-1 row-span-2 row-start-1 grid min-h-0 content-start gap-between-fields overflow-y-auto border-e border-border-muted px-(--magma-width-page-gutter) py-inset @max-list-beside/review:hidden'
      }
      aria-label={t('The themes to look at, mode by mode')}
    >
      {themes.map((theme) => (
        <div class="grid gap-inline">
          <mds-text typography="part" tag="h2">
            {theme}
          </mds-text>
          <ul class="m-0 grid list-none p-0 [--mds-button-label-transform:none]">
            {items
              .filter((item) => item.theme === theme)
              .map((item) => {
                const here = item.key === current?.key;
                const blocks = item.blocking.length;
                return (
                  <li class="relative">
                    {/* until Magma has a review checklist (#1490): a link of Magma per item, the
                      one at the centre marked by aria-current and the weak tone; how it stands in
                      its icon and in its name, never in the colour alone */}
                    <mds-button
                      href={hrefOf(reviewRoute(item.theme, item.mode))}
                      icon={LOOK_ICON[item.look]}
                      variant="dark"
                      tone={here ? 'weak' : 'text'}
                      aria-current={here ? 'page' : undefined}
                      class="w-full justify-start"
                      label={t(item.mode === 'light' ? 'Light' : 'Dark')}
                      aria-label={t('{theme}, {mode}: {look}', {
                        theme: item.theme,
                        mode: t(MODE_NAMES[item.mode]),
                        look: t(LOOK_WORD[item.look]),
                      })}
                      data-look={item.look}
                      onClick={onOpen}
                    ></mds-button>
                    {/* the slot of mds-button takes text only: the badge sits on the end of the
                      row, the button under it takes the click */}
                    <mds-badge
                      variant={blocks ? 'error' : 'success'}
                      tone="weak"
                      label={
                        blocks ? plural(t, blocks, '{count} blocks', '{count} block') : t('OK')
                      }
                      class="pointer-events-none absolute end-inline top-1/2 -translate-y-1/2"
                    ></mds-badge>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </aside>
  );
}

/**
 * The item at the centre: the theme in one mode, how it stands for the person and the action that
 * marks it, its pairs in their groups, its scene beside.
 */
function ItemDetail({
  t,
  item,
  next,
  css,
  onMark,
}: {
  t: T;
  item: ReviewItem;
  /** The next item left to look at, after this one. */
  next: ReviewItem | undefined;
  css: string | undefined;
  /** Before the mark: the item stays at the centre. */
  onMark: () => void;
}) {
  const studio = useStudio();
  const [contrast, setContrast] = useState(false);
  const theme = studio.scene.value?.themes.find((one) => one.name === item.theme);
  const pairsOf: Record<PairGroup, GatePair[]> = {
    blocking: item.blocking,
    reported: item.reported,
    debt: item.debt,
  };
  return (
    <div class="@container/item">
      <div class="grid content-start gap-x-between-groups @side/item:grid-cols-[minmax(0,1fr)_calc(var(--spacing)*10400)] @side/item:items-start">
        <div class="mb-title-content flex flex-wrap items-center gap-inline @side/item:col-start-1">
          <mds-text id={ITEM_TITLE} typography="section" tag="h2">
            {t('{theme}, {mode}', { theme: item.theme, mode: t(MODE_NAMES[item.mode]) })}
          </mds-text>
          {item.look === 'looked' && (
            <mds-badge variant="success" tone="weak" label={t('Looked at')}></mds-badge>
          )}
          {item.look === 'changed' && (
            <mds-badge
              variant="warning"
              tone="weak"
              label={t('Changed after you looked')}
            ></mds-badge>
          )}
        </div>
        <div class="mb-between-groups grid justify-items-start gap-inline @side/item:col-start-1">
          <mds-text typography="detail" tag="p" class="max-w-text text-fg-muted">
            {item.look === 'changed'
              ? t(
                  'A change touched this theme in this mode after you looked at it: look at it again.',
                )
              : rich(
                  t,
                  'Look at the scene beside and at the pairs below, then mark it. The theme is in {themes}.',
                  {
                    themes: (
                      <mds-link href={hrefOf(themeRoute(item.theme))}>
                        {t(stageOf('themes').label)}
                      </mds-link>
                    ),
                  },
                )}
          </mds-text>
          {/* the action of the item, a part of the page: primary outline (actions.md,
            part-primary); a look taken back is a text action */}
          <div class="flex flex-wrap items-center gap-inline">
            {item.look === 'looked' ? (
              <mds-button
                type="button"
                icon="mi/baseline/undo"
                variant="dark"
                tone="text"
                label={t('Take the mark back')}
                onClick={() => unmarkLooked(studio, item.family, item.mode)}
              ></mds-button>
            ) : (
              <mds-button
                type="button"
                icon="mi/baseline/check"
                variant="primary"
                tone="outline"
                label={t('Mark as looked at')}
                onClick={() => {
                  onMark();
                  markLooked(studio, item.family, item.mode);
                }}
              ></mds-button>
            )}
            {/* once this one is looked at, the way to the next one left: the person moves on */}
            {item.look === 'looked' && next && (
              <mds-button
                href={hrefOf(reviewRoute(next.theme, next.mode))}
                icon="mi/baseline/arrow-forward"
                icon-position="right"
                variant="dark"
                tone="text"
                label={t('Next to look at: {theme}, {mode}', {
                  theme: next.theme,
                  mode: t(MODE_NAMES[next.mode]),
                })}
              ></mds-button>
            )}
          </div>
        </div>
        {/* the scene beside, where the view has the room of a column for it (--container-side);
          narrower it is not drawn, as in Weights: a page as tall as a phone would push the work down */}
        <div class="hidden @side/item:sticky @side/item:top-inset @side/item:col-start-2 @side/item:row-span-5 @side/item:row-start-1 @side/item:block">
          <aside class="grid min-w-0 gap-inline" aria-label={t('The scene of the product')}>
            <div class="flex flex-wrap items-center justify-end gap-inline">
              <Check checked={contrast} onChecked={setContrast} type="switch">
                {t('More contrast')}
              </Check>
            </div>
            <ThemeScene
              theme={item.theme}
              modes={theme?.modes ?? [item.mode]}
              css={css}
              scheme={item.mode}
              contrast={contrast}
              title={t('The theme {theme} on a page of a product', { theme: item.theme })}
            />
          </aside>
        </div>
        <section
          class="grid min-w-0 content-start gap-between-groups @side/item:col-start-1"
          aria-labelledby={ITEM_TITLE}
        >
          {PAIR_GROUPS.map((group) => {
            const pairs = pairsOf[group.id];
            return (
              <section class="grid min-w-0 gap-title-content" data-pairs={group.id}>
                <div class="grid gap-label-control">
                  <mds-text typography="group" tag="h3">
                    {`${t(group.title)} (${pairs.length})`}
                  </mds-text>
                  <mds-text typography="caption" tag="p" class="text-fg-muted">
                    {t(group.about)}
                  </mds-text>
                </div>
                {pairs.length ? (
                  <PairsTable pairs={pairs} mode={item.mode} />
                ) : (
                  <mds-text typography="detail" tag="p" class="text-fg-muted">
                    {t(group.none)}
                  </mds-text>
                )}
              </section>
            );
          })}
          <mds-text typography="caption" tag="p" class="text-fg-muted">
            {rich(t, '{count} pairs measured in this mode, with the targets of {command}.', {
              count: String(item.measured),
              command: <code>{'nx run design-tokens:contrast'}</code>,
            })}
          </mds-text>
        </section>
      </div>
    </div>
  );
}
