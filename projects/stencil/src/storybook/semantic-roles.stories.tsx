import { h } from '@stencil/core';
import { useState, type ReactNode } from 'react';

/**
 * Semantic token roles - the reference cheat-sheet (epic #328).
 *
 * A single scrolling page that DEFINES what each `--magma-*` semantic token is
 * for, so a name can be reasoned about, not guessed. It documents the layer
 * exactly as it ships today (`css/semantic.css`): the groups `tint`, `surface`,
 * `text`, `border` and the hue families (accent + status + neutral). Names are
 * the current ones - no rename is proposed here.
 *
 * Three things make the naming legible:
 *  - the grammar: `--magma-<property>-<role>`, and the suffix is RELATIVE to the
 *    property (`-muted` is not a color, it is "the quiet variant of THAT group");
 *  - the foundation: how the old `lv1/lv2` draft became the surface roles, and
 *    why text/border are derived from the surface band;
 *  - the emphasis bridge: why `neutral-emphasis` is the odd one in the matrix.
 *
 * Every swatch reads the REAL token (`rgb(var(--magma-*))`), so the page is live
 * and follows the root theme - flip it with the header switch.
 */
export default {
  title: 'Common tests / Semantic roles',
  parameters: {
    a11y: { test: 'error' },
    layout: 'fullscreen',
  },
};

// axe's `color-contrast` uses the WCAG2 ratio; this DS's contrast authority is
// APCA (A3 / #575), so WCAG2 false-flags the `subtle` / `disabled` roles and the
// soft tints these reference swatches show on purpose. Disable ONLY that rule;
// every other a11y rule stays gated at error.
const TOKEN_REF_A11Y = {
  a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
};

// -- token accessors -------------------------------------------------------

const magmaVar = (token: string): string => `rgb(var(--magma-${token}))`;
const surfaceVar = (role: string): string => magmaVar(`surface-${role}`);
const textVar = (role: string): string => magmaVar(`text-${role}`);
const borderVar = (role: string): string => magmaVar(`border-${role}`);
const hueVar = (hue: string, role: string): string => magmaVar(`${hue}-${role}`);

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

// -- theme switch (identical mechanism to the Semantic surfaces story) -----

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

