import { h } from '@stencil/core';
import { useEffect, useState, type ReactNode } from 'react';

/**
 * High contrast - the `pref-contrast-more` promotion layer (issue #612, spec 9.3).
 *
 * A test page for the GLOBAL contrast layer: under `prefers-contrast: more` the
 * text and border roles are promoted to a STRONGER step of the SAME family by
 * repointing `--magma-tint-*` in `css/semantic.css`, so the whole scaffolding
 * gains contrast upstream and no component sheet is involved.
 *
 * What this page is for:
 *  - SEE the promotion: every specimen reads the real `rgb(var(--magma-*))`, so
 *    flipping contrast repaints the page live;
 *  - PROVE it: the promotions table probes the computed value of each role with
 *    and without the class, so a role that does not actually move is visible as
 *    a no-op instead of being assumed to work;
 *  - COVER the named themes: a theme retints the same tint pointers, so it needs
 *    its OWN promotion block - the theme switch here is what exercises it.
 *
 * The switches write exactly what the real writers write (the `mds-pref-*`
 * controllers and the Storybook a11y panel): `pref-contrast-*` / `pref-theme-*`
 * classes and `data-theme-name` on `<html>`. The Contrast control in the
 * Storybook toolbar panel drives the same class and stays in sync with this page.
 */
export default {
  title: 'Common tests / Semantic contrast',
  parameters: {
    a11y: { test: 'error' },
    layout: 'fullscreen',
  },
};

// axe's `color-contrast` uses the WCAG2 ratio; this DS's contrast authority is
// APCA (A3 / #575). The point of this page is to SHOW the low-contrast base roles
// next to their promoted counterparts, so WCAG2 would false-flag the specimens by
// design. Disable ONLY that rule; every other a11y rule stays gated at error.
const CONTRAST_REF_A11Y = {
  a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
};

// -- token accessors -------------------------------------------------------

const magmaVar = (token: string): string => `rgb(var(--magma-${token}))`;
const surfaceVar = (role: string): string => magmaVar(`surface-${role}`);
const textVar = (role: string): string => magmaVar(`text-${role}`);
const borderVar = (role: string): string => magmaVar(`border-${role}`);

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

// -- the promotion contract (mirrors semantic.config.ts `contrast.more`) ----

type Promotion = { token: string; borrows: string | null; note?: string };

const TEXT_ROLES: Promotion[] = [
  { token: 'text-default', borrows: null, note: 'already the ceiling' },
  { token: 'text-muted', borrows: 'text-default' },
  { token: 'text-subtle', borrows: 'text-muted' },
  { token: 'text-disabled', borrows: null, note: 'stays faint on purpose (WCAG-exempt)' },
];

const BORDER_ROLES: Promotion[] = [
  { token: 'border-muted', borrows: 'border-default' },
  { token: 'border-default', borrows: 'border-strong' },
  { token: 'border-strong', borrows: null, note: 'already the ceiling' },
];

// A colored hue promotes its OWN roles off the same table (#621, spec 6.4 + 9.3).
// This is the path a tint pointer does not cover: a hue is not retinted by a theme,
// so its roles are stated directly. `success` stands in for all four hues; the last
// two rows are the controls - a shortcut must follow its role, a tint level must not
// move at all (it is a background, and promoting it would repaint the component).
const HUE_ROLES: Promotion[] = [
  { token: 'success-text-muted', borrows: 'success-text-default' },
  { token: 'success-text-subtle', borrows: 'success-text-muted' },
  { token: 'success-border-default', borrows: 'success-border-strong' },
  { token: 'success-border', borrows: 'success-border-strong', note: 'shortcut: follows its role' },
  {
    token: 'success-surface-strong',
    borrows: null,
    note: 'a tint level is a background: never promoted',
  },
];

const PROBED = [...TEXT_ROLES, ...BORDER_ROLES, ...HUE_ROLES].map((role) => role.token);

// -- <html> state: the same contract the real writers use ------------------

const CONTRAST_VALUES = ['no-preference', 'system', 'more'];
const THEME_MODES = ['light', 'dark'];
const THEME_NAMES = ['default', 'cool', 'warm'];

const readClassValue = (prefix: string, values: string[], fallback: string): string =>
  values.find((value) => document.documentElement.classList.contains(`${prefix}${value}`)) ??
  fallback;

