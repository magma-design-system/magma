import { h } from '@stencil/core';
import { listMarkerDictionary } from '../meta/types';

export default {
  title: 'UI / Data / List',
  id: 'ui-list',
  argTypes: {
    marker: {
      control: { type: 'select' },
      description:
        'The marker of the items: dot before a text, none for items that are links, cards or chips laid out by the page',
      options: listMarkerDictionary,
      type: { name: 'string', required: false },
    },
  },
};

const Template = (args) => (
  <mds-list {...args}>
    <mds-list-item>Pane</mds-list-item>
    <mds-list-item>Acqua</mds-list-item>
    <mds-list-item>Pasta</mds-list-item>
  </mds-list>
);

export const Default = {
  render: Template,
};

// the lists of the docs site that had no Magma component (#1408): a column of links, a row of
// chips, a grid of cards, each laid out by the classes of the list
const MarkerNoneTemplate = () => (
  <div class="@container grid gap-1000">
    <section class="grid gap-400">
      <mds-text id="list-links" typography="h6" tag="h2">
        Risorse
      </mds-text>
      <mds-list marker="none" aria-labelledby="list-links" class="gap-300">
        <mds-list-item>
          <mds-text typography="detail">
            <mds-link href="#componenti">Componenti</mds-link>
          </mds-text>
        </mds-list-item>
        <mds-list-item>
          <mds-text typography="detail">
            <mds-link href="#token">Token</mds-link>
          </mds-text>
        </mds-list-item>
        <mds-list-item>
          <mds-text typography="detail">
            <mds-link href="#pattern">Pattern</mds-link>
          </mds-text>
        </mds-list-item>
      </mds-list>
    </section>
    <section class="grid gap-400">
      <mds-text id="list-chips" typography="h6" tag="h2">
        Agenti
      </mds-text>
      <mds-list marker="none" aria-labelledby="list-chips" class="flex flex-wrap gap-300">
        <mds-list-item>
          <mds-chip label="Claude Code" variant="ai" tone="weak"></mds-chip>
        </mds-list-item>
        <mds-list-item>
          <mds-chip label="Cursor" variant="ai" tone="weak"></mds-chip>
        </mds-list-item>
        <mds-list-item>
          <mds-chip label="Copilot" variant="ai" tone="weak"></mds-chip>
        </mds-list-item>
      </mds-list>
    </section>
    <section class="grid gap-400">
      <mds-text id="list-cards" typography="h6" tag="h2">
        Livelli di adozione
      </mds-text>
      <mds-list
        marker="none"
        aria-labelledby="list-cards"
        class="gap-600 @md:grid-cols-2 @3xl:grid-cols-3"
      >
        {['Componenti', 'Blocchi', 'Pattern'].map((level, index) => (
          <mds-list-item key={level}>
            <mds-card>
              <mds-card-header>
                <mds-text typography="h6" tag="h3">{`${index + 1}. ${level}`}</mds-text>
              </mds-card-header>
              <mds-card-content>
                <mds-text typography="detail">
                  Un livello di adozione, con il suo contenuto.
                </mds-text>
              </mds-card-content>
            </mds-card>
          </mds-list-item>
        ))}
      </mds-list>
    </section>
  </div>
);

export const MarkerNone = {
  render: MarkerNoneTemplate,
};
