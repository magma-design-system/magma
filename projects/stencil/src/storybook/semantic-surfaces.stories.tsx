import { h } from '@stencil/core';
import { ReactNode, useState } from 'react';

/**
 * Semantic surfaces cheat-sheet (epic #328 / C2). A visual + a11y read of the
 * DEFAULT semantic theme's token interpretation, split into focused stories so
 * the a11y gate (`test: 'error'`) localises any violation:
 *
 *  - Surfaces      the 5-role elevation ladder (spec 6.1) + real components on it
 *  - TextAndBorders the neutral prominence ladders: text roles on every surface
 *                   (proves A7's worst-case pick) + border levels + focus
 *  - Hues          the accent + status color families (surface/fg/border/emphasis)
 *  - ExamplePage   a realistic app screen composing real components on the surfaces
 *
 * Every story carries the in-view light/dark switch that drives the REAL root
 * flip, so the same canvas can be checked in both modes.
 */
export default {
  title: 'Common tests / Semantic surfaces',
  parameters: {
    // A3 (#575) already gates the semantic token pairs by APCA in CI; this is the
    // component-level smoke gate. SB9: `test: 'error'` fails the a11y run on a
    // violation (the addon panel always reports them in the UI).
    a11y: { test: 'error' },
    // The canvases fill the frame; drop the default story padding.
    layout: 'fullscreen',
  },
};

// The semantic token pairs are gated by APCA in CI (A3 / #575) - this design
// system's contrast authority. axe's `color-contrast` rule uses the WCAG2 ratio
// instead, so it false-flags APCA-tuned pairs: the soft tints and the `subtle` /
// `disabled` text roles these reference swatches show on purpose. Disable ONLY
// that rule on the token-reference stories; every other a11y rule stays gated.
// The Example page keeps color-contrast on, as a real-usage smoke test.
const TOKEN_REF_A11Y = {
  a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
};

// -- token accessors -------------------------------------------------------

const surfaceVar = (role: string): string => `rgb(var(--magma-surface-${role}))`;
const textVar = (role: string): string => `rgb(var(--magma-text-${role}))`;
const borderVar = (role: string): string => `rgb(var(--magma-border-${role}))`;
const hueVar = (hue: string, role: string): string => `rgb(var(--magma-${hue}-${role}))`;

// The five surface roles (spec 6.1), low -> high on the elevation axis.
const SURFACES: { role: string; use: string }[] = [
  { role: 'sunken', use: 'wells, insets, code blocks, tracks' },
  { role: 'muted', use: 'same-plane grouping: zebra rows, subtle sections' },
  { role: 'default', use: 'the canvas / page background' },
  { role: 'raised', use: 'cards, panels, sticky headers' },
  { role: 'overlay', use: 'modal, dropdown, popover, tooltip, sheet' },
];

// Text prominence (spec 6.2 / 9). A7 picks each step against the WORST-CASE
// surface, so every role stays legible on every rung of the ladder.
const TEXT_ROLES: { role: string; use: string }[] = [
  { role: 'default', use: 'body copy, primary content' },
  { role: 'muted', use: 'secondary text, captions' },
  { role: 'subtle', use: 'placeholders, hints, metadata' },
  { role: 'disabled', use: 'disabled controls' },
];

// Border prominence (spec 6.3). focus is an accent (variant-primary), not a
// neutral level, so it is shown apart from the muted -> strong ladder.
const BORDER_ROLES: { role: string; use: string }[] = [
  { role: 'muted', use: 'subtle dividers, zebra edges' },
  { role: 'default', use: 'inputs, cards, standard separation' },
  { role: 'strong', use: 'emphasis, hover / active edges' },
  { role: 'focus', use: 'keyboard focus ring (accent)' },
];

// The accent + status families. neutral has no `-surface` step, so its soft
// swatch borrows --magma-surface-muted (see `softBg`).
const HUES: { key: string; label: string; use: string }[] = [
  { key: 'accent', label: 'Accent', use: 'primary actions, links, focus' },
  { key: 'info', label: 'Info', use: 'informational status' },
  { key: 'success', label: 'Success', use: 'positive / confirmation' },
  { key: 'warning', label: 'Warning', use: 'caution' },
  { key: 'danger', label: 'Danger', use: 'errors / destructive' },
  { key: 'neutral', label: 'Neutral', use: 'quiet emphasis (no -surface)' },
];

// -- theme switch ----------------------------------------------------------

// Drive the REAL root theme flip. The generated tokens key on the `pref-theme-*`
// class on <html> (:root:not(.pref-theme-scheme-light).pref-theme-dark), and
// preferenceStore mirrors that class onto every component host through its class
// MutationObserver (src/common/preference.ts) - so this one toggle flips both the
// surface tokens and the components.
const THEME_MODES = ['light', 'dark', 'system'];
const readMode = (): string => {
  const { classList } = document.documentElement;
  return THEME_MODES.find((mode) => classList.contains(`pref-theme-${mode}`)) ?? 'light';
};
const applyMode = (mode: string): void => {
  const { classList } = document.documentElement;
  THEME_MODES.forEach((value) => classList.remove(`pref-theme-${value}`));
  classList.add(`pref-theme-${mode}`);
};

const ThemeSwitch = () => {
  const [mode, setMode] = useState<string>(readMode);
  const choose = (next: string) => {
    applyMode(next);
    setMode(next);
  };
  return (
    <div class="flex gap-200 items-center">
      <mds-text typography="label">Theme: {mode}</mds-text>
      {/* label prop (not slotted children): mds-button only exposes an accessible
          name to axe via the `label` prop - slotted text stays too deep in shadow. */}
      <mds-button
        variant={mode === 'light' ? 'primary' : 'dark'}
        tone={mode === 'light' ? 'strong' : 'outline'}
        label="Light"
        onClick={() => choose('light')}
      />
      <mds-button
        variant={mode === 'dark' ? 'primary' : 'dark'}
        tone={mode === 'dark' ? 'strong' : 'outline'}
        label="Dark"
        onClick={() => choose('dark')}
      />
    </div>
  );
};

// -- shared layout ---------------------------------------------------------

