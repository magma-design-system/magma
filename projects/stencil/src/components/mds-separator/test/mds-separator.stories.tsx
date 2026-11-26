import { h } from '@stencil/core';
import { toneMinimalVariantDictionary } from '@type/tone';

export default {
  title: 'UI / Structure / Separator',
  id: 'ui-separator',
  argTypes: {
    tone: {
      type: { name: 'string' },
      options: toneMinimalVariantDictionary,
      control: { type: 'select' },
      description:
        'Sets the intensity of the rule: `strong` the role of functional outlines, `weak` the role of decorative dividers',
    },
  },
};

const Template = (args) => (
  <div class="p-600 bg-tone-neutral-10 rounded-3xl">
    <div class="grid rounded-xl bg-surface-raised shadow contrast-more:shadow-ring overflow-hidden">
      <mds-entity aria-label="Personaggio" class="shadow-none p-600" icon="mi/baseline/person">
        <mds-text aria-label="Nome" typography="h6">
          Mario Rossi
        </mds-text>
        <mds-badge aria-label="Carattere" slot="detail" variant="orange" tone="weak">
          buono
        </mds-badge>
        <mds-text aria-label="Email" slot="detail" typography="caption">
          mario@nintendo.com
        </mds-text>
      </mds-entity>
      <mds-separator {...args}></mds-separator>
      <mds-entity aria-label="Personaggio" class="shadow-none p-600" icon="mi/baseline/person">
        <mds-text aria-label="Nome" typography="h6">
          Luigi Verdi
        </mds-text>
        <mds-badge aria-label="Carattere" slot="detail" variant="orange" tone="weak">
          buono
        </mds-badge>
        <mds-text aria-label="Email" slot="detail" typography="caption">
          luigi@nintendo.com
        </mds-text>
      </mds-entity>
      <mds-separator {...args}></mds-separator>
      <mds-entity aria-label="Personaggio" class="shadow-none p-600" icon="mi/baseline/person">
        <mds-text aria-label="Nome" typography="h6">
          Wario
        </mds-text>
        <mds-badge aria-label="Carattere" slot="detail" variant="violet" tone="weak">
          biricchino
        </mds-badge>
        <mds-text aria-label="Email" slot="detail" typography="caption">
          wario@nintendo.com
        </mds-text>
      </mds-entity>
    </div>
  </div>
);

export const Default = {
  render: Template,
};

// #1554: the rows of a list inside a card, whose own outline is already `border-default`
export const Weak = {
  render: Template,
  args: {
    tone: 'weak',
  },
};
