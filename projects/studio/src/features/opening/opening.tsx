import type { ComponentChildren } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { COLOR_MODES } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import {
  baseColourOf,
  familyByShortName,
  READY_THEMES,
  type ReadyTheme,
} from '../../engine/opening.js';
import { ColorInput, Field } from '../../shared/magma/magma.js';
import { plural, useT, type T } from '../../shared/i18n/i18n.js';
import { placeOf, routeOf, STAGES, type Route } from '../../shared/routes/routes.js';
import { openBrandColour, openImported, openMagma, openReadyTheme } from '../../state/opening.js';
import { bundled, say, useStudio } from '../../state/studio.js';
import { IT_OPENING } from './i18n-it.js';

/*
  The opening (#1402, studio.object-model.md, section 5): the preset at its centre, opened from
  where the work starts, all in line: the draft, resumed at the stage it was on; Magma's preset, or
  a preset of a project from its file; a ready theme, with its look and its modes; a brand colour.
  No control of the stages, no verification. Each start is an item of a set, a card (surfaces);
  the draft comes first when there is one, and resuming it is the main action of the page; the
  others open in the primary weak tone (vittorio, 2026-11-27, on its render). A ready theme and a
  brand colour make a theme of the product (engine/opening.ts); opening over work with changes
  keeps it for the toast that undoes it (state/opening.ts). Its way out: Colours, or the stage of
  the draft. Written in the classes of Magma; the colours of the themes are data, inline.
*/

/** The translator of the page: its own Italian (i18n-it.ts), then the studio's. */
const useOpeningT = () => useT(IT_OPENING);

/** The modes of a theme, in words. */
function modesWords(t: T, modes: readonly string[]): string {
  if (modes.length === COLOR_MODES.length) return t('light and dark');
  return t(modes[0] === 'light' ? 'light only' : 'dark only');
}

/** Where the draft resumes: the page of Colors it was on, or Colours. */
function draftRoute(view: Route | undefined): Route {
  return view ?? STAGES[0].route;
}

/** The name of where the draft resumes: its stage, or the page beside a stage it was on. */
function draftPlace(t: T, route: Route): string {
  return t(placeOf(route)?.stage.label ?? STAGES[0].label);
}

/** A card of the opening: its title and what it is, then what it holds, then its actions. */
function Start({
  title,
  says,
  children,
  actions,
}: {
  title: string;
  says: string;
  children?: ComponentChildren;
  actions?: ComponentChildren;
}) {
  return (
    <mds-card>
      <mds-card-header>
        <div class="grid">
          <mds-text typography="part" tag="h2">
            {title}
          </mds-text>
          <mds-text typography="detail" tag="p" class="text-fg-muted">
            {says}
          </mds-text>
        </div>
      </mds-card-header>
      {children && <mds-card-content>{children}</mds-card-content>}
      {actions && (
        <mds-card-footer>
          <div class="flex flex-wrap justify-end gap-inline">{actions}</div>
        </mds-card-footer>
      )}
    </mds-card>
  );
}

/** A ready theme: its look (the colour of its tint, of its accent), its modes, and its start. */
function ReadyRow({ theme, onOpen }: { theme: ReadyTheme; onOpen: () => void }) {
  const t = useOpeningT();
  const preset = bundled();
  const tint = familyByShortName(preset, theme.tint)?.name ?? '';
  // the accent of the theme, a variant (`variant-secondary`), as the family it is (variant.secondary)
  const accent = (theme.accents.accent ?? 'variant-primary').replace('-', '.');
  const swatches = [baseColourOf(preset, tint), baseColourOf(preset, accent)];
  return (
    <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-between-containers">
      <span class="flex gap-inline" aria-hidden="true">
        {swatches.map((colour) => (
          <span
            class="inline-block size-500 rounded-full border border-border-muted"
            style={{ background: colour }}
          ></span>
        ))}
      </span>
      <div class="grid">
        <mds-text typography="label" tag="p">
          {theme.name}
        </mds-text>
        <mds-text typography="caption" tag="p" class="text-fg-muted">
          {t('{tint}, accent {accent}; {modes}', {
            tint: theme.tint,
            accent: accent.split('.')[1],
            modes: modesWords(t, theme.modes),
          })}
        </mds-text>
      </div>
      <mds-button
        variant="primary"
        tone="weak"
        size="sm"
        label={t('Start from {theme}', { theme: theme.name })}
        onClick={onOpen}
      ></mds-button>
    </div>
  );
}