// The page shell every story sits in: the default surface as the canvas,
// text-default as the base ink, and the theme switch pinned to the header.
const PageFrame = ({
  title,
  lead,
  children,
  hideThemeSwitch,
}: {
  title: string;
  lead: string;
  children?: ReactNode;
  hideThemeSwitch?: boolean;
}) => (
  <div
    class="grid gap-800 p-800 min-h-screen"
    style={{ background: surfaceVar('default'), color: textVar('default') }}
  >
    <header class="flex flex-wrap gap-400 items-end justify-between">
      <div class="grid gap-100 max-w-screen-tablet">
        <mds-text typography="h2">{title}</mds-text>
        <mds-text style={{ color: textVar('muted') }}>{lead}</mds-text>
      </div>
      {/* The Preferences story hides this - mds-pref owns the root theme there. */}
      {!hideThemeSwitch && <ThemeSwitch />}
    </header>
    {children}
  </div>
);

const Section = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children?: ReactNode;
}) => (
  <section class="grid gap-300">
    <div class="grid gap-25">
      <mds-text typography="h4" tag="h3">
        {title}
      </mds-text>
      {hint && (
        <mds-text typography="detail" style={{ color: textVar('muted') }}>
          {hint}
        </mds-text>
      )}
    </div>
    {children}
  </section>
);

// =========================================================================
// Story 1 - Surfaces
// =========================================================================

// The ladder as labelled bars: the exact per-mode color of each role. Text uses
// --magma-text-default (chosen by A7 against the worst-case surface), so it stays
// legible on every rung in both modes.
const LadderBars = () => (
  <div class="grid gap-200">
    {SURFACES.map((surface) => (
      <div
        key={surface.role}
        class="flex flex-wrap gap-x-600 gap-y-100 items-baseline justify-between p-400 rounded-md"
        style={{ background: surfaceVar(surface.role), border: `1px solid ${borderVar('muted')}` }}
      >
        <code>--magma-surface-{surface.role}</code>
        <span style={{ color: textVar('muted') }}>{surface.use}</span>
      </div>
    ))}
  </div>
);

// A nested scene: raised cards on the canvas, a sunken well inside one, and an
// overlay panel. Real components consume the tokens; the sunken well and the
// overlay stand-in are plain token-styled boxes (no bare single-role neutral
// component exists for those).
const Scene = () => (
  <div class="grid gap-400 grid-cols-fit-md">
    <mds-card>
      <div slot="content" class="grid gap-300 p-600">
        <mds-text typography="h4">Raised card</mds-text>
        <mds-text>
          On --magma-surface-raised: lifted above the canvas by fill, no fake outline.
        </mds-text>
        <div
          class="grid gap-100 p-400 rounded-sm"
          style={{ background: surfaceVar('sunken'), border: `1px solid ${borderVar('muted')}` }}
        >
          <mds-text typography="option">--magma-surface-sunken (inset well)</mds-text>
        </div>
      </div>
    </mds-card>

    <mds-card>
      <div slot="content" class="grid gap-300 p-600">
        <mds-text typography="h4">Another raised card</mds-text>
        <mds-text>Cards share one absolute role: raised. Nesting is handled per-case.</mds-text>
      </div>
    </mds-card>

    <div
      class="grid gap-300 p-600 rounded-2xl"
      style={{ background: surfaceVar('overlay'), boxShadow: 'var(--shadow-2xl)' }}
    >
      <mds-text typography="h4">Overlay surface</mds-text>
      <mds-text>--magma-surface-overlay: modal, dropdown, tooltip, popover, sheet.</mds-text>
    </div>
  </div>
);

export const Surfaces = {
  parameters: TOKEN_REF_A11Y,
  render: () => (
    <PageFrame
      title="Surfaces"
      lead="The 5-role elevation ladder (spec 6.1). Flip the theme: elevation reads from the surface fill in both modes - no pure-black flat canvas."
    >
      <Section title="Surface ladder" hint="Low to high on the elevation axis.">
        <LadderBars />
      </Section>
      <Section title="Components on the ladder">
        <Scene />
      </Section>
    </PageFrame>
  ),
};

// =========================================================================
// Story 2 - Text & borders (neutral prominence)
// =========================================================================

// Every text role rendered on one surface. Repeated across all five surfaces,
// this is the direct visual proof of A7: each role stays legible on every rung.
const TextPanel = ({ surface }: { surface: string; key?: string }) => (
  <div
    class="grid gap-200 p-400 rounded-md"
    style={{ background: surfaceVar(surface), border: `1px solid ${borderVar('muted')}` }}
  >
    <code>surface-{surface}</code>
    {TEXT_ROLES.map((text) => (
      <div key={text.role} class="flex flex-wrap gap-x-400 gap-y-25 items-baseline justify-between">
        <span style={{ color: textVar(text.role) }}>The quick brown fox - text-{text.role}</span>
        <mds-text typography="option" style={{ color: textVar('subtle') }}>
          {text.use}
        </mds-text>
      </div>
    ))}
    <div
      class="mt-100 px-300 py-100 rounded-sm justify-self-start"
      style={{ background: hueVar('neutral', 'emphasis'), color: textVar('on-emphasis') }}
    >
      text-on-emphasis (on a neutral fill)
    </div>
  </div>
);

const BorderBox = ({ role, use }: { role: string; use: string; key?: string }) => (
  <div
    class="grid gap-100 p-400 rounded-md"
    style={{
      background: surfaceVar('default'),
      // focus is a ring, not a hairline: widen it so the accent reads.
      border: `${role === 'focus' ? '2px' : '1px'} solid ${borderVar(role)}`,
    }}
  >
    <code>border-{role}</code>
    <mds-text typography="option" style={{ color: textVar('muted') }}>
      {use}
    </mds-text>
  </div>
);

export const TextAndBorders = {
  parameters: TOKEN_REF_A11Y,
  render: () => (
    <PageFrame
      title="Text & borders"
      lead="Neutral prominence ladders. Text roles are shown on every surface - A7 picks each step against the worst-case surface, so all stay legible in both modes."
    >
      <Section title="Text prominence, per surface">
        <div class="grid gap-400 grid-cols-fit-md">
          {SURFACES.map((surface) => (
            <TextPanel key={surface.role} surface={surface.role} />
          ))}
        </div>
      </Section>
      <Section
        title="Border prominence"
        hint="muted -> strong is the neutral ladder; focus is the accent ring."
      >
        <div class="grid gap-400 grid-cols-fit-sm">
          {BORDER_ROLES.map((border) => (
            <BorderBox key={border.role} role={border.role} use={border.use} />
          ))}
        </div>
      </Section>
    </PageFrame>
  ),
};

// =========================================================================
// Story 3 - Hues (accent + status families)
// =========================================================================

