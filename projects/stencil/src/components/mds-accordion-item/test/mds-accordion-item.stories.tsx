import { h } from '@stencil/core';
import { expect, userEvent, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { TypographyHeadingTagType, typographyHeadingTagDictionary } from '@type/text';
import { TypographyTitleType, typographyReadDictionary } from '@type/typography';

export default {
  title: 'UI / Structure / Accordion / Accordion Item',
  id: 'ui-accordion-accordion-item',
  argTypes: {
    label: {
      type: { name: 'string' },
      description: 'Specifies the title shown when the accordion is closed or opened',
    },
    selected: {
      type: { name: 'boolean' },
      description: 'Specifies if the accordion item is opened or not',
    },
    tag: {
      type: { name: 'string' },
      description:
        'Specifies the heading level of the title, the level of its place in the outline of the page: left out, the item is not a heading',
      options: typographyHeadingTagDictionary,
      control: { type: 'select' },
    },
    typography: {
      type: { name: 'string' },
      description: 'Specifies the typography of the element',
      options: typographyReadDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <mds-accordion-item {...args}>
    <mds-text>
      Blipbug presenta delle fattezze riconducibili agli insetti nello stadio pre-crisalide. Il suo
      corpo si sviluppa in lunghezza, ed è formato principalmente da tre parti: la sua grande testa,
      il suo collo (molto simile ad un collare), e il corpo vero e proprio. La prima di queste è
      suddivisa in una parte color crema e una parte color denim; dello stesso colore sono le
      appenidici a forma di "V" che si trovano sopra e ai lati della testa. I suoi occhi sono enormi
      e grigi, ed hanno delle sottilissime sopracciglia sopra di essi. Il suo "collare", anch'esso
      color denim, presenta delle "setole" giallo sabbia, con le quali percepisce i segnali esterni:
      stesso colore si presenta nel segmento centrale della sua parte inferiore, dove sono presenti
      un primo paio di zampe crema. Il segmento superiore del corpo è bianco e ospita delle zampe
      anteriori color crema, ed infine, la parte finale, o la "coda", è color denim e finisce con
      un'appendice a "V" un po' piú grossa.
    </mds-text>
  </mds-accordion-item>
);

export const Default = {
  render: Template,

  args: {
    label: 'Blipbug',
  },
};

export const Selected = {
  render: Template,

  args: {
    selected: true,
    label: 'Blipbug',
  },
};

// the outline the guides write (usage/2. Examples.md): the items under the title h2 of their
// section are its parts, styled h6 and headings h3 (tag), the button inside the heading; the
// title stands gap-title-content (300) above them
export const InTheOutline = {
  render: () => (
    <div class="grid gap-300">
      <mds-text typography="section" tag="h2">
        Domande frequenti
      </mds-text>
      <mds-accordion>
        <mds-accordion-item label="Come gestisco gli aggiornamenti?" typography="h6" tag="h3">
          <mds-text>Ogni release e' documentata nel changelog con note di migrazione.</mds-text>
        </mds-accordion-item>
        <mds-accordion-item label="Posso personalizzare i colori?" typography="h6" tag="h3">
          <mds-text>Si', tramite i CSS custom properties esposti da ogni componente.</mds-text>
        </mds-accordion-item>
      </mds-accordion>
    </div>
  ),
};

/**
 * Every state an item has of its own once the story has opened (#1440, @fixture/states), each in
 * an accordion of its own, under a label of its own (two regions with one name are two landmarks
 * a screen reader cannot tell apart). Closed and open, each style of its title (`typography`:
 * `h5` by default, `h6` the style of a part of the page, `action` the compact one, and the
 * larger ones), the title in the outline of the page (`tag`, under the title of its section),
 * the long label that wraps and the focus of its button. The states that come from the accordion
 * (one open at a time, several with `multiple`, the open item kept by `disable-close`, the
 * separators by the place of the open item) are in the story of mds-accordion. A state only an
 * interaction reaches (`play: true`) is brought there by the play function, which checks
 * `selected` or the focus, not the look.
 */
interface ItemProps {
  label: string;
  selected?: boolean;
  typography?: TypographyTitleType;
  tag?: TypographyHeadingTagType;
}

interface ItemState {
  state: string;
  play?: boolean;
  item: ItemProps;
  /** the title of the section the accordion stands in, when the item is in the outline */
  section?: string;
}

const itemStates: ItemState[] = [
  { state: 'closed', item: { label: 'Dati del richiedente' } },
  { state: 'open', item: { label: "Dati dell'immobile", selected: true } },
  { state: 'title h6, closed', item: { label: 'Documenti allegati', typography: 'h6' } },
  {
    state: 'title h6, open',
    item: { label: 'Pagamenti effettuati', typography: 'h6', selected: true },
  },
  { state: 'title action, closed', item: { label: 'Recapiti', typography: 'action' } },
  {
    state: 'title action, open',
    item: { label: 'Tecnico incaricato', typography: 'action', selected: true },
  },
  { state: 'title h4', item: { label: 'Impresa esecutrice', typography: 'h4' } },
  { state: 'title h3', item: { label: 'Titolo edilizio', typography: 'h3' } },
  { state: 'title h2', item: { label: 'Vincoli paesaggistici', typography: 'h2' } },
  { state: 'title h1', item: { label: 'Oneri di urbanizzazione', typography: 'h1' } },
  {
    state: 'in the outline, heading h3 under its section',
    item: { label: 'Calcolo della superficie', typography: 'h6', tag: 'h3', selected: true },
    section: 'Domanda di permesso di costruire',
  },
  {
    state: 'long label',
    item: {
      label:
        'Dichiarazione sostitutiva di certificazione del richiedente e dei familiari conviventi',
    },
  },
  {
    state: 'long label, open',
    item: {
      label: 'Relazione tecnica asseverata sulle opere strutturali e sugli impianti del fabbricato',
      selected: true,
    },
  },
  { state: 'opened by a click', play: true, item: { label: 'Integrazioni richieste' } },
  { state: 'opened with Enter', play: true, item: { label: 'Comunicazioni ricevute' } },
  { state: 'opened with Space', play: true, item: { label: 'Pareri degli enti' } },
  {
    state: 'closed by a click',
    play: true,
    item: { label: 'Sopralluoghi', selected: true },
  },
  { state: 'focused', play: true, item: { label: 'Storico della pratica' } },
];

const accordion = (item: ItemProps) => (
  <mds-accordion>
    <mds-accordion-item {...item}>
      <mds-text>I dati e i documenti di questa sezione della pratica.</mds-text>
    </mds-accordion-item>
  </mds-accordion>
);

const TemplateStates = () => (
  <StatesGrid>
    {itemStates.map(({ state, play, item, section }) => (
      <StateCell key={state} state={state} play={play}>
        {section ? (
          <div class="grid gap-300">
            <mds-text typography="section" tag="h2">
              {section}
            </mds-text>
            {accordion(item)}
          </div>
        ) : (
          accordion(item)
        )}
      </StateCell>
    ))}
  </StatesGrid>
);

/** The item of a cell and its button, once every Magma element of the cell has loaded. */
const loadedItem = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const item = cell.querySelector('mds-accordion-item') as HTMLMdsAccordionItemElement;
  // the button in the shadow root listens to the click, not the host
  const button = item.shadowRoot!.querySelector('button.action') as HTMLButtonElement;
  return { item, button };
};
const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const clicked = await loadedItem(canvasElement, 'opened by a click');
  clicked.button.click();
  const closed = await loadedItem(canvasElement, 'closed by a click');
  closed.button.click();

  // a native button: Enter clicks it on the press, Space on the release
  const enter = await loadedItem(canvasElement, 'opened with Enter');
  enter.button.focus();
  await userEvent.keyboard('{Enter}');
  const space = await loadedItem(canvasElement, 'opened with Space');
  space.button.focus();
  await userEvent.keyboard(' ');

  // the last one to take the focus, which the page has only one of
  const focused = await loadedItem(canvasElement, 'focused');
  focused.button.focus();

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => expect(clicked.item).toHaveProperty('selected', true));
  await waitFor(() => expect(closed.item).toHaveProperty('selected', false));
  await waitFor(() => expect(enter.item).toHaveProperty('selected', true));
  await waitFor(() => expect(space.item).toHaveProperty('selected', true));
  await waitFor(() => expect(focused.item.shadowRoot!.activeElement).toBe(focused.button));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