const applyClassValue = (prefix: string, values: string[], next: string): void => {
  const { classList } = document.documentElement;
  values.forEach((value) => classList.remove(`${prefix}${value}`));
  classList.add(`${prefix}${next}`);
};

const readThemeName = (): string =>
  document.documentElement.getAttribute('data-theme-name') ?? 'default';

const applyThemeName = (next: string): void => {
  const root = document.documentElement;
  // `default` IS the base tint and emits no override block, so the attribute is
  // removed rather than set - exactly what a consumer would do.
  if (next === 'default') {
    root.removeAttribute('data-theme-name');
    return;
  }
  root.setAttribute('data-theme-name', next);
};

/**
 * Resolve each role twice - with and without `pref-contrast-more` - by toggling
 * the class on `<html>` and reading the computed custom property in between.
 * The original class state is restored before the browser can paint, so the
 * probe is invisible.
 *
 * This measures the EXPLICIT path (the class). The `@media (prefers-contrast:
 * more)` path targeting `pref-contrast-system` and a page with no controller
 * resolves to the same values; it just cannot be forced from script.
 */
const probePromotions = (): Record<string, { base: string; more: string }> => {
  const root = document.documentElement;
  const restore = CONTRAST_VALUES.filter((value) =>
    root.classList.contains(`pref-contrast-${value}`),
  );
  const readAll = (): Record<string, string> => {
    const computed = getComputedStyle(root);
    return Object.fromEntries(
      PROBED.map((token) => [token, computed.getPropertyValue(`--magma-${token}`).trim()]),
    );
  };

  root.classList.remove('pref-contrast-more');
  const base = readAll();
  root.classList.add('pref-contrast-more');
  const more = readAll();

  root.classList.remove('pref-contrast-more');
  restore.forEach((value) => root.classList.add(`pref-contrast-${value}`));

  return Object.fromEntries(
    PROBED.map((token) => [token, { base: base[token], more: more[token] }]),
  );
};

// -- controls --------------------------------------------------------------

const Choice = ({
  label,
  values,
  active,
  onPick,
}: {
  label: string;
  values: string[];
  active: string;
  onPick: (value: string) => void;
}) => (
  <div class="flex gap-100 items-center">
    <mds-text typography="label" style={{ color: textVar('muted') }}>
      {label}
    </mds-text>
    {values.map((value) => (
      <mds-button
        key={value}
        variant={value === active ? 'primary' : 'dark'}
        tone={value === active ? 'strong' : 'outline'}
        label={value}
        onClick={() => onPick(value)}
      />
    ))}
  </div>
);

const Controls = ({ onChange }: { onChange: () => void }) => {
  const [contrast, setContrast] = useState<string>(() =>
    readClassValue('pref-contrast-', CONTRAST_VALUES, 'no-preference'),
  );
  const [mode, setMode] = useState<string>(() =>
    readClassValue('pref-theme-', THEME_MODES, 'light'),
  );
  const [themeName, setThemeName] = useState<string>(readThemeName);

  return (
    <div class="grid gap-200">
      <Choice
        label="Contrast"
        values={CONTRAST_VALUES}
        active={contrast}
        onPick={(next) => {
          applyClassValue('pref-contrast-', CONTRAST_VALUES, next);
          setContrast(next);
          onChange();
        }}
      />
      <Choice
        label="Mode"
        values={THEME_MODES}
        active={mode}
        onPick={(next) => {
          applyClassValue('pref-theme-', THEME_MODES, next);
          setMode(next);
          onChange();
        }}
      />
      <Choice
        label="Theme"
        values={THEME_NAMES}
        active={themeName}
        onPick={(next) => {
          applyThemeName(next);
          setThemeName(next);
          onChange();
        }}
      />
    </div>
  );
};

// -- layout ----------------------------------------------------------------

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

const Callout = ({ children }: { children?: ReactNode }) => (
  <div
    class="grid gap-100 rounded-md p-400"
    style={{ background: surfaceVar('muted'), border: `1px solid ${borderVar('muted')}` }}
  >
    {children}
  </div>
);

const Code = ({ children }: { children?: ReactNode }) => (
  <code style={{ fontFamily: MONO }}>{children}</code>
);