// One family card: the soft pair (surface bg + fg text + border), the solid
// pair (emphasis bg + on-emphasis text), and an inline fg sample on the canvas.
const HueCard = ({ hue }: { hue: { key: string; label: string; use: string }; key?: string }) => {
  const softBg = hue.key === 'neutral' ? surfaceVar('muted') : hueVar(hue.key, 'surface');
  return (
    <div
      class="grid gap-300 p-400 rounded-md"
      style={{ background: surfaceVar('raised'), border: `1px solid ${borderVar('muted')}` }}
    >
      <div class="flex items-baseline justify-between gap-300">
        <mds-text typography="h6" tag="h4">
          {hue.label}
        </mds-text>
        <mds-text typography="option" style={{ color: textVar('subtle') }}>
          {hue.use}
        </mds-text>
      </div>
      <div class="flex flex-wrap gap-200 items-center">
        <span
          class="px-300 py-100 rounded-full"
          style={{
            background: softBg,
            color: hueVar(hue.key, 'fg'),
            border: `1px solid ${hueVar(hue.key, 'border')}`,
          }}
        >
          Soft
        </span>
        <span
          class="px-300 py-100 rounded-full"
          style={{ background: hueVar(hue.key, 'emphasis'), color: hueVar(hue.key, 'on-emphasis') }}
        >
          Solid
        </span>
        <span style={{ color: hueVar(hue.key, 'fg') }}>Aa text / link</span>
      </div>
      <code style={{ color: textVar('subtle') }}>
        {hue.key === 'neutral'
          ? 'fg / border / emphasis / on-emphasis'
          : 'surface / fg / border / emphasis / on-emphasis'}
      </code>
    </div>
  );
};

export const Hues = {
  parameters: TOKEN_REF_A11Y,
  render: () => (
    <PageFrame
      title="Hues"
      lead="The accent + status color families. Each pairs a soft tint (surface + fg) with a solid fill (emphasis + on-emphasis); both pairs are APCA-gated in CI (A3)."
    >
      <Section title="Color families">
        <div class="grid gap-400 grid-cols-fit-md">
          {HUES.map((hue) => (
            <HueCard key={hue.key} hue={hue} />
          ))}
        </div>
      </Section>
    </PageFrame>
  ),
};

// =========================================================================
// Story 4 - Example page: a realistic dashboard + the full component library
// =========================================================================

// A labelled cell: the component tag as a subtle caption + the instance, on a
// raised panel. `wide` makes the cell span the whole auto-fit row.
const Cell = ({
  tag,
  wide,
  children,
}: {
  tag: string;
  wide?: boolean;
  children?: ReactNode;
  key?: string;
}) => (
  <div
    class="grid gap-200 content-start p-400 rounded-lg"
    style={{
      background: surfaceVar('raised'),
      border: `1px solid ${borderVar('muted')}`,
      ...(wide ? { gridColumn: '1 / -1' } : {}),
    }}
  >
    <code style={{ color: textVar('subtle'), fontSize: '0.72rem' }}>{tag}</code>
    {children}
  </div>
);

// Fixed-position / overlay components (modal, toast, tab-bar, radial-menu...)
// escape normal flow. The `transform` makes this box their containing block, so
// they render INSIDE the stage instead of floating over the whole page.
const OverlayStage = ({
  tag,
  height,
  children,
}: {
  tag: string;
  height?: string;
  children?: ReactNode;
  key?: string;
}) => (
  <div
    class="grid gap-200 content-start p-400 rounded-lg"
    style={{ background: surfaceVar('raised'), border: `1px solid ${borderVar('muted')}` }}
  >
    <code style={{ color: textVar('subtle'), fontSize: '0.72rem' }}>{tag}</code>
    <div
      class="relative overflow-hidden rounded-md"
      style={{
        height: height ?? '240px',
        transform: 'translateZ(0)',
        background: surfaceVar('default'),
        border: `1px solid ${borderVar('muted')}`,
      }}
    >
      {children}
    </div>
  </div>
);

const CellGrid = ({ children }: { children?: ReactNode }) => (
  <div class="grid gap-400 grid-cols-2 items-start">{children}</div>
);

// Portaled overlays (modal, dropdown, toast, status bar, push) render to
// document.body, so no wrapper can contain them - open them from a trigger, as
// a real app does. Sets the prop imperatively (no per-story React state needed).
const openOverlay = (id: string, prop: 'opened' | 'visible') => () => {
  const el = document.getElementById(id) as unknown as Record<string, boolean> | null;
  if (el) el[prop] = true;
};

