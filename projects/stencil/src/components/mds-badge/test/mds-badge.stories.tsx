import { h } from '@stencil/core';
import { typographyLabelDictionary } from '@type/typography';
import { themeFullVariantDictionary } from '@type/variant';
import { toneSmartVariantDictionary } from '@type/tone';
import { StateCell, StatesGrid } from '@fixture/states';

export default {
  title: 'UI / Tags / Badge',
  id: 'ui-badge',
  argTypes: {
    label: {
      type: { name: 'string' },
      control: { type: 'text' },
      description: 'The label of the badge',
    },
    tone: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Sets the tone of the color variant',
      options: toneSmartVariantDictionary,
    },
    typography: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Specifies the font typography of the element',
      options: typographyLabelDictionary,
    },
    variant: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Sets the theme variant colors',
      options: themeFullVariantDictionary,
    },
  },
};

const Template = (args) => <mds-badge {...args}></mds-badge>;
const variantToneCombinations = themeFullVariantDictionary.flatMap((variant) =>
  toneSmartVariantDictionary.map((tone) => ({ tone, variant })),
);

export const Default = {
  render: Template,

  args: {
    label: 'bovaro del bernese',
    tone: 'strong',
    variant: 'violet',
  },
};

const VariantsTableTemplate = () => (
  <mds-table interactive>
    <mds-table-header>
      <mds-table-header-cell label="Preview"></mds-table-header-cell>
      <mds-table-header-cell label="Variant" sortable></mds-table-header-cell>
      <mds-table-header-cell label="Tone" sortable></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      {variantToneCombinations.map(({ tone, variant }) => (
        <mds-table-row key={`${variant}-${tone}`}>
          <mds-table-cell>
            <mds-badge variant={variant} tone={tone} label="bovaro del bernese"></mds-badge>
          </mds-table-cell>
          <mds-table-cell value={variant}>
            <mds-text typography="hack">{variant}</mds-text>
          </mds-table-cell>
          <mds-table-cell value={tone}>
            <mds-text typography="hack">{tone}</mds-text>
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
 * Every state of the badge once the story has opened (#1440, @fixture/states): each variant in its
 * three tones (weak, the default, then strong and outline), the two typographies, the long label in
 * a narrow column and the text in the deprecated slot. The badge is a static marker: no event, no
 * focus, no disabled state, so no state needs an interaction and the story has no play function.
 * The label says what each variant says in a product: a status for the status variants, a
 * category for the label variants, the neutral pair for dark and light. The customisation through
 * the public custom properties is the product's, not a state of the component.
 */
interface BadgeState {
  state: string;
  /** the text in the deprecated default slot, instead of `label` */
  slotted?: string;
  /** the width the badge is given, for the long label */
  width?: string;
  badges: Record<string, string>[];
}

const badgeTones = ['weak', 'strong', 'outline'];

// the label each variant takes in a product: what the variant says
const badgeVariants: [string, string][] = [
  ['success', 'Completato'],
  ['info', 'In attesa'],
  ['warning', 'In scadenza'],
  ['error', 'Respinto'],
  ['green', 'Ambiente'],
  ['amaranth', 'Cultura'],
  ['red', 'Urbanistica'],
  ['aqua', 'Clima'],
  ['blue', 'Tecnologia'],
  ['lime', 'Agricoltura'],
  ['orange', 'Sport'],
  ['orchid', 'Famiglia'],
  ['purple', 'Istruzione'],
  ['sky', 'Turismo'],
  ['violet', 'Design'],
  ['yellow', 'Parchi'],
  ['dark', 'Archiviato'],
  ['light', 'Bozza'],
];

const badgeStates: BadgeState[] = [
  ...badgeVariants.map(([variant, label]) => ({
    state: `variant ${variant}${variant === 'green' ? ' (default)' : ''} (${badgeTones.join(', ')})`,
    badges: badgeTones.map((tone) => ({ variant, tone, label })),
  })),
  {
    state: 'typography option (default)',
    badges: [{ variant: 'sky', label: 'Nuovo', typography: 'option' }],
  },
  {
    state: 'typography label',
    badges: [{ variant: 'sky', label: 'Nuovo', typography: 'label' }],
  },
  {
    state: 'long label, in a narrow column',
    width: 'max-w-3200',
    badges: [
      { variant: 'warning', label: 'In attesa della documentazione integrativa' },
      { variant: 'warning', tone: 'strong', label: 'In attesa della documentazione integrativa' },
    ],
  },
  { state: 'text in the slot (deprecated)', slotted: 'Firmato', badges: [{ variant: 'success' }] },
];

const TemplateStates = () => (
  <StatesGrid>
    {badgeStates.map(({ state, slotted, width, badges }) => (
      <StateCell key={state} state={state}>
        <div class={`flex flex-wrap items-center gap-200${width ? ` ${width}` : ''}`}>
          {badges.map((props, index) => (
            <mds-badge key={String(index)} {...props}>
              {slotted}
            </mds-badge>
          ))}
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