// -- promotions table ------------------------------------------------------

const Chip = ({ label, kind }: { label: string; kind: 'moved' | 'same' }) => (
  <span
    class="inline-block rounded-sm px-100 text-nowrap"
    style={{
      background: kind === 'moved' ? magmaVar('success-surface') : surfaceVar('sunken'),
      color: kind === 'moved' ? magmaVar('success-fg') : textVar('muted'),
      border: `1px solid ${kind === 'moved' ? magmaVar('success-border') : borderVar('muted')}`,
      fontFamily: MONO,
      fontSize: '0.75rem',
    }}
  >
    {label}
  </span>
);

const ValueCell = ({ channels }: { channels: string }) => (
  <div class="flex gap-100 items-center">
    <span
      class="inline-block rounded-sm"
      style={{
        width: '20px',
        height: '20px',
        flex: '0 0 auto',
        background: `rgb(${channels})`,
        border: `1px solid ${borderVar('muted')}`,
      }}
    />
    <Code>{channels || '-'}</Code>
  </div>
);

const PromotionRow = ({
  role,
  probe,
}: {
  // `key` is declared because these render in a list: Stencil's `h` factory types
  // props exactly, so React's list key has to be part of the prop shape.
  key?: string;
  role: Promotion;
  probe: { base: string; more: string };
}) => {
  const moved = probe.base !== probe.more;
  return (
    <tr style={{ borderTop: `1px solid ${borderVar('muted')}` }}>
      <td class="p-200">
        <Code>--magma-{role.token}</Code>
      </td>
      <td class="p-200">
        {role.borrows ? (
          <Code>-&gt; {role.borrows.replace(/^.*?(text|border)-/, '')}</Code>
        ) : (
          <span style={{ color: textVar('subtle') }}>not promoted</span>
        )}
      </td>
      <td class="p-200">
        <ValueCell channels={probe.base} />
      </td>
      <td class="p-200">
        <ValueCell channels={probe.more} />
      </td>
      <td class="p-200">
        {role.borrows === null ? (
          <Chip label="unchanged by design" kind="same" />
        ) : moved ? (
          <Chip label="promoted" kind="moved" />
        ) : (
          <Chip label="NO-OP (same step)" kind="same" />
        )}
      </td>
      <td class="p-200" style={{ color: textVar('subtle') }}>
        {role.note ?? ''}
      </td>
    </tr>
  );
};

const PromotionsTable = ({
  roles,
  probes,
}: {
  roles: Promotion[];
  probes: Record<string, { base: string; more: string }>;
}) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
      <thead>
        <tr style={{ color: textVar('muted') }}>
          <th class="p-200">role</th>
          <th class="p-200">borrows</th>
          <th class="p-200">base</th>
          <th class="p-200">contrast-more</th>
          <th class="p-200">result</th>
          <th class="p-200">note</th>
        </tr>
      </thead>
      <tbody>
        {roles.map((role) => (
          <PromotionRow key={role.token} role={role} probe={probes[role.token]} />
        ))}
      </tbody>
    </table>
  </div>
);

// -- specimens -------------------------------------------------------------

const TextSpecimen = ({ surface }: { key?: string; surface: string }) => (
  <div
    class="grid gap-100 rounded-md p-400"
    style={{ background: surfaceVar(surface), border: `1px solid ${borderVar('muted')}` }}
  >
    <mds-text typography="label" style={{ color: textVar('subtle') }}>
      surface-{surface}
    </mds-text>
    <mds-text style={{ color: textVar('default') }}>default - body copy and primary data</mds-text>
    <mds-text style={{ color: textVar('muted') }}>
      muted - secondary essential text (address, phone)
    </mds-text>
    <mds-text style={{ color: textVar('subtle') }}>
      subtle - non-essential only (caption, unit, hint)
    </mds-text>
    <mds-text style={{ color: textVar('disabled') }}>disabled - non-essential</mds-text>
  </div>
);

