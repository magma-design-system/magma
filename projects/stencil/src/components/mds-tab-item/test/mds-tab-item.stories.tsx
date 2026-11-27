import { iconsDictionary } from '@type/icon';
import { buttonSizeDictionary, buttonIconPositionDictionary } from '@type/button';
import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Navigation / Tab / Tab Item',
  id: 'ui-tab-tab-item',
  argTypes: {
    disabled: {
      type: { name: 'boolean' },
      description: 'Specifies if the tab item is disabled or not',
    },
    icon: {
      type: { name: 'string' },
      description: 'The icon displayed in the tab item',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    'icon-position': {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Specifies the horizontal position of the icon displayed in the tab item',
      options: buttonIconPositionDictionary,
    },
    selected: {
      type: { name: 'boolean' },
      description: 'Specifies if the tab item is selected or not',
    },
    label: {
      type: { name: 'string' },
      description: 'The label of the tab item',
    },
    size: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Specifies the size for the tab item',
      options: buttonSizeDictionary,
    },
  },
};

// a tab is only valid inside a tablist: the story renders it in its mds-tab
const Template = (args) => (
  <mds-tab>
    <mds-tab-item {...args} label="First Blood"></mds-tab-item>
  </mds-tab>
);

export const Default = {
  render: Template,
};

export const Selected = {
  render: Template,

  args: {
    selected: true,
  },
};

export const Disabled = {
  render: Template,

  args: {
    disabled: true,
  },
};

/**
 * Every state a tab has of its own once the story has opened (#1440, @fixture/states), each in a
 * strip of two tabs: the tab in the state is the first ("Allegati"), the other is its context. At
 * rest and selected, disabled, with its icon on either side or alone (named by `title`, which the
 * tab hands to its inner button), waiting, a link to another page or place and, selected, the
 * current one, the tab that opens a popup (`expanded`) and the long label. The states that come
 * from the strip (the animation, the size, the direction, the overflow, the panels) are in the
 * story of mds-tab. A state only an interaction reaches (`play: true`) is brought there by the
 * play function, which checks `selected`, not its look.
 */
interface TabState {
  state: string;
  play?: boolean;
  /** the props of the tab in the state */
  item: Record<string, string | boolean>;
  /** the props of the other tab of the strip */
  other?: Record<string, string | boolean>;
}

const attachments = { label: 'Allegati', value: 'allegati', type: 'button' };
const history = { label: 'Storico', value: 'storico', type: 'button' };
const historySelected = { ...history, selected: true };

const tabStates: TabState[] = [
  { state: 'rest', item: attachments, other: historySelected },
  { state: 'selected', item: { ...attachments, selected: true }, other: history },
  { state: 'disabled', item: { ...attachments, disabled: true }, other: historySelected },
  {
    state: 'disabled, selected',
    item: { ...attachments, disabled: true, selected: true },
    other: history,
  },
  {
    state: 'icon on the left',
    item: { ...attachments, icon: 'mi/baseline/attach-file' },
    other: historySelected,
  },
  {
    state: 'icon on the left, selected',
    item: { ...attachments, icon: 'mi/baseline/attach-file', selected: true },
    other: history,
  },
  {
    state: 'icon on the right',
    item: {
      ...attachments,
      label: 'Apri il fascicolo',
      icon: 'mi/baseline/open-in-new',
      'icon-position': 'right',
    },
    other: historySelected,
  },
  {
    state: 'icon only, named by its title',
    item: { value: 'allegati', type: 'button', icon: 'mi/baseline/attach-file', title: 'Allegati' },
    other: {
      value: 'storico',
      type: 'button',
      icon: 'mi/baseline/view-list',
      title: 'Storico',
      selected: true,
    },
  },
  { state: 'waiting', item: { ...attachments, await: true }, other: historySelected },
  {
    state: 'link',
    item: { label: 'Allegati', value: 'allegati', href: '#allegati' },
    other: { label: 'Storico', value: 'storico', href: '#storico', selected: true },
  },
  {
    state: 'link, the current one',
    item: { label: 'Allegati', value: 'allegati', href: '#allegati', selected: true },
    other: { label: 'Storico', value: 'storico', href: '#storico' },
  },
  {
    state: 'opens a popup, closed',
    item: { ...attachments, expanded: false },
    other: historySelected,
  },
  {
    state: 'opens a popup, open',
    item: { ...attachments, expanded: true },
    other: historySelected,
  },
  {
    state: 'long label',
    item: { ...attachments, label: 'Allegati della domanda e integrazioni richieste' },
    other: historySelected,
  },
  { state: 'chosen by a click', play: true, item: attachments, other: historySelected },
  { state: 'chosen with Enter', play: true, item: attachments, other: historySelected },
  { state: 'chosen with Space', play: true, item: attachments, other: historySelected },
];

const TemplateStates = () => (
  <StatesGrid>
    {tabStates.map(({ state, play, item, other }) => (
      <StateCell key={state} state={state} play={play}>
        <mds-tab>
          <mds-tab-item {...item}></mds-tab-item>
          <mds-tab-item {...other}></mds-tab-item>
        </mds-tab>
      </StateCell>
    ))}
  </StatesGrid>
);

/** The tab of a cell in the state, once every Magma element of the cell has loaded. */
const loadedTab = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  return cell.querySelector('mds-tab-item') as HTMLMdsTabItemElement;
};

/**
 * A key sent to the inner button of the tab, which listens to it (not the host): Enter on its
 * press, Space on its release.
 */
const key = (item: HTMLMdsTabItemElement, type: 'keydown' | 'keyup', code: string) =>
  item.shadowRoot!.querySelector('mds-button')!.dispatchEvent(
    new KeyboardEvent(type, {
      code,
      key: code === 'Space' ? ' ' : code,
      bubbles: true,
      cancelable: true,
    }),
  );

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  // the tab listens on its inner button: a click on the host selects nothing
  const clicked = await loadedTab(canvasElement, 'chosen by a click');
  (clicked.shadowRoot!.querySelector('mds-button') as HTMLElement).click();
  const enter = await loadedTab(canvasElement, 'chosen with Enter');
  key(enter, 'keydown', 'Enter');
  const space = await loadedTab(canvasElement, 'chosen with Space');
  key(space, 'keydown', 'Space');
  key(space, 'keyup', 'Space');

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => expect(clicked).toHaveProperty('selected', true));
  await waitFor(() => expect(enter).toHaveProperty('selected', true));
  await waitFor(() => expect(space).toHaveProperty('selected', true));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