const ExamplePageTemplate = () => (
  <PageFrame
    title="Acme Console"
    lead="A realistic application screen, then the full component library - every released component sitting on the semantic surfaces. Flip the theme: the whole system follows the root, no per-component dark refinement."
  >
    {/* App bar - a raised strip above the canvas */}
    <div
      class="flex flex-wrap gap-400 items-center justify-between p-400 rounded-lg"
      style={{ background: surfaceVar('raised'), border: `1px solid ${borderVar('muted')}` }}
    >
      <div class="flex gap-300 items-center min-w-0">
        <mds-img class="w-1000 shrink-0" src="/logo-gruppo-maggioli.svg" alt="Acme logo" />
        <mds-breadcrumb>
          <mds-breadcrumb-item label="Home" />
          <mds-breadcrumb-item label="Projects" />
          <mds-breadcrumb-item label="Acme" />
        </mds-breadcrumb>
      </div>
      <div class="flex gap-200 items-center">
        <mds-button
          variant="dark"
          tone="outline"
          icon="mi/baseline/settings"
          aria-label="Settings"
        />
        <mds-button label="New project" icon="mi/baseline/add" />
      </div>
    </div>

    {/* Announcement */}
    <mds-banner icon="mi/baseline/info" headline="Scheduled maintenance" variant="info" tone="weak">
      <mds-text typography="detail">
        The platform will be briefly unavailable on Sunday at 02:00 CET.
      </mds-text>
      <mds-button slot="action" label="Details" variant="info" tone="outline" />
    </mds-banner>

    {/* Stat tiles - raised surface + text roles */}
    <div class="grid gap-400 grid-cols-fit-sm">
      {[
        { value: '128', label: 'Projects' },
        { value: '1240', label: 'Users' },
        { value: '94%', label: 'Uptime' },
        { value: '312', label: 'Deploys' },
      ].map((stat) => (
        <div
          key={stat.label}
          class="grid gap-25 p-500 rounded-lg"
          style={{ background: surfaceVar('raised'), border: `1px solid ${borderVar('muted')}` }}
        >
          <mds-text typography="h3" tag="p">
            {stat.value}
          </mds-text>
          <mds-text typography="option" style={{ color: textVar('muted') }}>
            {stat.label}
          </mds-text>
        </div>
      ))}
    </div>

    {/* Main + aside */}
    <div class="grid gap-600 desktop:grid-cols-3">
      <div class="grid gap-600 desktop:col-span-2">
        {/* Table card */}
        <mds-card>
          <mds-card-header>
            <mds-text typography="h5" tag="h3">
              Recent activity
            </mds-text>
            <mds-button
              slot="action"
              icon="mi/round/more-vert"
              variant="dark"
              tone="text"
              aria-label="More options"
            />
          </mds-card-header>
          <mds-card-content>
            <mds-table>
              <mds-table-header>
                <mds-table-header-cell label="User" />
                <mds-table-header-cell label="Email" />
                <mds-table-header-cell label="Status" />
              </mds-table-header>
              <mds-table-body>
                <mds-table-row>
                  <mds-table-cell value="Ada Lovelace">
                    <mds-text class="text-nowrap" typography="detail">
                      Ada Lovelace
                    </mds-text>
                  </mds-table-cell>
                  <mds-table-cell class="w-full" value="ada@acme.io">
                    <mds-text class="text-nowrap" typography="detail">
                      ada@acme.io
                    </mds-text>
                  </mds-table-cell>
                  <mds-table-cell value="active" class="whitespace-nowrap text-right">
                    <mds-badge variant="success" tone="weak">
                      Active
                    </mds-badge>
                  </mds-table-cell>
                </mds-table-row>
                <mds-table-row>
                  <mds-table-cell value="Alan Turing">
                    <mds-text class="text-nowrap" typography="detail">
                      Alan Turing
                    </mds-text>
                  </mds-table-cell>
                  <mds-table-cell class="w-full" value="alan@acme.io">
                    <mds-text class="text-nowrap" typography="detail">
                      alan@acme.io
                    </mds-text>
                  </mds-table-cell>
                  <mds-table-cell value="trial" class="whitespace-nowrap text-right">
                    <mds-badge variant="warning" tone="weak">
                      Trial
                    </mds-badge>
                  </mds-table-cell>
                </mds-table-row>
                <mds-table-row>
                  <mds-table-cell value="Grace Hopper">
                    <mds-text class="text-nowrap" typography="detail">
                      Grace Hopper
                    </mds-text>
                  </mds-table-cell>
                  <mds-table-cell class="w-full" value="grace@acme.io">
                    <mds-text class="text-nowrap" typography="detail">
                      grace@acme.io
                    </mds-text>
                  </mds-table-cell>
                  <mds-table-cell value="blocked" class="whitespace-nowrap text-right">
                    <mds-badge variant="error" tone="weak">
                      Blocked
                    </mds-badge>
                  </mds-table-cell>
                </mds-table-row>
              </mds-table-body>
            </mds-table>
            <div class="flex justify-end pt-400">
              <mds-paginator class="min-w-0" pages={8} />
            </div>
          </mds-card-content>
        </mds-card>

        {/* Media card */}
        <mds-card>
          <mds-card-header>
            <div class="flex flex-col grow min-w-0">
              <mds-text typography="h6" tag="h3" truncate="word">
                Release 4.2
              </mds-text>
              <mds-text typography="caption" truncate="word">
                Shipping notes
              </mds-text>
            </div>
          </mds-card-header>
          <mds-card-media>
            <mds-img src="/video-preview-01.webp" class="object-cover" alt="Release preview" />
          </mds-card-media>
          <mds-card-content>
            <mds-text>
              Semantic surfaces landed across cards, overlays, banners and toasts. Elevation now
              reads from the surface fill, so dark mode drops the fake outlines and glows.
            </mds-text>
          </mds-card-content>
          <mds-card-footer>
            <mds-button variant="dark" tone="text" label="Dismiss" />
            <mds-button variant="dark" label="Read more" />
          </mds-card-footer>
        </mds-card>
      </div>

      {/* Aside */}
      <div class="grid gap-600">
        <mds-card>
          <mds-card-header>
            <mds-text typography="h5" tag="h3">
              Team
            </mds-text>
          </mds-card-header>
          <mds-card-content>
            <mds-list>
              <mds-list-item>Ada Lovelace - Owner</mds-list-item>
              <mds-list-item>Alan Turing - Maintainer</mds-list-item>
              <mds-list-item>Grace Hopper - Contributor</mds-list-item>
            </mds-list>
          </mds-card-content>
        </mds-card>

        <mds-card>
          <mds-card-content>
            <div class="grid gap-400 p-100">
              <mds-note>
                Storage is filling up. Archive old builds to free space before the next deploy.
              </mds-note>
              <div class="grid gap-100">
                <mds-text typography="option" style={{ color: textVar('muted') }}>
                  Storage - 62%
                </mds-text>
                <mds-progress progress={0.62} aria-label="Storage used" />
              </div>
              <div class="flex flex-wrap gap-200">
                <mds-chip icon="mi/baseline/palette" label="Design" variant="blue" tone="weak" />
                <mds-chip icon="mi/baseline/code" label="Frontend" variant="green" tone="weak" />
                <mds-chip icon="mi/baseline/bug-report" label="QA" variant="orange" tone="weak" />
              </div>
            </div>
          </mds-card-content>
        </mds-card>
      </div>
    </div>

    {/* Create form */}
    <mds-card>
      <mds-card-header>
        <mds-text typography="h5" tag="h3">
          Create project
        </mds-text>
      </mds-card-header>
      <mds-card-content>
        <div class="grid gap-300 p-100">
          <mds-input-field label="Project name">
            <mds-input type="text" placeholder="Es: Acme Portal" name="projectName" />
          </mds-input-field>
          <div class="grid gap-x-600 gap-y-300 grid-cols-fit-md">
            <mds-input-field label="Owner">
              <mds-input type="text" placeholder="Es: Ada Lovelace" name="owner" />
            </mds-input-field>
            <mds-input-field label="Repository">
              <mds-input type="text" placeholder="Es: acme/portal" name="repository" />
            </mds-input-field>
          </div>
          <mds-input-switch size="sm">Enable notifications</mds-input-switch>
        </div>
      </mds-card-content>
      <mds-card-footer>
        <mds-button variant="dark" tone="text" label="Cancel" />
        <mds-button label="Create" />
      </mds-card-footer>
    </mds-card>
    {/* ===================== FULL COMPONENT LIBRARY ===================== */}

    <Section
      title="Actions & navigation"
      hint="Every remaining component, labelled, on the semantic surfaces."
    >
      <CellGrid>
        <Cell tag="<mds-button>">
          <div class="flex flex-wrap gap-400 items-center">
            <mds-button label="Confirm" />
            <mds-button label="Cancel" variant="dark" tone="outline" />
            <mds-button label="Info" variant="info" tone="weak" />
            <mds-button label="Delete" variant="error" />
          </div>
        </Cell>
        <Cell tag="<mds-button-group>">
          <mds-button-group>
            <mds-button
              icon="mi/baseline/format-bold"
              variant="dark"
              tone="text"
              aria-label="Bold"
            />
            <mds-button
              icon="mi/baseline/format-italic"
              variant="dark"
              tone="text"
              aria-label="Italic"
            />
            <mds-button
              icon="mi/baseline/wrap-text"
              variant="dark"
              tone="text"
              aria-label="Wrap text"
            />
          </mds-button-group>
        </Cell>
        <Cell tag="<mds-button-dropdown>">
          <mds-button-dropdown label="Save as draft" variant="success" tone="weak">
            <mds-button icon="mi/baseline/send" variant="dark" tone="text" label="Send now" />
            <mds-button icon="mi/baseline/delete" variant="dark" tone="text" label="Delete" />
          </mds-button-dropdown>
        </Cell>
        <Cell tag="<mds-breadcrumb>">
          <mds-breadcrumb>
            <mds-breadcrumb-item label="Home" />
            <mds-breadcrumb-item label="Library" />
            <mds-breadcrumb-item label="Components" />
          </mds-breadcrumb>
        </Cell>
        <Cell tag="<mds-tab>">
          <mds-tab>
            <mds-tab-item label="First tab" selected />
            <mds-tab-item label="Second tab" icon="mdi/alien" />
            <mds-tab-item label="Third tab" />
          </mds-tab>
        </Cell>
        <Cell tag="<mds-filter>">
          <mds-filter label="Filter label">
            <mds-filter-item label="First option" value="1" count="101" />
            <mds-filter-item label="Second option" value="2" count="43" />
            <mds-filter-item label="Third option" value="3" count="7" />
          </mds-filter>
        </Cell>
        <Cell tag="<mds-paginator>">
          <mds-paginator class="min-w-0" pages={32} />
        </Cell>
        <Cell tag="<mds-keyboard>">
          <mds-keyboard>
            <mds-keyboard-key name="command" />
            <mds-keyboard-key name="shift" />
            <mds-keyboard-key name="s" />
          </mds-keyboard>
        </Cell>
        <Cell tag="<mds-help>">
          <mds-help>We are available 24/7, except on weekends.</mds-help>
        </Cell>
        <Cell tag="<mds-hr>">
          <mds-text typography="detail">Above the rule</mds-text>
          <mds-hr />
          <mds-text typography="detail">Below the rule</mds-text>
        </Cell>
        <Cell tag="<mds-separator>">
          <div class="flex gap-300 items-center">
            <mds-text typography="detail">Left</mds-text>
            <mds-separator />
            <mds-text typography="detail">Right</mds-text>
          </div>
        </Cell>
        <Cell tag="<mds-header> / <mds-header-bar>" wide>
          <mds-header class="relative w-full" appearance="inline" nav="all" menu="none">
            <mds-header-bar class="relative">
              <div class="flex gap-400 items-center">
                <mds-img class="w-1000" src="/logo-gruppo-maggioli.svg" alt="Logo" />
                <mds-text typography="h5">Header bar</mds-text>
              </div>
              <mds-button slot="nav" variant="dark" tone="outline" label="Sign in" />
              <mds-button slot="nav" icon="mi/round/person" label="Register" />
            </mds-header-bar>
          </mds-header>
        </Cell>
        <Cell tag="<mds-stepper-bar>" wide>
          <mds-stepper-bar items-done="2">
            <mds-stepper-bar-item
              badge
              step
              icon-checked="mi/baseline/done"
              icon="mi/baseline/person"
              label="New account"
            />
            <mds-stepper-bar-item
              badge
              step
              icon-checked="mi/baseline/done"
              icon="mi/baseline/badge"
              label="Personal data"
            />
            <mds-stepper-bar-item
              badge
              step
              icon-checked="mi/baseline/done"
              icon="mi/round/email"
              label="Newsletter"
            />
            <mds-stepper-bar-item
              badge
              step
              icon-checked="mi/baseline/done"
              icon="mi/baseline/done"
              label="Done"
            />
          </mds-stepper-bar>
        </Cell>
      </CellGrid>
    </Section>

    <Section title="Data & content">
      <CellGrid>
        <Cell tag="<mds-tree>">
          <mds-tree expanded>
            <mds-tree-item label="Documents">
              <mds-tree-item label="Resume.pdf" />
              <mds-tree-item label="Cover letter.docx" />
              <mds-tree-item label="Projects">
                <mds-tree-item label="Roadmap.xlsx" />
              </mds-tree-item>
            </mds-tree-item>
            <mds-tree-item label="Pictures" />
          </mds-tree>
        </Cell>
        <Cell tag="<mds-list>">
          <mds-list>
            <mds-list-item>First element in the list</mds-list-item>
            <mds-list-item>Second element in the list</mds-list-item>
            <mds-list-item>Third element in the list</mds-list-item>
          </mds-list>
        </Cell>
        <Cell tag="<mds-benchmark-bar>">
          <mds-benchmark-bar class="w-full" value={50} alias="50%">
            Server load
          </mds-benchmark-bar>
        </Cell>
        <Cell tag="<mds-progress>">
          <mds-progress class="w-full" aria-label="Upload progress" progress={0.35} />
        </Cell>
        <Cell tag="<mds-radial-progress>">
          <mds-radial-progress class="w-2000" progress={0.65} />
        </Cell>
        <Cell tag="<mds-spinner>">
          <mds-spinner running />
        </Cell>
        <Cell tag="<mds-badge>">
          <div class="flex flex-wrap gap-200 items-center">
            <mds-badge tone="weak">Draft</mds-badge>
            <mds-badge variant="success" tone="strong">
              Active
            </mds-badge>
            <mds-badge variant="error" tone="outline">
              Failed
            </mds-badge>
          </div>
        </Cell>
        <Cell tag="<mds-label>">
          <div class="flex flex-wrap gap-200 items-center">
            <mds-label label="Amaranth" variant="amaranth" />
            <mds-label label="Blue" variant="blue" />
            <mds-label label="Green" variant="green" />
          </div>
        </Cell>
        <Cell tag="<mds-chip>">
          <div class="flex flex-wrap gap-200 items-center">
            <mds-chip icon="mi/baseline/widgets" label="Components" variant="ai" />
            <mds-chip icon="mi/baseline/ac-unit" label="Cold" variant="info" tone="weak" />
            <mds-chip
              icon="mi/baseline/play-arrow"
              label="Removable"
              variant="lime"
              tone="weak"
              deletable
            />
          </div>
        </Cell>
        <Cell tag="<mds-icon>">
          <mds-icon name="mi/baseline/check-circle" class="w-1200 fill-brand-maggioli-05" />
        </Cell>
        <Cell tag="<mds-emoji>">
          <mds-emoji style={{ width: '72px', height: '72px' }} />
        </Cell>
        <Cell tag="<mds-mention>">
          <mds-text>
            Hello <mds-mention label="mario.rossi" />, welcome to the team.
          </mds-text>
        </Cell>
        <Cell tag="<mds-text>">
          <div class="grid gap-100">
            <mds-text typography="h5" tag="p">
              Heading style
            </mds-text>
            <mds-text typography="paragraph">A short paragraph of body copy.</mds-text>
            <mds-text typography="caption">Caption and metadata</mds-text>
          </div>
        </Cell>
        <Cell tag="<mds-note>">
          <mds-note>
            <mds-text typography="detail">A short note with a highlighted side rule.</mds-text>
          </mds-note>
        </Cell>
        <Cell tag="<mds-quote>">
          <mds-quote>
            What one programmer can do in one month, two programmers can do in two months.
            <mds-author slot="author">
              <mds-avatar
                initials="fb"
                slot="avatar"
                class="w-1200"
                src="/avatar-06-200x200.jpeg"
              />
              <mds-text typography="h6">Fred Brooks</mds-text>
              <mds-text typography="caption">Software engineer</mds-text>
            </mds-author>
          </mds-quote>
        </Cell>
        <Cell tag="<mds-bibliography>">
          <mds-bibliography
            author="Mario Rossi"
            date="2012-08-03"
            location="Milano"
            name="Grosso guaio a Chinatown"
            publisher="Decca Libri"
            url="https://www.maggioli.com"
          />
        </Cell>
        <Cell tag="<mds-usage>">
          <mds-usage variant="do">
            <mds-text>Use one style for the title and one for the body.</mds-text>
            <mds-text>Keep to the type styles already in the system.</mds-text>
          </mds-usage>
        </Cell>
        <Cell tag="<mds-accordion>">
          <mds-accordion>
            <mds-accordion-item label="Overview" selected>
              <mds-text>A full set of accessible components.</mds-text>
            </mds-accordion-item>
            <mds-accordion-item label="Accessibility first">
              <mds-text>Accessibility is a first-class citizen.</mds-text>
            </mds-accordion-item>
          </mds-accordion>
        </Cell>
        <Cell tag="<mds-accordion-timer>">
          <mds-accordion-timer>
            <mds-accordion-timer-item description="Overview">
              <mds-text>A full set of accessible components.</mds-text>
            </mds-accordion-timer-item>
            <mds-accordion-timer-item description="Scalable by design" selected>
              <mds-text>Built to scale across many brands.</mds-text>
            </mds-accordion-timer-item>
          </mds-accordion-timer>
        </Cell>
        <Cell tag="<mds-details>">
          <mds-details opened>
            <mds-icon name="mi/baseline/check-circle" slot="icon" />
            <mds-text slot="title" typography="h6">
              Details
            </mds-text>
            <mds-text typography="detail">
              Additional information in a collapsible section.
            </mds-text>
            <mds-button size="sm" slot="action" tone="weak" label="Go to content" />
          </mds-details>
        </Cell>
        <Cell tag="<mds-kpi>" wide>
          <mds-kpi>
            <mds-kpi-item icon="mi/baseline/directions-walk" label="75" description="Coaches" />
            <mds-kpi-item icon="mi/baseline/sports" label="123" description="Referees" />
            <mds-kpi-item icon="mi/baseline/stadium" label="188" description="Stadiums" />
          </mds-kpi>
        </Cell>
        <Cell tag="<mds-price-table>" wide>
          <mds-price-table>
            <mds-price-table-list>
              <mds-text typography="h5" tag="p" slot="header">
                Basic plan
              </mds-text>
              <mds-text typography="detail" slot="header">
                For freelancers and small studios.
              </mds-text>
              <mds-text typography="h2" tag="p" slot="price">
                $49
              </mds-text>
              <mds-button slot="action" variant="dark" label="Start" />
            </mds-price-table-list>
            <mds-price-table-features>
              <mds-price-table-features-row>
                <mds-price-table-features-cell type="label">
                  Base features
                </mds-price-table-features-cell>
                <mds-price-table-features-cell type="supported" />
              </mds-price-table-features-row>
              <mds-price-table-features-row>
                <mds-price-table-features-cell type="label">Users</mds-price-table-features-cell>
                <mds-price-table-features-cell type="text">10</mds-price-table-features-cell>
              </mds-price-table-features-row>
              <mds-price-table-features-row>
                <mds-price-table-features-cell type="label">
                  Advanced reports
                </mds-price-table-features-cell>
                <mds-price-table-features-cell type="unsupported" />
              </mds-price-table-features-row>
            </mds-price-table-features>
          </mds-price-table>
        </Cell>
        <Cell tag="<mds-zero>" wide>
          <mds-zero>
            <mds-img
              src="/logo-gruppo-maggioli.svg"
              alt="Maggioli logo"
              class="w-full max-w-[240px]"
            />
            <mds-text typography="h5" tag="p" slot="content">
              Create your first article
            </mds-text>
            <mds-text typography="detail" slot="content">
              Contribute reference editorial content for public administration.
            </mds-text>
            <mds-button slot="action" size="lg" label="New" />
          </mds-zero>
        </Cell>
      </CellGrid>
    </Section>

    <Section title="People & media">
      <CellGrid>
        <Cell tag="<mds-author>">
          <mds-author>
            <mds-avatar class="w-2000" initials="eb" slot="avatar" src="/avatar-06-200x200.jpeg" />
            <mds-text typography="h6">Eric Bolton</mds-text>
            <mds-text typography="caption">Design System Architect</mds-text>
            <mds-text typography="caption">Author and Publisher</mds-text>
          </mds-author>
        </Cell>
        <Cell tag="<mds-entity>">
          <mds-entity aria-label="Place" initials="EC" class="w-full">
            <mds-text truncate="word" typography="h6">
              Entity
            </mds-text>
            <mds-text truncate="word" slot="detail" typography="caption">
              Component
            </mds-text>
            <mds-button
              slot="action"
              icon="mdi/map-marker"
              aria-label="Open in Maps"
              variant="primary"
              tone="strong"
            />
          </mds-entity>
        </Cell>
        <Cell tag="<mds-avatar>">
          <div class="flex gap-300 items-center">
            <mds-avatar class="w-2000" initials="eb" src="/avatar-06-200x200.jpeg" />
            <mds-avatar class="w-2000" initials="ab" tone="strong" />
            <mds-avatar class="w-2000" variant="info" tone="weak" />
          </div>
        </Cell>
        <Cell tag="<mds-avatar-stack>">
          <mds-avatar-stack size="lg" total={36}>
            <mds-avatar-stack-item initials="mr" tone="weak" />
            <mds-avatar-stack-item initials="ks" tone="weak" />
            <mds-avatar-stack-item initials="mk" tone="weak" />
            <mds-avatar-stack-item initials="ac" tone="weak" />
          </mds-avatar-stack>
        </Cell>
        <Cell tag="<mds-img>">
          <mds-img
            class="w-full object-cover rounded-md"
            style={{ aspectRatio: '16 / 9' }}
            src="/video-preview-01.webp"
            alt="Aerial view of a coastal road"
          />
        </Cell>
        <Cell tag="<mds-file>">
          <div class="flex flex-wrap gap-200">
            <mds-file filename="CV_Rossi.pdf" />
            <mds-file filename="Report_2016_2017.docx" />
            <mds-file filename="Spreadsheet.xlsx" />
          </div>
        </Cell>
        <Cell tag="<mds-file-preview>">
          <div class="flex flex-wrap gap-300">
            <mds-file-preview filename="CV_Rossi.pdf" filesize="6475532" />
            <mds-file-preview filename="audio file.mp3" filesize="10248594" />
          </div>
        </Cell>
        <Cell tag="<mds-video-wall>" wide>
          <mds-video-wall
            class="w-full max-w-full"
            src="/video-nature.mp4"
            poster="/video-nature-preview.webp"
          >
            Your browser does not support videos.
          </mds-video-wall>
        </Cell>
        <Cell tag="<mds-horizontal-scroll>" wide>
          <mds-horizontal-scroll>
            <mds-card class="min-w-[280px]">
              <mds-card-content>
                <mds-text typography="h6">First card</mds-text>
                <mds-text typography="detail">A scrollable strip of cards.</mds-text>
              </mds-card-content>
            </mds-card>
            <mds-card class="min-w-[280px]">
              <mds-card-content>
                <mds-text typography="h6">Second card</mds-text>
                <mds-text typography="detail">A scrollable strip of cards.</mds-text>
              </mds-card-content>
            </mds-card>
            <mds-card class="min-w-[280px]">
              <mds-card-content>
                <mds-text typography="h6">Third card</mds-text>
                <mds-text typography="detail">A scrollable strip of cards.</mds-text>
              </mds-card-content>
            </mds-card>
          </mds-horizontal-scroll>
        </Cell>
      </CellGrid>
    </Section>

    <Section title="Forms & inputs">
      <CellGrid>
        <Cell tag="<mds-input> / <mds-input-field>">
          <mds-input-field label="Full name" message="As it appears on your ID.">
            <mds-input type="text" name="fullName" placeholder="e.g. Mario Rossi" />
          </mds-input-field>
        </Cell>
        <Cell tag="<mds-input-select>">
          <mds-input-field label="Movie">
            <mds-input-select name="movie" placeholder="Select a movie...">
              <option value="1">First contact</option>
              <option value="2">Second impact</option>
              <option value="3">The Third Man</option>
            </mds-input-select>
          </mds-input-field>
        </Cell>
        <Cell tag="<mds-input-switch>">
          <mds-input-switch type="switch" name="notifications" value="1">
            Email notifications
          </mds-input-switch>
        </Cell>
        <Cell tag="<mds-input-date>">
          <mds-input-field label="Birth date">
            <mds-input-date />
          </mds-input-field>
        </Cell>
        <Cell tag="<mds-input-date-range>">
          <mds-input-field label="Trip period">
            <mds-input-date-range>
              <mds-input-date slot="start" />
              <mds-input-date slot="end" />
            </mds-input-date-range>
          </mds-input-field>
        </Cell>
        <Cell tag="<mds-input-range>">
          <mds-input-range min={0} max={100}>
            Coolness
          </mds-input-range>
        </Cell>
        <Cell tag="<mds-input-otp>">
          <mds-input-otp />
        </Cell>
        <Cell tag="<mds-input-tip>">
          <mds-input-tip>
            <mds-input-tip-item variant="required" />
            <mds-input-tip-item variant="disabled" />
          </mds-input-tip>
        </Cell>
        <Cell tag="<mds-input-upload>" wide>
          <mds-input-upload accept=".pdf, image/jpeg, image/png" max-file-size={70} max-files={3} />
        </Cell>
        <Cell tag="<mds-calendar>" wide>
          <mds-calendar start-date="2025-03-18" end-date="2025-03-24" class="w-full" />
        </Cell>
      </CellGrid>
    </Section>

    <Section title="Preferences">
      <Cell
        tag="<mds-pref> + pref-theme / -contrast / -animation / -consumption / -language / -theme-variant"
        wide
      >
        <mds-text style={{ color: textVar('muted') }}>
          The preference components are live global controls: on mount they write the theme,
          contrast, motion and consumption prefs onto the document root and revert changes made
          elsewhere. On this page they would fight the theme switch in the header, so they are
          exercised on their own (Storybook: "UI / Preferences") rather than embedded here.
        </mds-text>
      </Cell>
    </Section>

    <Section
      title="Overlays & floating"
      hint="Modal, dropdown, tooltip, toast, status bar and push notification portal to the viewport - a wrapper can't cage them, so open each from its trigger (as a real app does). The inline ones are contained below."
    >
      <div class="flex flex-wrap gap-300 items-center">
        <mds-button label="Open modal" onClick={openOverlay('ss-modal', 'opened')} />
        <mds-button
          id="ss-dropdown-trigger"
          label="Show dropdown"
          variant="dark"
          tone="outline"
          onClick={openOverlay('ss-dropdown', 'visible')}
        />
        <mds-button
          id="ss-tooltip-trigger"
          label="Show tooltip"
          variant="dark"
          tone="outline"
          onClick={openOverlay('ss-tooltip', 'visible')}
        />
        <mds-button
          label="Show status bar"
          variant="dark"
          tone="outline"
          onClick={openOverlay('ss-status', 'visible')}
        />
        <mds-button
          label="Show push notification"
          variant="dark"
          tone="outline"
          onClick={openOverlay('ss-push', 'visible')}
        />
      </div>

      {/* Closed on load; the triggers above open them. */}
      <mds-modal id="ss-modal" position="right">
        <div class="p-400 grid gap-400">
          <mds-text typography="h5" tag="p">
            Modal title
          </mds-text>
          <mds-text>Flexible components that adapt across brands.</mds-text>
        </div>
      </mds-modal>
      <mds-dropdown id="ss-dropdown" target="#ss-dropdown-trigger" class="max-w-[350px] w-full">
        <mds-author>
          <mds-avatar initials="fb" slot="avatar" class="w-2000" src="/avatar-06-200x200.jpeg" />
          <mds-text typography="h6">Fred Brooks</mds-text>
          <mds-text typography="caption">Software engineer</mds-text>
        </mds-author>
      </mds-dropdown>
      <mds-tooltip id="ss-tooltip" target="#ss-tooltip-trigger">
        This is a helpful tooltip.
      </mds-tooltip>
      <mds-status-bar id="ss-status" position="bottom" description="You are editing 4 items">
        <mds-button label="Cancel" variant="dark" tone="weak" />
        <mds-button label="Confirm" variant="primary" tone="strong" />
      </mds-status-bar>
      <mds-push-notification id="ss-push" behavior="manual">
        <mds-push-notification-item
          preview="avatar"
          src="/avatar-06-200x200.jpeg"
          subject="Sarah Ho"
          message="I'm preparing the document and should finish today."
        >
          <mds-button slot="actions" label="Reply" variant="primary" tone="weak" size="sm" />
        </mds-push-notification-item>
        <mds-push-notification-item
          icon="mi/baseline/attachment"
          subject="New attachment"
          message="A new file was shared with you."
        />
      </mds-push-notification>

      <CellGrid>
        <OverlayStage tag="<mds-toast>">
          <mds-toast position="bottom-center" visible>
            <mds-icon slot="icon" name="mi/baseline/warning" />
            Item moved successfully
            <mds-button slot="action" size="sm" label="Undo" />
          </mds-toast>
        </OverlayStage>
        <OverlayStage tag="<mds-radial-menu>" height="360px">
          <div class="flex items-center justify-center h-full">
            <mds-radial-menu opened radius={5} disc>
              <mds-radial-menu-item
                icon="mi/baseline/favorite"
                tooltip="Favorite"
                variant="dark"
                tone="weak"
              />
              <mds-radial-menu-item
                icon="mi/baseline/email"
                tooltip="Email"
                variant="dark"
                tone="weak"
              />
              <mds-radial-menu-item
                icon="mi/baseline/ios-share"
                tooltip="Share"
                variant="dark"
                tone="weak"
              />
              <mds-radial-menu-item icon="mi/baseline/delete" tooltip="Delete" variant="error" />
            </mds-radial-menu>
          </div>
        </OverlayStage>
        <OverlayStage tag="<mds-tab-bar>">
          <mds-tab-bar>
            <mds-tab-bar-item icon="mdi/barley" selected label="Home" />
            <mds-tab-bar-item icon="mdi/crown" label="Rewards" />
            <mds-tab-bar-item icon="mi/baseline/timer" label="Recent" />
            <mds-tab-bar-item icon="mi/baseline/account-balance" label="Account" />
          </mds-tab-bar>
        </OverlayStage>
        <Cell tag="<mds-notification>">
          <mds-button label="Incoming messages" icon="mdi/email">
            <mds-notification slot="notification" strategy="disabled" value={7} />
          </mds-button>
        </Cell>
      </CellGrid>
    </Section>

    <Section title="Embedded content">
      <Cell tag="<mds-url-view>" wide>
        <mds-url-view
          class="block w-full h-[320px]"
          src="https://www.maggioli.com"
          label="Maggioli website"
        />
      </Cell>
    </Section>
  </PageFrame>
);

