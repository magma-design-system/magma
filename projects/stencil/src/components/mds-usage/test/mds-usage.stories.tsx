import { usageDictionary } from '../meta/dictionary';
import { UsageType } from '../meta/types';
import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';

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

/**
 * Every state of a usage block once the story has opened (#1440, @fixture/states): each
 * `variant` with its own label and icon (`info` is the one at rest), a label of its own
 * (`alias`), an icon of its own, an empty `icon` that falls back to the one of the variant, and
 * a guidance long enough to wrap over several paragraphs. A usage block has no interaction: no
 * play function.
 */
interface UsageState {
  state: string;
  usage?: Record<string, string>;
  text?: string[];
}

const guidance = ['Scrivi il titolo della pagina con la prima lettera maiuscola e senza punto.'];

const usageStates: UsageState[] = [
  { state: 'rest, info', text: guidance },
  { state: 'variant do', usage: { variant: 'do' }, text: guidance },
  { state: 'variant dont', usage: { variant: 'dont' }, text: guidance },
  { state: 'variant warn', usage: { variant: 'warn' }, text: guidance },
  { state: 'alias', usage: { variant: 'do', alias: 'Struttura consigliata' }, text: guidance },
  {
    state: 'icon of its own',
    usage: { variant: 'do', alias: 'Struttura consigliata', icon: 'mi/baseline/account-tree' },
    text: guidance,
  },
  {
    state: 'empty icon, the one of the variant',
    usage: { variant: 'warn', icon: '' },
    text: guidance,
  },
  {
    state: 'long guidance',
    usage: { variant: 'dont' },
    text: [
      'Non usare troppi stili nello stesso paragrafo: uno per il titolo, uno per il sottotitolo e uno per il testo, più un eventuale grassetto per sottolineare un concetto.',
      'Non modificare gli stili di testo stabiliti: usa solo quelli presenti nel design system, così che una pagina resti leggibile anche quando cambia il tema.',
    ],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {usageStates.map(({ state, usage, text }) => (
      <StateCell key={state} state={state}>
        <mds-usage {...usage}>
          {text?.map((paragraph) => (
            <mds-text key={paragraph}>{paragraph}</mds-text>
          ))}
        </mds-usage>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
