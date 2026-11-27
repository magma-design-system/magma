import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { snapDictionary, viewportDictionary, navigationDictionary } from '../meta/dictionary';

export default {
  title: 'UI / Structure / Horizontal Scroll',
  id: 'layout-horizontal-scroll',
  argTypes: {
    controls: {
      type: { name: 'string' },
      description: 'Specifies the viewport which will display navigation controls',
      options: viewportDictionary,
      control: { type: 'select' },
    },
    navigation: {
      description: 'Specifies if the scrollbar is visible or not',
      type: { name: 'string' },
      options: navigationDictionary,
      control: { type: 'select' },
    },
    snap: {
      type: { name: 'string' },
      description: 'Specifies the box’s snap position as an alignment of its snap area',
      options: snapDictionary,
      control: { type: 'select' },
    },
  },
};

const CardTemplate = ({ title, initials }) => (
  <mds-card class="min-w-[320px]">
    <mds-card-header>
      <div class="flex gap-400 items-center">
        <mds-avatar class="w-1100 min-w-1100 " initials={initials}></mds-avatar>
        <div class="flex gap-0 flex-col">
          <mds-text typography="h6">{title}</mds-text>
          <mds-text typography="caption">This is an example card</mds-text>
        </div>
      </div>
      <mds-button
        id="action-example"
        icon="mi/round/more-vert"
        variant="dark"
        tone="text"
      ></mds-button>
    </mds-card-header>
    <mds-card-media>
      <mds-img src="https://placehold.co/600x400" class="object-cover"></mds-img>
    </mds-card-media>
    <mds-card-content>
      <mds-text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis elementum lorem.
        Phasellus vel quam leo. Ut eget finibus libero. Integer sed odio hendrerit diam maximus
        blandit ac malesuada odio.
      </mds-text>
    </mds-card-content>
  </mds-card>
);

const Template = (args) => (
  <div class="-m-600 -bg-tone-neutral-10 border-b-2 border-solid border-tone-neutral-09 border-x-0 border-t-0">
    <mds-horizontal-scroll {...args}>
      <CardTemplate initials="01" title="Card" />
      <CardTemplate initials="02" title="Card" />
      <CardTemplate initials="03" title="Card" />
      <CardTemplate initials="04" title="Card" />
      <CardTemplate initials="05" title="Card" />
      <CardTemplate initials="06" title="Card" />
      <CardTemplate initials="07" title="Card" />
      <CardTemplate initials="08" title="Card" />
      <CardTemplate initials="09" title="Card" />
      <CardTemplate initials="10" title="Card" />
    </mds-horizontal-scroll>
  </div>
);

export const Default = {
  render: Template,
};

export const Snap = {
  render: Template,

  args: {
    snap: 'end',
  },
};

export const Navigation = {
  render: Template,

  args: {
    navigation: 'navigation',
  },
};

export const TailwindStyled = {
  render: Template,

  args: {
    class: 'bg-tone-neutral-04 gap-400 p-400 snap-px-400',
  },
};

/**
 * Every state of the scroll once the story has opened (#1440, @fixture/states), each a row of
 * cards of a list of cases. At the start of its scroll, in the middle and at the end (its arrows
 * and its position dot follow the scroll), each way to show the position (`navigation`: the dot,
 * the scrollbar, nothing), without arrows (`controls="none"`; the other values name the
 * breakpoint of the window from which the arrows show, so a cell shows what the window of the
 * story is wide enough for), each alignment of the snap and the content that fits, with nothing
 * to scroll. A cell is narrower than 1024px, where the scroll lays out its arrows for a narrow
 * box: the wide layout is in the Default story, and so is the move by an arrow, which measures
 * the cards against the window and moves nothing in a cell away from its top. A state only an
 * interaction reaches (`play: true`) is brought there by the play function, which scrolls the
 * track (the `content` part) as a person does and checks its `scrollLeft`, not the look: the
 * component exposes no property of its position.
 */
interface ScrollState {
  state: string;
  play?: boolean;
  scroll?: Record<string, string>;
  /** how many cards the row holds */
  cards?: number;
}

const scrollStates: ScrollState[] = [
  { state: 'at the start' },
  { state: 'in the middle', play: true },
  { state: 'at the end', play: true },
  { state: 'position as a scrollbar', scroll: { navigation: 'scrollbar' } },
  { state: 'no position', scroll: { navigation: 'none' } },
  { state: 'no arrows', scroll: { controls: 'none' } },
  { state: 'snap to the centre', scroll: { snap: 'center' } },
  { state: 'snap to the end', scroll: { snap: 'end' } },
  { state: 'no snap', scroll: { snap: 'none' } },
  { state: 'content that fits, nothing to scroll', cards: 1 },
];

const cases = [
  ['Pratica 2026/101', 'In istruttoria'],
  ['Pratica 2026/102', 'Da firmare'],
  ['Pratica 2026/103', 'Integrazioni richieste'],
  ['Pratica 2026/104', 'Accolta'],
  ['Pratica 2026/105', 'In istruttoria'],
  ['Pratica 2026/106', 'Respinta'],
  ['Pratica 2026/107', 'Da firmare'],
  ['Pratica 2026/108', 'Archiviata'],
];

const TemplateStates = () => (
  <StatesGrid>
    {scrollStates.map(({ state, play, scroll, cards }) => (
      <StateCell key={state} state={state} play={play}>
        <mds-horizontal-scroll {...scroll}>
          {cases.slice(0, cards ?? cases.length).map(([title, status]) => (
            <mds-card key={title} class="min-w-4500">
              <mds-card-content>
                <mds-text typography="h6">{title}</mds-text>
                <mds-text typography="caption">{status}</mds-text>
              </mds-card-content>
            </mds-card>
          ))}
        </mds-horizontal-scroll>
      </StateCell>
    ))}
  </StatesGrid>
);

/** The track of the scroll of a cell, once every Magma element of the cell has loaded. */
const loadedScroll = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const scroll = cell.querySelector('mds-horizontal-scroll') as HTMLMdsHorizontalScrollElement;
  return scroll.shadowRoot!.querySelector('[part="content"]') as HTMLElement;
};

/**
 * Scrolls the track at once, then sends the events the browser sends at the end of a scroll: the
 * arrows follow `scrollend`, the dot `scroll`, and a hidden page draws no frame to send them.
 */
const scrollTrack = (track: HTMLElement, left: number) => {
  track.scrollTo({ left, behavior: 'instant' });
  track.dispatchEvent(new Event('scroll'));
  track.dispatchEvent(new Event('scrollend'));
};

/** The farthest the track scrolls. */
const end = (track: HTMLElement) => track.scrollWidth - track.clientWidth;

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const middle = await loadedScroll(canvasElement, 'in the middle');
  scrollTrack(middle, end(middle) / 2);
  const last = await loadedScroll(canvasElement, 'at the end');
  scrollTrack(last, end(last));

  await waitFor(() => expect(middle.scrollLeft).toBeGreaterThan(0));
  await expect(middle.scrollLeft).toBeLessThan(end(middle));
  await waitFor(() => expect(last.scrollLeft).toBeCloseTo(end(last), 0));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
