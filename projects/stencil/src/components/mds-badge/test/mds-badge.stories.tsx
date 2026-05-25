import { h } from '@stencil/core';
import { typographyLabelDictionary } from '@type/typography';
import { themeFullVariantDictionary } from '@type/variant';
import { toneSmartVariantDictionary } from '@type/tone';

export default {
  title: 'UI / Badge',
  argTypes: {
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

const Template = (args) => <mds-badge {...args}>bovaro del bernese</mds-badge>;
const variantToneCombinations = themeFullVariantDictionary.flatMap((variant) =>
  toneSmartVariantDictionary.map((tone) => ({ tone, variant })),
);

export const Default = {
  render: Template,

  args: {
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
            <mds-badge variant={variant} tone={tone}>
              bovaro del bernese
            </mds-badge>
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
