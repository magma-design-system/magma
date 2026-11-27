import { themeLabelVariantDictionary } from '@type/variant';
import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';

export default {
  title: 'UI / Content / Note',
  id: 'ui-note',
  argTypes: {
    deletable: {
      type: { name: 'boolean' },
      description:
        'The name of the icon. The icon set is strictly realted to @maggioli-design-system/icons',
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the color variant for the element',
      options: themeLabelVariantDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <mds-note {...args}>
    <mds-text typography="detail">
      What one programmer can do in one month, two programmers can do in two months.
    </mds-text>
  </mds-note>
);

const TemplateTitle = (args) => (
  <mds-note {...args}>
    <mds-text typography="h5" slot="title">
      Nota riunione Synbee
    </mds-text>
    <mds-text typography="detail">
      Posso prendere i dati solo dopo previa conferma dell'utente registrato.
    </mds-text>
    <mds-text typography="detail">
      È necessario dare il consenso anche a partner di terze parti per poter rendere al massimo
      l'analisi dei dati dell'utente.
    </mds-text>
  </mds-note>
);

export const Default = {
  render: Template,
};

export const Deletable = {
  render: Template,

  args: {
    deletable: true,
  },
};

export const Title = {
  render: TemplateTitle,
};

/**
 * Every state of a note once the story has opened (#1440, @fixture/states): the paper of each
 * `variant` (yellow, the default, is the one at rest), with and without a title, deletable, and a
 * body long enough to wrap. Deleting asks, it does not act: the close button emits
 * `mdsNoteDelete` and leaves the note in place for the product to remove, so it reaches no state
 * of the note and the story has no play function (the event is covered by the e2e test).
 */
interface NoteState {
  state: string;
  note?: Record<string, string | boolean>;
  title?: string;
  body?: string[];
}

const body = ["Allegare il verbale della seduta prima dell'invio al protocollo."];

const noteStates: NoteState[] = [
  { state: 'rest, yellow', body },
  { state: 'with a title', title: 'Riunione di giunta', body },
  { state: 'deletable', note: { deletable: true }, body },
  { state: 'deletable, with a title', note: { deletable: true }, title: 'Da ricordare', body },
  ...themeLabelVariantDictionary
    .filter((variant) => variant !== 'yellow')
    .map((variant) => ({ state: `variant ${variant}`, note: { variant }, body })),
  {
    state: 'long text',
    title: 'Verifiche prima della pubblicazione del bando di concorso',
    body: [
      'Controllare che i requisiti di accesso corrispondano a quelli approvati dalla giunta e che le date di scadenza tengano conto dei giorni festivi.',
      "Chiedere conferma all'ufficio personale del numero dei posti messi a concorso.",
    ],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {noteStates.map(({ state, note, title, body }) => (
      <StateCell key={state} state={state}>
        <mds-note {...note}>
          {title && (
            <mds-text typography="h5" tag="p" slot="title">
              {title}
            </mds-text>
          )}
          {body?.map((paragraph) => (
            <mds-text key={paragraph} typography="detail">
              {paragraph}
            </mds-text>
          ))}
        </mds-note>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
