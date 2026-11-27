import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Navigation / Paginator',
  id: 'ui-paginator',
  argTypes: {
    pages: {
      type: { name: 'number', required: false },
      description: 'Specifies the number of total pages to be handled',
    },
    'current-page': {
      type: { name: 'number', required: false },
      description: 'Specifies the current page selected in the paginator',
    },
  },
};
const Template = (args) => <mds-paginator {...args} />;

export const Default = {
  render: Template,

  args: {
    pages: 32,
  },
};

export const CurrentPage = {
  render: Template,

  args: {
    'current-page': 16,
    pages: 32,
  },
};

/**
 * Every state of the paginator once the story has opened (#1440, @fixture/states): by the number
 * of pages (none, one, two, a few, more than the strip holds, which scrolls) and by where the
 * current page is, which disables the arrow on that side. The items are rendered by the
 * paginator, so their states (current, disabled, the arrows) are shown here. The arrows are named
 * by the component in the language of the page. A state only an interaction reaches
 * (`play: true`) is brought there by the play function, which checks `currentPage`, not its
 * look.
 */
interface PaginatorState {
  state: string;
  play?: boolean;
  paginator: Record<string, number>;
}

const paginatorStates: PaginatorState[] = [
  { state: 'no pages', paginator: { pages: 0 } },
  { state: 'one page', paginator: { pages: 1 } },
  { state: 'two pages, the first current', paginator: { pages: 2 } },
  { state: 'two pages, the last current', paginator: { pages: 2, 'current-page': 2 } },
  { state: 'a few pages, the first current', paginator: { pages: 5 } },
  { state: 'a few pages, a middle one current', paginator: { pages: 5, 'current-page': 3 } },
  { state: 'a few pages, the last current', paginator: { pages: 5, 'current-page': 5 } },
  { state: 'many pages, the first current', paginator: { pages: 32 } },
  { state: 'many pages, a middle one current', paginator: { pages: 32, 'current-page': 16 } },
  { state: 'many pages, the last current', paginator: { pages: 32, 'current-page': 32 } },
  { state: 'next page by the arrow', play: true, paginator: { pages: 5 } },
  { state: 'previous page by the arrow', play: true, paginator: { pages: 5, 'current-page': 3 } },
  { state: 'a page chosen by a click', play: true, paginator: { pages: 32 } },
  { state: 'the last page by its item', play: true, paginator: { pages: 32 } },
  { state: 'a page chosen with Enter', play: true, paginator: { pages: 5 } },
  { state: 'a page chosen with Space', play: true, paginator: { pages: 5 } },
];

const TemplateStates = () => (
  <StatesGrid>
    {paginatorStates.map(({ state, play, paginator }) => (
      <StateCell key={state} state={state} play={play}>
        {/* the block a product gives the paginator: the cell is a grid, whose column would take
            the width of every page instead of letting the strip scroll */}
        <div class="min-w-0">
          <mds-paginator {...paginator}></mds-paginator>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

/**
 * The paginator of a cell and its items, once every Magma element of the cell, and of its shadow
 * root, where the paginator renders its items, has loaded.
 */
const loadedPaginator = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const paginator = cell.querySelector('mds-paginator') as HTMLMdsPaginatorElement;
  await waitFor(() => expect(paginator).toHaveAttribute('hydrated'));
  const items = () =>
    Array.from(
      paginator.shadowRoot!.querySelectorAll('mds-paginator-item'),
    ) as HTMLMdsPaginatorItemElement[];
  await waitFor(() => items().forEach((item) => expect(item).toHaveAttribute('hydrated')));
  // the arrows are the first and the last item, the pages the ones between
  const all = items();
  const page = (number: number) =>
    all.find((item) => item.textContent?.trim() === String(number)) as HTMLMdsPaginatorItemElement;
  return { paginator, previous: all[0], next: all[all.length - 1], page };
};

/** A key sent to an item, which listens to it: Enter on its press, Space on its release. */
const key = (item: HTMLElement, type: 'keydown' | 'keyup', code: string) =>
  item.dispatchEvent(
    new KeyboardEvent(type, {
      code,
      key: code === 'Space' ? ' ' : code,
      bubbles: true,
      cancelable: true,
    }),
  );

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const next = await loadedPaginator(canvasElement, 'next page by the arrow');
  next.next.click();
  const previous = await loadedPaginator(canvasElement, 'previous page by the arrow');
  previous.previous.click();
  const clicked = await loadedPaginator(canvasElement, 'a page chosen by a click');
  clicked.page(12).click();
  const last = await loadedPaginator(canvasElement, 'the last page by its item');
  last.page(32).click();
  const enter = await loadedPaginator(canvasElement, 'a page chosen with Enter');
  key(enter.page(4), 'keydown', 'Enter');
  const space = await loadedPaginator(canvasElement, 'a page chosen with Space');
  key(space.page(4), 'keydown', 'Space');
  key(space.page(4), 'keyup', 'Space');

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => expect(next.paginator).toHaveProperty('currentPage', 2));
  await waitFor(() => expect(previous.paginator).toHaveProperty('currentPage', 2));
  await waitFor(() => expect(clicked.paginator).toHaveProperty('currentPage', 12));
  await waitFor(() => expect(last.paginator).toHaveProperty('currentPage', 32));
  await waitFor(() => expect(enter.paginator).toHaveProperty('currentPage', 4));
  await waitFor(() => expect(space.paginator).toHaveProperty('currentPage', 4));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
