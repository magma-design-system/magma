import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
import { iconsDictionary } from '@type/icon';
import { themeVariantDictionary } from '@type/variant';
import { toneMinimalBoxVariantDictionary } from '@type/tone';
import { bannerTypographyDictionary } from '../meta/dictionary';

export default {
  title: 'UI / Feedback / Banner',
  id: 'ui-banner',
  argTypes: {
    'hide-cockade': {
      type: { name: 'boolean' },
      description: 'Hides the decoration around the banner icon',
    },
    dismissible: {
      type: { name: 'boolean' },
      description: 'Shows a close button that dismisses the banner',
    },
    headline: {
      type: { name: 'string' },
      description: 'The title on the top of the banner',
    },
    icon: {
      type: { name: 'string', required: true },
      description:
        'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    typography: {
      type: { name: 'string' },
      description:
        'The style of the headline. Left out, it follows the place: h6 in the page, h5 as the window of a dialog',
      options: bannerTypographyDictionary,
      control: { type: 'select' },
    },
    tone: {
      type: { name: 'string' },
      description: 'Sets the tone of the color variant',
      options: toneMinimalBoxVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Sets the theme variant colors',
      options: themeVariantDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <mds-banner {...args}>
    <mds-text typography="detail">
      Questa è una finestra banner, serve a informare gli utenti su uno stato iniziale o sul fatto
      che è cambiato.
    </mds-text>
  </mds-banner>
);

const TemplateActions = (args) => (
  <mds-banner {...args}>
    <mds-text typography="detail">
      Pare che la licenza di questo servizio sia scaduta, il servizio non smetterà di funzionare ma
      non potrai più utilizzare le <a href="#">funzioni premium</a>.
    </mds-text>
    <mds-button slot="action" variant={args.variant} tone="outline">
      Annulla
    </mds-button>
    <mds-button slot="action" variant={args.variant}>
      Rinnova abbonamento
    </mds-button>
  </mds-banner>
);

const TemplateVariantDefault = (args) => (
  <mds-banner {...args}>
    <mds-text typography="detail">
      Il tuo account è stato aggiornato alla versione PRO, ora puoi utilizzare le notifiche su
      aggiornamenti di norme di legge e la consultazione dei volumi correlati.
    </mds-text>
    <mds-button slot="action" variant={args.variant} tone="outline">
      Cancel
    </mds-button>
    <mds-button slot="action" variant={args.variant} tone={args.tone}>
      Confirm
    </mds-button>
  </mds-banner>
);

const TemplateVariantDark = (args) => (
  <mds-banner {...args}>
    <mds-text typography="detail">
      Il tuo account è stato aggiornato alla versione PRO, ora puoi utilizzare le notifiche su
      aggiornamenti di norme di legge e la consultazione dei volumi correlati.
    </mds-text>
    <mds-button slot="action" variant="light" tone="text">
      Cancel
    </mds-button>
    <mds-button slot="action" variant="dark" tone={args.tone}>
      Confirm
    </mds-button>
  </mds-banner>
);

const TemplateVariantLight = (args) => (
  <mds-banner {...args}>
    <mds-text typography="detail">
      Il tuo account è stato aggiornato alla versione PRO, ora puoi utilizzare le notifiche su
      aggiornamenti di norme di legge e la consultazione dei volumi correlati.
    </mds-text>
    <mds-button slot="action" variant="dark" tone="text">
      Cancel
    </mds-button>
    <mds-button slot="action" variant="dark" tone={args.tone}>
      Confirm
    </mds-button>
  </mds-banner>
);

export const Default = {
  render: Template,
};

export const Cockade = {
  render: Template,

  args: {
    icon: 'mi/baseline/warning',
    'hide-cockade': false,
  },
};

export const Headline = {
  render: Template,

  args: {
    headline: 'Avviso',
  },
};

export const Icon = {
  render: Template,

  args: {
    icon: 'mi/baseline/warning',
  },
};

export const Deletable = {
  render: Template,

  args: {
    dismissible: true,
  },
};

export const Actions = {
  render: TemplateActions,
};

export const Variant = {
  render: TemplateVariantDefault,

  args: {
    headline: 'Impostazioni account',
    icon: 'mi/baseline/info',
    dismissible: true,
  },
};

export const VariantDark = {
  render: TemplateVariantDark,

  args: {
    headline: 'Impostazioni account',
    icon: 'mi/baseline/info',
    dismissible: true,
    variant: 'dark',
  },
};

export const VariantLight = {
  render: TemplateVariantLight,

  args: {
    headline: 'Impostazioni account',
    icon: 'mi/baseline/info',
    dismissible: true,
    variant: 'light',
  },
};

const variantToneCombinations = themeVariantDictionary.flatMap((variant) =>
  toneMinimalBoxVariantDictionary.map((tone) => ({ tone, variant })),
);

const VariantsTableTemplate = () => (
  <mds-table>
    <mds-table-header>
      <mds-table-header-cell label="Preview"></mds-table-header-cell>
      <mds-table-header-cell label="Variant" sortable></mds-table-header-cell>
      <mds-table-header-cell label="Tone" sortable></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      {variantToneCombinations.map(({ tone, variant }) => (
        <mds-table-row key={`${variant}-${tone}`}>
          <mds-table-cell>
            <mds-banner class="w-10000" variant={variant} tone={tone} dismissible>
              <mds-text typography="detail">
                Il tuo account è stato aggiornato alla versione PRO, ora puoi utilizzare le
                notifiche su aggiornamenti di norme di legge e la consultazione dei volumi
                correlati.
              </mds-text>
              <mds-button slot="action" variant={variant} tone="outline">
                Cancel
              </mds-button>
              <mds-button slot="action" variant={variant} tone={tone}>
                Confirm
              </mds-button>
            </mds-banner>
          </mds-table-cell>
          <mds-table-cell value={variant}>
            <mds-text typography="hack" class="whitespace-nowrap">
              {variant}
            </mds-text>
          </mds-table-cell>
          <mds-table-cell value={tone}>
            <mds-text typography="hack" class="whitespace-nowrap">
              {tone}
            </mds-text>
          </mds-table-cell>
        </mds-table-row>
      ))}
    </mds-table-body>
  </mds-table>
);

export const VariantsTable = {
  render: VariantsTableTemplate,
};

/**
 * Every state of a banner once the story has opened (#1440, @fixture/states). Each variant in each
 * tone carries a headline, an icon in its cockade and the close button, so the colours of all
 * three are seen per variant; the parts one at a time are on the default variant (primary,
 * weak). Two cells hold the banner in a narrow box (`max-w-7200`, 288px), where its container
 * queries move the close button clear of the first line and stack the actions. The actions stand
 * in a row only in a banner wider than --container-actions (380px) plus its inset: in the three
 * columns of a 1440px canvas the cell `actions` is under it and stacks them too, on a wider
 * canvas it shows the row; `narrow, actions stacked` stacks them at every width. The banner as the
 * window of a dialog (`slot="window"` in an mds-modal, h5 headline by its place) opens an overlay
 * and is left to the stories of mds-modal; the h5 style itself is here, by `typography`. No state
 * needs an interaction: the close button only emits `mdsBannerClose`, the product removes the
 * banner, so the story has no play function.
 */
interface BannerState {
  state: string;
  narrow?: boolean;
  actions?: boolean;
  text?: string;
  props: Record<string, string | boolean>;
}

const bannerText =
  'Il servizio scade il 31 dicembre: rinnovalo per continuare a ricevere gli aggiornamenti normativi.';
const bannerLongText =
  'La pratica 2024/1042 è stata assegnata al servizio Edilizia privata, che la prenderà in carico entro dieci giorni lavorativi. Fino ad allora puoi ancora modificare gli allegati e la descrizione dei lavori: dopo, ogni modifica dovrà passare da una nuova istanza di integrazione documentale.';
const bannerHeadline = 'Rinnovo del servizio';
const bannerVariantIcons: Record<string, string> = {
  ai: 'mgg/ai-brain',
  dark: 'mi/baseline/info',
  error: 'mi/baseline/warning',
  info: 'mi/baseline/info',
  light: 'mi/baseline/info',
  primary: 'mi/baseline/info',
  success: 'mi/baseline/check-circle',
  warning: 'mi/baseline/warning',
};

const bannerStates: BannerState[] = [
  ...themeVariantDictionary.flatMap((variant) =>
    toneMinimalBoxVariantDictionary.map((tone) => ({
      state: `${variant}, ${tone}`,
      props: {
        variant,
        tone,
        headline: bannerHeadline,
        icon: bannerVariantIcons[variant],
        dismissible: true,
      },
    })),
  ),
  { state: 'rest', props: {} },
  { state: 'headline', props: { headline: bannerHeadline } },
  { state: 'headline, typography h5', props: { headline: bannerHeadline, typography: 'h5' } },
  { state: 'icon in its cockade', props: { icon: 'mi/baseline/info' } },
  { state: 'icon, hide-cockade', props: { icon: 'mi/baseline/info', 'hide-cockade': true } },
  { state: 'dismissible', props: { dismissible: true } },
  { state: 'actions', actions: true, props: {} },
  {
    state: 'every part',
    actions: true,
    props: { headline: bannerHeadline, icon: 'mi/baseline/info', dismissible: true },
  },
  {
    state: 'long text',
    text: bannerLongText,
    props: {
      headline: 'Pratica assegnata al servizio Edilizia privata del Comune',
      icon: 'mi/baseline/info',
      dismissible: true,
    },
  },
  {
    state: 'narrow, dismissible',
    narrow: true,
    props: { headline: bannerHeadline, dismissible: true },
  },
  { state: 'narrow, actions stacked', narrow: true, actions: true, props: {} },
];

const TemplateStates = () => (
  <StatesGrid>
    {bannerStates.map(({ state, narrow, actions, text, props }) => (
      <StateCell key={state} state={state}>
        <div class={narrow ? 'max-w-7200' : undefined}>
          <mds-banner {...props}>
            <mds-text typography="detail">{text ?? bannerText}</mds-text>
            {actions && (
              <mds-button slot="action" tone="outline">
                Più tardi
              </mds-button>
            )}
            {actions && <mds-button slot="action">Rinnova</mds-button>}
          </mds-banner>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