/**
 * The opening. `onOpen` follows the address the work goes on once a preset is open: Colours, or
 * the page of the draft.
 */
export function OpeningPage({ onOpen }: { onOpen: (route: Route) => void }) {
  const t = useOpeningT();
  const studio = useStudio();
  const picker = useRef<HTMLInputElement>(null);
  const [brand, setBrand] = useState('#0a7c86');
  const changes = studio.changes.value.length;
  // the page of the work the draft was on: an address of today, or one the router takes to the
  // view that replaced it (routes.ts, ALIASES)
  const place = studio.workPlace.value;
  const resume = draftRoute(place ? routeOf(place) : undefined);
  const notice = studio.notice.value;
  const toColours = () => onOpen(STAGES[0].route);
  return (
    <main class="relative grid min-h-0 flex-1 content-start gap-between-sections overflow-y-auto px-(--magma-width-page-gutter) py-between-sections">
      <header class="grid gap-title-content">
        <mds-text typography="page" tag="h1">
          {t('Opening')}
        </mds-text>
        <mds-text typography="detail" tag="p" class="max-w-text text-fg-muted">
          {t(
            'Open the preset to work on. Your changes stay in this browser as a draft until you save or download it.',
          )}
        </mds-text>
      </header>
      {/* what kept a preset from opening: a file the schema refuses */}
      {notice && (
        <mds-banner variant="error" class="max-w-text">
          {say(t, notice)}
        </mds-banner>
      )}
      <div class="grid grid-cols-2 items-start gap-between-containers">
        {changes > 0 && (
          <Start
            title={t('Your draft')}
            says={plural(
              t,
              changes,
              '{count} change since the last exit, on {place}.',
              '{count} changes since the last exit, on {place}.',
              { place: draftPlace(t, resume) },
            )}
            actions={
              <mds-button
                icon="mi/baseline/arrow-forward"
                icon-position="right"
                label={t('Resume on {place}', { place: draftPlace(t, resume) })}
                onClick={() => onOpen(resume)}
              ></mds-button>
            }
          >
            <mds-text typography="detail" tag="p">
              {t('Pick the work up where you left it.')}
            </mds-text>
          </Start>
        )}
        <Start
          title={t("Magma's preset")}
          says={t('The one Magma builds with: its families, its weights and its themes.')}
          actions={
            <>
              <mds-button
                variant="dark"
                tone="outline"
                icon="mi/baseline/upload-file"
                label={t('Import a preset')}
                onClick={() => picker.current?.click()}
              ></mds-button>
              <mds-button
                variant="primary"
                tone="weak"
                label={t("Open Magma's preset")}
                onClick={() => {
                  openMagma(studio);
                  toColours();
                }}
              ></mds-button>
            </>
          }
        >
          <mds-text typography="detail" tag="p">
            {t('Or the preset of a project of yours, from its JSON file.')}
          </mds-text>
          <input
            ref={picker}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={async (event) => {
              const field = event.target as HTMLInputElement;
              const file = field.files?.[0];
              field.value = '';
              if (file && (await openImported(studio, file))) toColours();
            }}
          />
        </Start>
        <Start
          title={t('A ready theme')}
          says={t('The themes Magma ships, with their tint, their accent and their modes.')}
        >
          <div class="grid gap-inline">
            {READY_THEMES.map((theme) => (
              <ReadyRow
                theme={theme}
                onOpen={() => {
                  openReadyTheme(studio, theme);
                  toColours();
                }}
              />
            ))}
          </div>
        </Start>
        <Start
          title={t('A brand colour')}
          says={t('The colour of your brand becomes the accent of a theme of yours.')}
          actions={
            <mds-button
              variant="primary"
              tone="weak"
              label={t('Start from this colour')}
              onClick={() => {
                openBrandColour(studio, brand);
                toColours();
              }}
            ></mds-button>
          }
        >
          <Field label={t('Brand colour')}>
            <ColorInput value={brand} onValue={setBrand} />
          </Field>
        </Start>
      </div>
    </main>
  );
}