const PageFrame = ({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children?: ReactNode;
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
      <ThemeSwitch />
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

// -- swatch ----------------------------------------------------------------

type SwatchKind = 'fill' | 'ink' | 'line' | 'on';

// A live preview of a token. `fill` = the color as a background; `ink` = an "Aa"
// sample in that color on the canvas; `line` = a 2px border of that color; `on`
// = an "Aa" in that color on its paired emphasis fill (`bg`).
const Swatch = ({
  token,
  kind = 'fill',
  bg,
}: {
  token: string;
  kind?: SwatchKind;
  bg?: string;
}) => {
  const value = magmaVar(token);
  const base = { width: '46px', height: '26px', flex: '0 0 auto' } as const;
  if (kind === 'ink') {
    return (
      <span
        class="inline-grid place-items-center rounded-sm"
        style={{
          ...base,
          background: surfaceVar('default'),
          color: value,
          border: `1px solid ${borderVar('muted')}`,
          fontWeight: '600',
        }}
      >
        Aa
      </span>
    );
  }
  if (kind === 'line') {
    return (
      <span
        class="inline-block rounded-sm"
        style={{ ...base, background: surfaceVar('default'), border: `2px solid ${value}` }}
      />
    );
  }
  if (kind === 'on') {
    return (
      <span
        class="inline-grid place-items-center rounded-sm"
        style={{ ...base, background: magmaVar(bg ?? token), color: value, fontWeight: '600' }}
      >
        Aa
      </span>
    );
  }
  return (
    <span
      class="inline-block rounded-sm"
      style={{ ...base, background: value, border: `1px solid ${borderVar('muted')}` }}
    />
  );
};

// -- role table ------------------------------------------------------------

interface RoleRow {
  token: string;
  role: string;
  use: string;
  src: string;
  kind?: SwatchKind;
  bg?: string;
}

const th = {
  padding: '9px 14px',
  textAlign: 'left' as const,
  fontSize: '0.68rem',
  letterSpacing: '0.07em',
  textTransform: 'uppercase' as const,
  fontWeight: '600',
};

const td = { padding: '11px 14px', textAlign: 'left' as const, verticalAlign: 'top' as const };

const RoleTable = ({ rows, kind }: { rows: RoleRow[]; kind: SwatchKind }) => (
  <div class="overflow-x-auto rounded-md" style={{ border: `1px solid ${borderVar('muted')}` }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
      <thead>
        <tr style={{ background: surfaceVar('muted') }}>
          <th scope="col" style={{ ...th, color: textVar('muted') }}>
            Token
          </th>
          <th scope="col" style={{ ...th, color: textVar('muted') }}>
            Preview
          </th>
          <th scope="col" style={{ ...th, color: textVar('muted') }}>
            Role
          </th>
          <th scope="col" style={{ ...th, color: textVar('muted') }}>
            Use
          </th>
          <th scope="col" style={{ ...th, color: textVar('muted') }}>
            Source primitive
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.token} style={{ borderTop: `1px solid ${borderVar('muted')}` }}>
            <td style={{ ...td, whiteSpace: 'nowrap' }}>
              <code style={{ fontFamily: MONO, fontSize: '0.82rem' }}>--magma-{row.token}</code>
            </td>
            <td style={td}>
              <Swatch token={row.token} kind={row.kind ?? kind} bg={row.bg} />
            </td>
            <td style={{ ...td, minWidth: '190px' }}>{row.role}</td>
            <td style={{ ...td, color: textVar('muted') }}>{row.use}</td>
            <td style={{ ...td, whiteSpace: 'nowrap' }}>
              <code style={{ fontFamily: MONO, fontSize: '0.76rem', color: textVar('subtle') }}>
                {row.src}
              </code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// -- data (mirrors css/semantic.css exactly, current names) ----------------

const SURFACE_ROWS: RoleRow[] = [
  {
    token: 'surface-sunken',
    role: 'recessed plane, below the canvas',
    use: 'wells, insets, code blocks, tracks',
    src: 'surface-neutral-sunken',
  },
  {
    token: 'surface-muted',
    role: 'same plane as the canvas, groups',
    use: 'zebra rows, subtle sections',
    src: 'surface-neutral-muted',
  },
  {
    token: 'surface-default',
    role: 'the canvas / page background',
    use: 'body, base plane',
    src: 'surface-neutral-default',
  },
  {
    token: 'surface-raised',
    role: 'lifted plane',
    use: 'cards, panels, sticky headers',
    src: 'surface-neutral-raised',
  },
  {
    token: 'surface-overlay',
    role: 'top plane',
    use: 'modal, dropdown, popover, tooltip',
    src: 'surface-neutral-overlay',
  },
];

const TEXT_ROWS: RoleRow[] = [
  {
    token: 'text-default',
    role: 'primary, highest contrast',
    use: 'body, primary data',
    src: 'text-neutral-default',
  },
  {
    token: 'text-muted',
    role: 'secondary but ESSENTIAL, stays legible',
    use: 'address, phone',
    src: 'text-neutral-muted',
  },
  {
    token: 'text-subtle',
    role: 'non-essential',
    use: 'captions, hints, units',
    src: 'text-neutral-subtle',
  },
  {
    token: 'text-disabled',
    role: 'inactive, the lowest',
    use: 'disabled controls',
    src: 'text-neutral-disabled',
  },
  {
    token: 'text-on-emphasis',
    role: 'text on a solid neutral fill',
    use: 'label on the dark/light chip',
    src: 'tone-neutral-seed',
    kind: 'on',
    bg: 'neutral-emphasis',
  },
];

const BORDER_ROWS: RoleRow[] = [
  {
    token: 'border-muted',
    role: 'softest, decorative (no 3:1 floor)',
    use: 'grids, dividers, cell borders',
    src: 'border-neutral-muted',
  },
  {
    token: 'border-default',
    role: 'functional outline',
    use: 'inputs, buttons',
    src: 'border-neutral-default',
  },
  {
    token: 'border-strong',
    role: 'assertive / state',
    use: 'selected, error',
    src: 'border-neutral-strong',
  },
  {
    token: 'border-focus',
    role: 'the focus ring (an accent, not a neutral level)',
    use: ':focus-visible',
    src: 'variant-primary',
  },
];

// The hue quintet. Colored families carry all five; `neutral` is partial - its
// background need is already covered by the surface ladder, so it has no
// `-surface` step (shown as a dash).
const HUES: { key: string; label: string; family: string; partial?: boolean }[] = [
  { key: 'accent', label: 'Accent', family: 'variant-primary' },
  { key: 'info', label: 'Info', family: 'status-info' },
  { key: 'success', label: 'Success', family: 'status-success' },
  { key: 'warning', label: 'Warning', family: 'status-warning' },
  { key: 'danger', label: 'Danger', family: 'status-error' },
  { key: 'neutral', label: 'Neutral', family: 'tone-neutral', partial: true },
];

const HUE_ROLES: { role: string; kind: SwatchKind }[] = [
  { role: 'surface', kind: 'fill' },
  { role: 'fg', kind: 'ink' },
  { role: 'border', kind: 'line' },
  { role: 'emphasis', kind: 'fill' },
  { role: 'on-emphasis', kind: 'on' },
];

const HueCell = ({
  hue,
  role,
  kind,
}: {
  hue: { key: string; partial?: boolean };
  role: string;
  kind: SwatchKind;
}) => {
  if (hue.partial && role === 'surface') {
    return <span style={{ color: textVar('subtle') }}>-</span>;
  }
  return <Swatch token={`${hue.key}-${role}`} kind={kind} bg={`${hue.key}-emphasis`} />;
};

const HueMatrix = () => (
  <div class="overflow-x-auto rounded-md" style={{ border: `1px solid ${borderVar('muted')}` }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
      <thead>
        <tr style={{ background: surfaceVar('muted') }}>
          <th scope="col" style={{ ...th, color: textVar('muted') }}>
            Family
          </th>
          {HUE_ROLES.map((role) => (
            <th key={role.role} scope="col" style={{ ...th, color: textVar('muted') }}>
              {role.role}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {HUES.map((hue) => (
          <tr key={hue.key} style={{ borderTop: `1px solid ${borderVar('muted')}` }}>
            <th scope="row" style={{ ...td, whiteSpace: 'nowrap' }}>
              <div class="grid gap-25">
                <span style={{ fontWeight: '500' }}>{hue.label}</span>
                <code style={{ fontFamily: MONO, fontSize: '0.72rem', color: textVar('subtle') }}>
                  {hue.family}
                </code>
              </div>
            </th>
            {HUE_ROLES.map((role) => (
              <td key={role.role} style={td}>
                <HueCell hue={hue} role={role.role} kind={role.kind} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// -- grammar, foundation, guide -------------------------------------------

const Chip = ({ label, variant }: { label: string; variant: 'property' | 'role' }) =>
  variant === 'property' ? (
    <span
      class="inline-flex items-center rounded-md px-300 py-100"
      style={{
        background: hueVar('neutral', 'emphasis'),
        color: textVar('on-emphasis'),
        fontFamily: MONO,
      }}
    >
      {label}
    </span>
  ) : (
    <span
      class="inline-flex items-center rounded-md px-300 py-100"
      style={{
        color: hueVar('accent', 'fg'),
        border: `1.5px solid ${hueVar('accent', 'emphasis')}`,
        fontFamily: MONO,
      }}
    >
      {label}
    </span>
  );

const Callout = ({ title, children }: { title: string; children?: ReactNode }) => (
  <div
    class="grid gap-200 p-500 rounded-md"
    style={{
      background: surfaceVar('raised'),
      borderLeft: `3px solid ${hueVar('accent', 'emphasis')}`,
      border: `1px solid ${borderVar('muted')}`,
    }}
  >
    <mds-text typography="h6" tag="h4">
      {title}
    </mds-text>
    {children}
  </div>
);

const Grammar = () => (
  <Section
    title="1. The grammar"
    hint="The prefix says WHAT you are coloring; the suffix says WHICH variant along that property's own axis. Nothing else to memorize."
  >
    <div
      class="grid gap-400 p-500 rounded-md"
      style={{ background: surfaceVar('raised'), border: `1px solid ${borderVar('muted')}` }}
    >
      <div
        class="flex flex-wrap items-center gap-100"
        style={{ fontFamily: MONO, fontSize: '1.15rem' }}
      >
        <span style={{ color: textVar('subtle') }}>--magma-</span>
        <Chip label="property" variant="property" />
        <span style={{ color: textVar('subtle') }}>-</span>
        <Chip label="role" variant="role" />
      </div>
      <div class="flex flex-wrap gap-x-800 gap-y-100">
        <mds-text typography="detail">
          <b>property</b> - the kind of thing: surface / text / border / &lt;hue&gt;
        </mds-text>
        <mds-text typography="detail">
          <b>role</b> - the variant along that property's axis
        </mds-text>
      </div>
    </div>

    <Callout title="The part that trips people up: the suffix is RELATIVE">
      <mds-text typography="detail" style={{ color: textVar('muted') }}>
        The same word recurs across properties, but it is not an absolute color - it means "the same
        position on THAT property's axis".
      </mds-text>
      <ul
        class="grid gap-100"
        style={{ margin: '0', paddingLeft: '18px', color: textVar('muted') }}
      >
        <li>
          <code style={{ fontFamily: MONO }}>-muted</code> = the quiet variant -&gt;{' '}
          <code style={{ fontFamily: MONO }}>surface-muted</code> is a grouping background,{' '}
          <code style={{ fontFamily: MONO }}>text-muted</code> is secondary text,{' '}
          <code style={{ fontFamily: MONO }}>border-muted</code> is the softest line.
        </li>
        <li>
          <code style={{ fontFamily: MONO }}>-default</code> = the baseline -&gt;{' '}
          <code style={{ fontFamily: MONO }}>surface-default</code> is the canvas,{' '}
          <code style={{ fontFamily: MONO }}>text-default</code> is body,{' '}
          <code style={{ fontFamily: MONO }}>border-default</code> is the standard outline.
        </li>
      </ul>
    </Callout>
  </Section>
);

const LadderBars = () => (
  <div class="grid gap-200">
    {SURFACE_ROWS.map((surface) => (
      <div
        key={surface.token}
        class="flex flex-wrap gap-x-600 gap-y-100 items-baseline justify-between p-400 rounded-md"
        style={{ background: magmaVar(surface.token), border: `1px solid ${borderVar('muted')}` }}
      >
        <code style={{ fontFamily: MONO }}>--magma-{surface.token}</code>
        <span style={{ color: textVar('muted') }}>{surface.use}</span>
      </div>
    ))}
  </div>
);

const Foundation = () => (
  <Section
    title="2. From your lv draft to the roles"
    hint="Your draft had three stacked levels plus a foreground. The SPEC kept the idea and changed two things: numbers became role names, and the source moved to a dedicated --surface-* scale."
  >
    <pre
      class="overflow-x-auto rounded-md"
      style={{
        background: surfaceVar('sunken'),
        border: `1px solid ${borderVar('muted')}`,
        padding: '16px 18px',
        margin: '0',
        fontFamily: MONO,
        fontSize: '0.82rem',
        lineHeight: '1.9',
        color: textVar('default'),
      }}
    >
      <span style={{ color: textVar('subtle') }}>
        /* the original draft: styles/draft/theme.css */
      </span>
      {'\n'}--tint-base-lv1: var(--tone-neutral);{' '}
      <span style={{ color: textVar('subtle') }}>{'    '}/* the base = the canvas */</span>
      {'\n'}--tint-base-lv2: var(--tone-neutral-10);
      {'\n'}--tint-base-lv3: var(--tone-neutral-09);
      {'\n'}--tint-base-content: var(--tone-neutral-02);{' '}
      <span style={{ color: textVar('subtle') }}>/* the foreground */</span>
    </pre>
    <ul class="grid gap-100" style={{ margin: '0', paddingLeft: '18px' }}>
      <li>
        <code style={{ fontFamily: MONO }}>lv1 (base)</code> -&gt;{' '}
        <code style={{ fontFamily: MONO }}>surface-default</code>{' '}
        <span style={{ color: textVar('muted') }}>the canvas</span>
      </li>
      <li>
        <code style={{ fontFamily: MONO }}>lv2, lv3 (lifted)</code> -&gt;{' '}
        <code style={{ fontFamily: MONO }}>surface-raised, surface-overlay</code>
      </li>
      <li>
        <code style={{ fontFamily: MONO }}>(new, below the base)</code> -&gt;{' '}
        <code style={{ fontFamily: MONO }}>surface-sunken</code>
      </li>
      <li>
        <code style={{ fontFamily: MONO }}>(new, same plane)</code> -&gt;{' '}
        <code style={{ fontFamily: MONO }}>surface-muted</code>{' '}
        <span style={{ color: textVar('muted') }}>grouping: zebra, subtle sections</span>
      </li>
      <li>
        <code style={{ fontFamily: MONO }}>tint-base-content</code> -&gt;{' '}
        <code style={{ fontFamily: MONO }}>text-*</code>{' '}
        <span style={{ color: textVar('muted') }}>the foreground, now split by prominence</span>
      </li>
    </ul>
    <div class="grid gap-100">
      <mds-text typography="h6" tag="h4">
        The ladder, live
      </mds-text>
      <LadderBars />
    </div>
  </Section>
);

const GUIDE: { q: string; a: ReactNode }[] = [
  {
    q: 'A neutral background',
    a: (
      <span>
        <code style={{ fontFamily: MONO }}>surface-*</code> by elevation
      </span>
    ),
  },
  {
    q: 'A colored status background',
    a: (
      <span>
        <code style={{ fontFamily: MONO }}>&lt;hue&gt;-surface</code> (soft) or{' '}
        <code style={{ fontFamily: MONO }}>&lt;hue&gt;-emphasis</code> (solid)
      </span>
    ),
  },
  {
    q: 'Neutral text / icon',
    a: (
      <span>
        <code style={{ fontFamily: MONO }}>text-*</code> by prominence
      </span>
    ),
  },
  {
    q: 'Status text',
    a: (
      <span>
        <code style={{ fontFamily: MONO }}>&lt;hue&gt;-fg</code> (on a tint) or{' '}
        <code style={{ fontFamily: MONO }}>&lt;hue&gt;-on-emphasis</code> (on a solid)
      </span>
    ),
  },
  {
    q: 'A border',
    a: (
      <span>
        <code style={{ fontFamily: MONO }}>border-*</code> by prominence;{' '}
        <code style={{ fontFamily: MONO }}>border-focus</code> for focus
      </span>
    ),
  },
];

const Guide = () => (
  <Section title="7. Quick guide - which token" hint="Start from what you are coloring.">
    <div class="grid gap-100">
      {GUIDE.map((row) => (
        <div
          key={row.q}
          class="grid gap-200 desktop:grid-cols-2 p-300 rounded-md"
          style={{ background: surfaceVar('raised'), border: `1px solid ${borderVar('muted')}` }}
        >
          <span style={{ fontWeight: '500' }}>{row.q}</span>
          <span style={{ color: textVar('muted') }}>{row.a}</span>
        </div>
      ))}
    </div>
  </Section>
);

// =========================================================================
// The reference
// =========================================================================

export const Reference = {
  parameters: TOKEN_REF_A11Y,
  render: () => (
    <PageFrame
      title="Semantic token roles"
      lead="How to read a --magma-* token, and what each one is for. Every swatch reads the real token, so it follows the theme - flip it with the switch. Names are the current ones."
    >
      <Grammar />

      <Foundation />

      <Section
        title="3. surface - the backgrounds"
        hint="The plane property. Axis: elevation, plus muted as same-plane grouping. This is the neutral foundation."
      >
        <RoleTable rows={SURFACE_ROWS} kind="fill" />
      </Section>

      <Section
        title="4. text - the foreground"
        hint="What sits on a surface. Axis: prominence. One set, chosen by APCA contrast to stay legible on EVERY surface (A7) - so it varies by prominence, not by level."
      >
        <RoleTable rows={TEXT_ROWS} kind="ink" />
      </Section>

      <Section
        title="5. border - the lines"
        hint="Axis: prominence. Placed just outside the surface band, so one value per mode reads against every surface level."
      >
        <RoleTable rows={BORDER_ROWS} kind="line" />
      </Section>

      <Section
        title="6. <hue> - the colored families"
        hint="Each status / accent color carries the same quintet. Colored families carry all five; neutral is partial (no -surface: its background is the surface ladder)."
      >
        <HueMatrix />
        <mds-text typography="detail" style={{ color: textVar('subtle') }}>
          Sources: surface = &lt;family&gt;-09, fg = -05, border = -06, emphasis = -04, on-emphasis
          = tone-neutral-seed. Neutral: fg = tone-neutral-03, border = -06, emphasis = -02.
        </mds-text>
        <Callout title="The bridge: -emphasis (hue) and neutral-emphasis">
          <mds-text typography="detail" style={{ color: textVar('muted') }}>
            Every color has TWO backgrounds:{' '}
            <code style={{ fontFamily: MONO }}>&lt;hue&gt;-surface</code> is the soft tint (quiet),{' '}
            <code style={{ fontFamily: MONO }}>&lt;hue&gt;-emphasis</code> is the solid saturated
            fill (loud).
          </mds-text>
          <mds-text typography="detail" style={{ color: textVar('muted') }}>
            For neutral, the soft tint is already the surface ladder (muted / default). The solid
            neutral fill is <code style={{ fontFamily: MONO }}>neutral-emphasis</code> - the
            high-contrast chip that flips with the mode (dark on a light UI, light on a dark UI);
            its text is <code style={{ fontFamily: MONO }}>neutral-on-emphasis</code>. This is the
            one seed named entry left in the matrix - the open naming question.
          </mds-text>
        </Callout>
      </Section>

      <Guide />

      <Section title="A note on tint-*" hint="Not a role you consume - the theming lever.">
        <mds-text style={{ color: textVar('muted') }}>
          <code style={{ fontFamily: MONO }}>--magma-tint-*</code> is the indirection behind{' '}
          <code style={{ fontFamily: MONO }}>surface-*</code>,{' '}
          <code style={{ fontFamily: MONO }}>border-*</code> and{' '}
          <code style={{ fontFamily: MONO }}>text-*</code>: a named theme repoints the active tint
          onto another family with one swap, and background AND foreground retint together (spec 8).
          It is internal (not bridged to Tailwind) - style components against surface / text /
          border, never against tint directly.
        </mds-text>
      </Section>
    </PageFrame>
  ),
};