const BorderSpecimen = () => (
  <div class="grid gap-300">
    <div
      class="rounded-md"
      style={{ background: surfaceVar('raised'), border: `1px solid ${borderVar('default')}` }}
    >
      {['Row one', 'Row two', 'Row three'].map((row, index) => (
        <div
          key={row}
          class="flex justify-between p-300"
          style={{ borderTop: index === 0 ? 'none' : `1px solid ${borderVar('muted')}` }}
        >
          <mds-text style={{ color: textVar('default') }}>{row}</mds-text>
          <mds-text style={{ color: textVar('subtle') }}>decorative border-muted</mds-text>
        </div>
      ))}
    </div>
    <div class="flex flex-wrap gap-300">
      {['muted', 'default', 'strong'].map((role) => (
        <div
          key={role}
          class="rounded-md p-300"
          style={{ background: surfaceVar('raised'), border: `2px solid ${borderVar(role)}` }}
        >
          <Code>border-{role}</Code>
        </div>
      ))}
    </div>
  </div>
);

/**
 * A status component dressed ENTIRELY from one hue: two tint levels (the panel and
 * the chip behind the icon), two text prominences and a border. This is the shape
 * `mds-banner` has today with hand-picked ramp steps, rebuilt on the roles - the
 * component migration itself is #615.
 *
 * The chip is the pair worth watching: the icon on it measures 74.7 Lc through
 * `text-default`, where the hand-picked step it replaces measured 40.7.
 */
const HueSpecimen = ({ hue }: { key?: string; hue: string }) => {
  const role = (name: string): string => magmaVar(`${hue}-${name}`);
  return (
    <div
      class="rounded-md p-400 flex gap-300 items-start"
      style={{
        background: role('surface-subtle'),
        border: `1px solid ${role('border-default')}`,
      }}
    >
      <div class="rounded-md p-200 flex" style={{ background: role('surface-strong') }}>
        <mds-icon name="mdi/crown" style={{ color: role('text-default') }} />
      </div>
      <div class="grid gap-100">
        <mds-text typography="label" style={{ color: role('text-default') }}>
          {hue} - headline on surface-subtle
        </mds-text>
        <mds-text typography="detail" style={{ color: role('text-muted') }}>
          body copy through text-muted, the role a banner reads for its message
        </mds-text>
        <mds-text typography="detail" style={{ color: role('text-subtle') }}>
          subtle - non-essential note
        </mds-text>
      </div>
    </div>
  );
};

// -- page ------------------------------------------------------------------

