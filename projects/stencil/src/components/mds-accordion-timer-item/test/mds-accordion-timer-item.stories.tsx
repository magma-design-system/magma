import { TypographyHeadingTagType, typographyHeadingTagDictionary } from '@type/text';
import { TypographyTitleType, typographyReadDictionary } from '@type/typography';
import { h } from '@stencil/core';
import { expect, userEvent, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Structure / Accordion Timer / Accordion Timer Item',
  id: 'ui-accordion-timer-accordion-timer-item',
  argTypes: {
    description: {
      type: { name: 'string' },
      description: 'Specifies the title shown when the accordion is closed or opened',
    },
    selected: {
      type: { name: 'boolean' },
      description: 'Specifies if the accordion item is selected or not',
    },
    duration: {
      type: { name: 'number' },
      description:
        'Specifies the duration of the single component when selected, it overrides the global duration of itself only',
    },
    progress: {
      control: { type: 'range', step: 0.01, min: 0, max: 1 },
      type: { name: 'number' },
      description: 'A value between 0 and 100 that rapresents the status progress',
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
  <div>
    <mds-accordion-timer-item {...args}>
      <mds-text>
        Blipbug presenta delle fattezze riconducibili agli insetti nello stadio pre-crisalide. Il
        suo corpo si sviluppa in lunghezza, ed è formato principalmente da tre parti: la sua grande
        testa, il suo collo (molto simile ad un collare), e il corpo vero e proprio. La prima di
        queste è suddivisa in una parte color crema e una parte color denim; dello stesso colore
        sono le appenidici a forma di "V" che si trovano sopra e ai lati della testa. I suoi occhi
        sono enormi e grigi, ed hanno delle sottilissime sopracciglia sopra di essi. Il suo
        "collare", anch'esso color denim, presenta delle "setole" giallo sabbia, con le quali
        percepisce i segnali esterni: stesso colore si presenta nel segmento centrale della sua
        parte inferiore, dove sono presenti un primo paio di zampe crema. Il segmento superiore del
        corpo è bianco e ospita delle zampe anteriori color crema, ed infine, la parte finale, o la
        "coda", è color denim e finisce con un'appendice a "V" un po' piú grossa.
      </mds-text>
    </mds-accordion-timer-item>
  </div>
);

export const Default = {
  render: Template,

  args: {
    description: 'Blipbug',
  },
};

export const Selected = {
  render: Template,

  args: {
    selected: true,
    description: 'Blipbug',
  },
};

export const Progress = {
  render: Template,

  args: {
    selected: true,
    description: 'Blipbug',
    progress: 0.5,
  },
};

/**
 * Every state an item has of its own once the story has opened (#1440, @fixture/states), each in
 * an mds-accordion-timer of its own, under a description of its own (two regions with one name
 * are two landmarks a screen reader cannot tell apart). Every timer is `paused`, so the picture
 * holds: a running countdown would move the bar and open the next item while the story is open.
 * Closed and open, the countdown of the open item at the start, at 40% and almost over (the
 * `progress` the timer writes while it runs, set here on the item), each style of its title
 * (`typography`), the title in the outline of the page (`tag`, under the title of its section),
 * the long description that wraps and the focus of its button. The states that come from the
 * timer (idle, the rotation to the next item, the countdown moved by a click or from code) are in
 * the story of mds-accordion-timer, and the pause under the pointer needs a real pointer, which
 * a play does not move. A state only an interaction reaches (`play: true`) is brought there by
 * the play function, which checks `selected` or the focus, not the look; a click clears `paused`
 * of the timer, so the play pauses it again once the item is open.
 */
interface ItemProps {
  description: string;
  selected?: boolean;
  progress?: number;
  typography?: TypographyTitleType;
  tag?: TypographyHeadingTagType;
}

interface ItemState {
  state: string;
  play?: boolean;
  item: ItemProps;
  /** the title of the section the timer stands in, when the item is in the outline */
  section?: string;
}

const itemStates: ItemState[] = [
  { state: 'closed', item: { description: 'Firma digitale' } },
  {
    state: 'open, the countdown at the start',
    item: { description: 'Conservazione a norma', selected: true },
  },
  {
    state: 'open, the countdown at 40%',
    item: { description: 'Protocollo informatico', selected: true, progress: 0.4 },
  },
  {
    state: 'open, the countdown almost over',
    item: { description: 'Pagamenti con pagoPA', selected: true, progress: 0.9 },
  },
  { state: 'title h6, closed', item: { description: 'Albo pretorio online', typography: 'h6' } },
  {
    state: 'title h6, open',
    item: { description: 'Fascicolo del cittadino', typography: 'h6', selected: true },
  },
  {
    state: 'title action, closed',
    item: { description: 'Notifiche con app IO', typography: 'action' },
  },
  {
    state: 'title action, open',
    item: { description: 'Gestione delle presenze', typography: 'action', selected: true },
  },
  { state: 'title h4', item: { description: 'Bilancio armonizzato', typography: 'h4' } },
  { state: 'title h3', item: { description: 'Tributi locali', typography: 'h3' } },
  { state: 'title h2', item: { description: 'Servizi demografici', typography: 'h2' } },
  { state: 'title h1', item: { description: 'Polizia locale', typography: 'h1' } },
  {
    state: 'in the outline, heading h3 under its section',
    item: {
      description: "Sportello unico per l'edilizia",
      typography: 'h6',
      tag: 'h3',
      selected: true,
    },
    section: 'I servizi per il Comune',
  },
  {
    state: 'long description',
    item: {
      description:
        'Gestione documentale integrata con protocollo, conservazione e firma digitale remota',
    },
  },
  {
    state: 'long description, open',
    item: {
      description:
        'Portale dei servizi online per cittadini e imprese con accesso tramite SPID e CIE',
      selected: true,
    },
  },
  { state: 'opened by a click', play: true, item: { description: 'Anagrafe nazionale ANPR' } },
  { state: 'opened with Enter', play: true, item: { description: 'Stato civile digitale' } },
  {
    state: 'the open one clicked stays open',
    play: true,
    item: { description: 'Servizio elettorale', selected: true },
  },
  { state: 'focused', play: true, item: { description: 'Cimiteri e concessioni' } },
];

const timer = (item: ItemProps) => (
  <mds-accordion-timer paused>
    <mds-accordion-timer-item {...item}>
      <mds-text>Una breve descrizione del servizio e di cosa permette di fare.</mds-text>
    </mds-accordion-timer-item>
  </mds-accordion-timer>
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
            {timer(item)}
          </div>
        ) : (
          timer(item)
        )}
      </StateCell>
    ))}
  </StatesGrid>
);

