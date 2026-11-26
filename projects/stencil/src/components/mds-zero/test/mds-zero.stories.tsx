import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';

export default {
  title: 'UI / Feedback / Zero',
  id: 'ui-zero',
};

const Template = (args) => (
  <mds-zero {...args}>
    <mds-img src="./icon-newspaper-03.png" class="w-full max-w-[280px]" />
    <mds-text typography="part" tag="h2" slot="content">
      Crea il tuo primo articolo
    </mds-text>
    <mds-text typography="detail" tag="p" slot="content">
      Contribuisci alla creazione contenuti editoriali di riferimento per la pubblica amminstrazione
      in Italia.
    </mds-text>
    <mds-button slot="action" size="lg" class="max-mobile:w-full">
      Nuovo
    </mds-button>
  </mds-zero>
);

export const Default = {
  render: Template,
};

/**
 * Every state of the empty-state panel once the story has opened (#1440, @fixture/states): its
 * zones on and off, the illustration in the default slot, the message in `content`, the actions
 * in `action`. The panel has no props, so its states are the zones a product fills; the title
 * takes the `tag` of its place, `h2` under the title of a page, `h1` with `typography="page"` in
 * place of a page. The illustration is the one of the other story, decorative (`alt=""`). Two
 * cells hold the panel in a narrow box (`max-w-7200`, 288px), where the text and the actions wrap.
 * No state needs an interaction: the story has no play function.
 */
interface ZeroState {
  state: string;
  narrow?: boolean;
  illustration?: boolean;
  title?: string;
  page?: boolean;
  text?: string;
  actions?: string[];
}

const zeroTitle = 'Nessuna pratica';
const zeroText = 'Le pratiche che crei o che ti vengono assegnate compaiono qui.';
const zeroLongText =
  'Le pratiche che crei o che ti vengono assegnate compaiono qui, in ordine di scadenza. Puoi anche importarle da un archivio esterno o da un file CSV esportato da un altro gestionale: le pratiche importate mantengono il numero di protocollo e gli allegati.';

const zeroStates: ZeroState[] = [
  {
    state: 'every zone',
    illustration: true,
    title: zeroTitle,
    text: zeroText,
    actions: ['Nuova pratica'],
  },
  { state: 'no illustration', title: zeroTitle, text: zeroText, actions: ['Nuova pratica'] },
  { state: 'no action', illustration: true, title: zeroTitle, text: zeroText },
  {
    state: 'two actions',
    illustration: true,
    title: zeroTitle,
    text: zeroText,
    actions: ['Importa', 'Nuova pratica'],
  },
  { state: 'title only', title: zeroTitle },
  {
    state: 'in place of a page',
    title: 'Pratica non trovata',
    page: true,
    text: 'La pratica che cerchi è stata archiviata o non esiste più.',
    actions: ['Vai alle pratiche'],
  },
  {
    state: 'long text',
    illustration: true,
    title: 'Nessuna pratica assegnata al tuo ufficio in questo periodo',
    text: zeroLongText,
    actions: ['Nuova pratica'],
  },
  {
    state: 'narrow',
    narrow: true,
    illustration: true,
    title: zeroTitle,
    text: zeroText,
    actions: ['Nuova pratica'],
  },
  {
    state: 'narrow, two actions',
    narrow: true,
    title: zeroTitle,
    text: zeroText,
    actions: ['Importa', 'Nuova pratica'],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {zeroStates.map(({ state, narrow, illustration, title, page, text, actions }) => (
      <StateCell key={state} state={state}>
        <div class={narrow ? 'max-w-7200' : undefined}>
          <mds-zero>
            {illustration && (
              <mds-img src="./icon-newspaper-03.png" alt="" class="w-full max-w-7000" />
            )}
            {title && (
              <mds-text typography={page ? 'page' : 'part'} tag={page ? 'h1' : 'h2'} slot="content">
                {title}
              </mds-text>
            )}
            {text && (
              <mds-text typography="detail" tag="p" slot="content">
                {text}
              </mds-text>
            )}
            {actions?.map((action, index) => (
              <mds-button
                key={action}
                slot="action"
                tone={index < actions.length - 1 ? 'outline' : undefined}
              >
                {action}
              </mds-button>
            ))}
          </mds-zero>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