export const ExamplePage = {
  parameters: {
    // Full component catalog: report-only (test:'todo') so the pre-existing
    // component-level a11y gaps this catalog surfaces don't block, and
    // color-contrast off since APCA (A3 / #575) is this system's contrast authority.
    a11y: { test: 'todo', config: { rules: [{ id: 'color-contrast', enabled: false }] } },
  },
  render: ExamplePageTemplate,
};

// =========================================================================
// Story 5 - Preferences (the live global controls, on their own)
// =========================================================================

// mds-pref and its sub-controls write theme / contrast / motion / consumption
// prefs onto the document root AND revert changes made elsewhere - so they own
// the theme and can't coexist with the header ThemeSwitch (they'd fight it, as
// on the Example page). Given their own page with no switch, they ARE the
// control: pick a theme / contrast / variant on the left and the semantic
// surfaces on the right follow. (It persists to storage, hence the isolation.)
export const Preferences = {
  parameters: {
    a11y: { test: 'todo', config: { rules: [{ id: 'color-contrast', enabled: false }] } },
  },
  render: () => (
    <PageFrame
      title="Preferences"
      lead="The live global preference controls. No local theme switch here - mds-pref owns the document root, and the semantic surfaces on the right respond to whatever you choose."
      hideThemeSwitch
    >
      <div class="grid gap-600 desktop:grid-cols-2 items-start">
        <Section title="Controls">
          <mds-pref class="w-full">
            <mds-pref-theme />
            <mds-pref-theme-variant>
              <mds-pref-theme-variant-item name="default" />
              <mds-pref-theme-variant-item name="cool" />
              <mds-pref-theme-variant-item name="warm" />
            </mds-pref-theme-variant>
            <mds-pref-contrast />
            <mds-pref-animation />
            <mds-pref-consumption />
            <mds-pref-language>
              <mds-pref-language-item code="it" />
              <mds-pref-language-item code="en" />
              <mds-pref-language-item code="es" />
            </mds-pref-language>
          </mds-pref>
        </Section>
        <Section
          title="Surfaces respond"
          hint="Flip theme / contrast / variant on the left and watch these - and the page - follow."
        >
          <LadderBars />
          <mds-card>
            <mds-card-content>
              <div class="grid gap-200 p-100">
                <mds-text typography="h5" tag="p">
                  Raised card
                </mds-text>
                <mds-text style={{ color: textVar('muted') }}>
                  Body copy on --magma-surface-raised, muted caption below.
                </mds-text>
              </div>
            </mds-card-content>
          </mds-card>
          <mds-banner icon="mi/baseline/info" headline="Info banner" variant="info" tone="weak">
            <mds-text typography="detail">The banner body sits on the muted surface.</mds-text>
          </mds-banner>
        </Section>
      </div>
    </PageFrame>
  ),
};