/** The timer, the item and its button of a cell, once every Magma element of it has loaded. */
const loadedItem = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const timer = cell.querySelector('mds-accordion-timer') as HTMLMdsAccordionTimerElement;
  const item = cell.querySelector('mds-accordion-timer-item') as HTMLMdsAccordionTimerItemElement;
  // the button in the shadow root listens to the click, not the host
  const button = item.shadowRoot!.querySelector('button.action') as HTMLButtonElement;
  return { timer, item, button };
};

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const clicked = await loadedItem(canvasElement, 'opened by a click');
  clicked.button.click();
  const stays = await loadedItem(canvasElement, 'the open one clicked stays open');
  stays.button.click();

  // a native button: Enter clicks it on the press
  const enter = await loadedItem(canvasElement, 'opened with Enter');
  enter.button.focus();
  await userEvent.keyboard('{Enter}');

  // the last one to take the focus, which the page has only one of
  const focused = await loadedItem(canvasElement, 'focused');
  focused.button.focus();

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => expect(clicked.item).toHaveProperty('selected', true));
  await waitFor(() => expect(enter.item).toHaveProperty('selected', true));
  await waitFor(() => expect(stays.item).toHaveProperty('selected', true));
  await waitFor(() => expect(focused.item.shadowRoot!.activeElement).toBe(focused.button));

  // a click clears `paused` and holds the countdown at the start until the pointer leaves the
  // item: paused again, the picture holds
  for (const { timer } of [clicked, enter]) {
    await expect(timer).toHaveProperty('paused', false);
    timer.paused = true;
  }
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