const ContrastPage = () => {
  // Any <html> change repaints the specimens on its own (they read live vars);
  // the probe values are JS-read, so they are recomputed on each control change.
  const [tick, setTick] = useState(0);
  const [probes, setProbes] = useState<Record<string, { base: string; more: string }>>({});
  useEffect(() => setProbes(probePromotions()), [tick]);

  const ready = Object.keys(probes).length > 0;

  return (
    <div
      class="grid gap-800 p-800 min-h-screen"
      style={{ background: surfaceVar('default'), color: textVar('default') }}
    >
      <header class="grid gap-300">
        <div class="grid gap-100 max-w-screen-tablet">
          <mds-text typography="h2">High contrast (pref-contrast-more)</mds-text>
          <mds-text style={{ color: textVar('muted') }}>
            Under <Code>prefers-contrast: more</Code> each text and border role borrows a STRONGER
            step of the SAME family. The promotion happens once, in the semantic layer, by
            repointing <Code>--magma-tint-*</Code> - no per-component sheet. Flip the switches: the
            specimens read the real tokens and repaint live.
          </mds-text>
        </div>
        <Controls onChange={() => setTick((value) => value + 1)} />
      </header>

      <Section
        title="What actually moves"
        hint="Each role probed twice - with and without the class - so a promotion that does not move is visible instead of assumed."
      >
        {ready && (
          <div class="grid gap-400">
            <PromotionsTable roles={TEXT_ROLES} probes={probes} />
            <PromotionsTable roles={BORDER_ROLES} probes={probes} />
            <PromotionsTable roles={HUE_ROLES} probes={probes} />
          </div>
        )}
        <Callout>
          <mds-text typography="detail" style={{ color: textVar('muted') }}>
            <strong>text-subtle is a NO-OP today.</strong> It borrows the <Code>muted</Code> step,
            which in the current default ramp resolves to the same color as <Code>subtle</Code>{' '}
            itself. The net effect is still right: <Code>muted</Code> rises to <Code>default</Code>,
            so the muted/subtle hierarchy the base ramp collapses is RESTORED. Lower{' '}
            <Code>subtle</Code> in the ramp and the promotion starts biting with no change to this
            layer.
          </mds-text>
          <mds-text typography="detail" style={{ color: textVar('muted') }}>
            <Code>text-default</Code> and <Code>border-strong</Code> are already the ceiling, and{' '}
            <Code>text-disabled</Code> stays faint on purpose - disabled controls are WCAG-exempt
            and raising them would read as enabled.
          </mds-text>
        </Callout>
      </Section>

      <Section
        title="Text on surfaces"
        hint="The same four roles across the elevation ladder. Watch muted close the gap on default."
      >
        <div class="grid gap-300 grid-cols-1 tablet:grid-cols-2">
          {['sunken', 'default', 'raised', 'overlay'].map((surface) => (
            <TextSpecimen key={surface} surface={surface} />
          ))}
        </div>
      </Section>

      <Section
        title="Borders"
        hint="Decorative separators (border-muted) and container edges (border-default) both shift one step toward strong."
      >
        <BorderSpecimen />
      </Section>

      <Section
        title="Status hues on their own tint"
        hint="Each hue publishes the same ladders on its own family (#621), so a colored component needs no hand-picked ramp step - and gains contrast from the same table."
      >
        <div class="grid gap-300 grid-cols-1 tablet:grid-cols-2">
          {['info', 'success', 'warning', 'danger'].map((hue) => (
            <HueSpecimen key={hue} hue={hue} />
          ))}
        </div>
        <Callout>
          <mds-text typography="detail" style={{ color: textVar('muted') }}>
            The tint levels (<Code>surface-subtle</Code> / <Code>-default</Code> /{' '}
            <Code>-strong</Code>) NAME ramp steps instead of resolving through the generated surface
            scale, and that is not a shortcut: a tinted chip moves toward the ink in BOTH modes,
            while the elevation ladder rises toward white in light and toward the ink in dark. No
            single elevation role can be it - flip <strong>Mode</strong> and watch the chip stay on
            the ink side either way.
          </mds-text>
        </Callout>
      </Section>

      <Section
        title="Named themes"
        hint="A theme retints the same tint pointers, so it carries its own promotion block."
      >
        <Callout>
          <mds-text typography="detail" style={{ color: textVar('muted') }}>
            Switch <strong>Theme</strong> to <Code>cool</Code> or <Code>warm</Code> with contrast on{' '}
            <Code>more</Code>: the promotion must survive, and in the THEME family (porcelain /
            bisque), not the base neutral. This is the case worth watching, because{' '}
            <Code>:root[data-theme-name=&apos;cool&apos;]</Code> and{' '}
            <Code>:root.pref-contrast-more</Code> carry the same specificity - if the theme block
            were not scoped to the theme, which one wins would depend on the order{' '}
            <Code>semantic.css</Code> and <Code>themes.css</Code> happen to be loaded in. The
            generator emits <Code>:root[data-theme-name=&apos;cool&apos;].pref-contrast-more</Code>{' '}
            for exactly this reason.
          </mds-text>
        </Callout>
      </Section>

      <Section
        title="How the layer is selected"
        hint="Two blocks per scope, one per source of truth."
      >
        <Callout>
          <mds-text typography="detail" style={{ color: textVar('muted') }}>
            <Code>:root.pref-contrast-more</Code> is the explicit choice, published by{' '}
            <Code>mds-pref-contrast</Code> (and by the Storybook a11y panel, which writes the same
            class - the Contrast control there drives this page too).
          </mds-text>
          <mds-text typography="detail" style={{ color: textVar('muted') }}>
            <Code>@media (prefers-contrast: more)</Code> then covers{' '}
            <Code>:root.pref-contrast-system</Code> and a page with no controller at all (
            <Code>:root:not([data-magma-pref])</Code>). The <Code>system</Code> button above only
            shows a change when the OS itself asks for more contrast. An explicit{' '}
            <Code>no-preference</Code> matches neither block, so opting out keeps the base steps.
          </mds-text>
        </Callout>
      </Section>
    </div>
  );
};

export const Contrast = {
  parameters: CONTRAST_REF_A11Y,
  render: () => <ContrastPage />,
};
