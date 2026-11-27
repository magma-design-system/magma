import type { ComponentChild } from 'preact';
import { msg, useT } from '../../shared/i18n/i18n.js';
import { IT_EXCEPTIONS } from './i18n-it.js';

/*
  The stage of the exceptions (#1402): stage 4 of the balancing (studio.object-model.md, section
  5), with no view yet, so the order of the stages holds a page that says what it will hold and
  when it comes. It comes after Magma 3 (vittorio, 2026-11-27, #1404): its functions (the band, the
  track, the frame of the fields) are roles of Magma 3 (`transparent`, `fieldRoles` of
  semantic.config.ts on the branch 1292-magma-3), and its candidates need an engine that generates
  and measures them; the model puts the exceptions after the first release too (section 1).
  Written in the classes of Magma (src/tailwind.css): the page needs no sheet of its own. The foot
  of the stage (app/stages.tsx) is handed in by the shell, at the end of the region that scrolls.
*/

/** The translator of the page: its own Italian (i18n-it.ts), then the studio's. */
const useExceptionsT = () => useT(IT_EXCEPTIONS);

/** The name of the stage, the one the stepper shows (shared/routes/routes.ts, STAGES). */
const TITLE = msg('Exceptions');

export function ExceptionsPage({ foot }: { foot?: ComponentChild }) {
  const t = useExceptionsT();
  return (
    <main class="relative grid min-h-0 flex-1 content-start gap-between-sections overflow-y-auto px-(--magma-width-page-gutter) py-between-sections">
      <header class="grid gap-title-content">
        <mds-text typography="page" tag="h1">
          {t(TITLE)}
        </mds-text>
        <mds-text typography="detail" tag="p" class="max-w-text text-fg-muted">
          {t(
            'How a function shared by several components paints in every state, on every ground: the band of tabs and filters, the track of a quantity.',
          )}
        </mds-text>
      </header>
      <mds-banner variant="info" headline={t('Not built yet')} class="max-w-text">
        {t(
          'This stage comes after Magma 3: its functions, the band, the track and the frame of the fields, are roles of Magma 3, and their weights enter the preset with them. Then it holds the functions, the components that adopt them, their candidates and the weight they share with Weights. Until then, go on to the full review.',
        )}
      </mds-banner>
      {foot}
    </main>
  );
}
