import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
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

/**
 * Every state the list has of its own once the story has opened (#1440, @fixture/states): the
 * `dot` marker it starts from, and `marker="none"` with the three layouts the page gives the items
 * by classes on the list (a column of links, a row of chips that wraps, a grid of cards), one item
 * and the long items that wrap under their own indent, the muted list, and the list that takes the
 * colour of a tinted container. What one item draws (its icon, typography, variant) is in the
 * story of mds-list-item. Each list is named by the heading above it, as a product names it. No
 * state needs an interaction.
 */
interface ListState {
  state: string;
  /** the heading that names the list */
  title?: string;
  list?: Record<string, string>;
  /** the classes of the container the list sits in */
  container?: string;
  items: (string | { link?: string; chip?: string; card?: string })[];
}

const documents = ['Documento di identita', 'Codice fiscale', 'Planimetria catastale'];

const listStates: ListState[] = [
  { state: 'marker dot (default)', items: documents },
  { state: 'one item', items: documents.slice(0, 1) },
  {
    state: 'long items, wrapped',
    items: [
      'Relazione tecnica asseverata da un professionista abilitato, firmata digitalmente',
      'Dichiarazione sostitutiva dell atto di notorieta sul possesso dei requisiti',
    ],
  },
  {
    state: 'muted (text-fg-muted on the list)',
    list: { class: 'text-fg-muted' },
    items: documents,
  },
  {
    state: 'in a tinted container, its colour',
    container: 'grid gap-200 bg-accent-surface text-accent-fg p-400 rounded-lg',
    items: documents,
  },
  {
    state: 'marker none, a column of links',
    title: 'Risorse',
    list: { marker: 'none', class: 'gap-300' },
    items: [{ link: 'Modulistica' }, { link: 'Orari degli uffici' }, { link: 'Contatti' }],
  },
  {
    state: 'marker none, a row of chips that wraps',
    title: 'Argomenti',
    list: { marker: 'none', class: 'flex flex-wrap gap-300' },
    items: [
      { chip: 'Edilizia' },
      { chip: 'Commercio' },
      { chip: 'Tributi' },
      { chip: 'Servizi sociali' },
      { chip: 'Mobilita' },
      { chip: 'Ambiente' },
    ],
  },
  {
    state: 'marker none, a grid of cards',
    title: 'Servizi',
    list: { marker: 'none', class: 'gap-400' },
    items: [{ card: 'Presenta una pratica' }, { card: 'Consulta lo stato' }],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {listStates.map(({ state, title, list, container, items }, index) => (
      <StateCell key={state} state={state}>
        <div class={container ?? 'grid gap-200'}>
          <mds-text id={`list-states-${index}`} typography="label" tag="h3">
            {title ?? 'Documenti richiesti'}
          </mds-text>
          <mds-list {...list} aria-labelledby={`list-states-${index}`}>
            {items.map((item) =>
              typeof item === 'string' ? (
                <mds-list-item key={item}>{item}</mds-list-item>
              ) : (
                <mds-list-item key={item.link ?? item.chip ?? item.card}>
                  {item.link && (
                    <mds-text typography="detail">
                      <mds-link href={`#${item.link}`}>{item.link}</mds-link>
                    </mds-text>
                  )}
                  {item.chip && <mds-chip label={item.chip} tone="weak"></mds-chip>}
                  {item.card && (
                    <mds-card>
                      <mds-card-header>
                        <mds-text typography="h6" tag="h4">
                          {item.card}
                        </mds-text>
                      </mds-card-header>
                      <mds-card-content>
                        <mds-text typography="detail">Un servizio dello sportello online.</mds-text>
                      </mds-card-content>
                    </mds-card>
                  )}
                </mds-list-item>
              ),
            )}
          </mds-list>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
