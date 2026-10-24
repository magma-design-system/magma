import { usageDictionary } from '../meta/dictionary';
import { UsageType } from '../meta/types';
import { h } from '@stencil/core';

export default {
  title: 'UI / Content / Usage',
  id: 'ui-usage',
  argTypes: {
    alias: {
      description: 'Specifies the alias of the usage phrase on the top of the component.',
      type: { name: 'string' },
    },
    icon: {
      description:
        'Specifies the icon displayed in the header; when not set or empty, the icon follows the `variant`.',
      type: { name: 'string' },
    },
    variant: {
      control: { type: 'select' },
      description:
        'Specifies the guidance category of the content, which drives colors, header label and icon.',
      options: usageDictionary,
      type: { name: 'string' },
    },
  },
};

const Template = (args) => (
  <mds-usage {...args}>
    <mds-text>
      Non usare troppi stili nello stesso paragrafo. Si consiglia di utilizzare uno stile per il
      titolo, uno per il sottotitolo e uno per il testo più un eventuale bold per sottolineare un
      concetto.
    </mds-text>
    <mds-text>
      Non modificare gli stili di testo stabiliti. Tentare di usare solo gli stili presenti
      all’interno del design system.
    </mds-text>
  </mds-usage>
);

export const Default = {
  render: Template,
};

export const Alias = {
  render: Template,

  args: {
    alias: 'Custom alias',
  },
};

export const Variant = {
  render: Template,

  args: {
    variant: 'dont',
  },
};

export const Variants = {
  render: () => (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {usageDictionary.map((variant) => (
        <mds-usage key={variant} variant={variant as UsageType}>
          <mds-text>Ogni variante ha un'icona che ne richiama il significato.</mds-text>
        </mds-usage>
      ))}
    </div>
  ),
};

export const Icon = {
  render: Template,

  args: {
    alias: 'Struttura consigliata',
    icon: 'mi/baseline/account-tree',
    variant: 'do',
  },
};
