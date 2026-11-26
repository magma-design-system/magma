import { msg, useT } from '../../shared/i18n/i18n.js';
import { BEHAVIOR_PAGES, type BehaviorPage } from '../../shared/routes/routes.js';
import { IT_RULES } from './i18n-it.js';

/*
  The pages of Behavior, the rules (#1401, out of shell.tsx): the design language, the patterns
  and the blocks of Magma, read only. Today each says what it will hold and that it comes after the
  Theme section; where the rules go in the flow of the studio is open (studio.object-model.md,
  section 10, question 4). Written in the classes of Magma (src/tailwind.css): the page needs no
  sheet of its own.
*/

/** The translator of the pages: their own Italian (i18n-it.ts), then the studio's. */
const useRulesT = () => useT(IT_RULES);

/** What each page of Behavior will hold, and where it comes from. */
const SUMMARY: Record<BehaviorPage, string> = {
  'design-language': msg(
    'The rules of composition every page of a product follows: rhythm, density, actions, titles, surfaces and widths.',
  ),
  patterns: msg(
    'How a task across components is solved in every product, with the narrower values a product keeps in its magma/patterns folder.',
  ),
  blocks: msg(
    'The sections of a page that come back in two patterns or more: the application shell, the page header, the lists.',
  ),
};

/** A page of Behavior: its name, what it will hold, and when it comes. */
export function RulesPage({ page }: { page: BehaviorPage }) {
  const item = BEHAVIOR_PAGES.find((one) => one.id === page)!;
  const t = useRulesT();
  return (
    <main class="relative grid min-h-0 flex-1 content-start gap-between-sections overflow-y-auto pb-between-sections">
      <header class="flex flex-wrap items-start justify-between gap-inline px-(--magma-width-page-gutter) py-inset">
        <div class="grid min-w-0 grow basis-9000 gap-title-content">
          <mds-text typography="page" tag="h1">
            {t(item.label)}
          </mds-text>
          <mds-text typography="detail" tag="p" class="text-fg-muted">
            {t(SUMMARY[page])}
          </mds-text>
        </div>
      </header>
      <mds-banner
        variant="info"
        headline={t('Read-only, after the theme')}
        class="mx-(--magma-width-page-gutter) max-w-text"
      >
        {t(
          'This page shows what Magma decided and the layer of the product, in the theme of the product. It comes after the Theme section (#693, "The plan").',
        )}
      </mds-banner>
    </main>
  );
}
