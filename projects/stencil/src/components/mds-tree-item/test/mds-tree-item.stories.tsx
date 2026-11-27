import { h } from '@stencil/core';
import { treeIconDictionary } from '@type/tree';
import { iconsDictionary } from '@type/icon';
import { MdsTreeItemEventDetail } from 'src/components';
import { useEffect } from 'react';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Navigation / Tree / Tree Item',
  id: 'ui-tree-tree-item',
  argTypes: {
    expanded: {
      type: { name: 'boolean' },
      description: 'Specifies if the tree is expanded',
    },
    icon: {
      type: { name: 'string' },
      description:
        'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    label: {
      type: { name: 'string' },
      description: 'Specifies the label of the tree item',
    },
    toggle: {
      type: { name: 'string' },
      description:
        'Specifies the horizontal position of the toggle icon displayed in the component',
      options: treeIconDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = ({ ...args }) => (
  <mds-tree>
    <mds-tree-item {...args} label="First element of the tree">
      <mds-button
        slot="action"
        icon="mi/baseline/attach-file"
        variant="primary"
        tone="text"
        title="Schedule"
      ></mds-button>
      <mds-button
        slot="action"
        icon="mi/baseline/more-vert"
        variant="primary"
        tone="text"
        title="Options"
      ></mds-button>
      <mds-tree-item {...args} label="First children element"></mds-tree-item>
      <mds-tree-item {...args} label="Second element"></mds-tree-item>
      <mds-tree-item {...args} label="This is the third element children"></mds-tree-item>
      <mds-tree-item {...args} label="The fourth and final children">
        <mds-tree-item {...args} label="Hello beautiful world"></mds-tree-item>
        <mds-tree-item {...args} label="Surpraaaaaise!"></mds-tree-item>
      </mds-tree-item>
      <mds-tree-item {...args} label="Surprise! There is a fifth element"></mds-tree-item>
      <mds-tree-item {...args} label="And probably a sixth"></mds-tree-item>
    </mds-tree-item>
    <mds-tree-item {...args} label="Second element used in this tree">
      <mds-button
        slot="action"
        icon="mi/baseline/attach-file"
        variant="primary"
        tone="text"
        title="Schedule"
      ></mds-button>
      <mds-button
        slot="action"
        icon="mi/baseline/more-vert"
        variant="primary"
        tone="text"
        title="Options"
      ></mds-button>
      <mds-tree-item {...args} label="First children element"></mds-tree-item>
      <mds-tree-item {...args} label="Second element"></mds-tree-item>
      <mds-tree-item {...args} label="This is the third element children"></mds-tree-item>
      <mds-tree-item {...args} label="The fourth and final children">
        <mds-tree-item {...args} label="Hello beautiful world"></mds-tree-item>
        <mds-tree-item {...args} label="Surpraaaaaise!"></mds-tree-item>
      </mds-tree-item>
      <mds-tree-item {...args} label="Surprise! There is a fifth element"></mds-tree-item>
      <mds-tree-item {...args} label="And probably a sixth"></mds-tree-item>
    </mds-tree-item>
  </mds-tree>
);

const TemplateAsync = ({ ...args }) => {
  // Simulate async request
  useEffect(() => {
    const treeItemElement = document.querySelectorAll('.mds-tree-item')?.[0];
    if (treeItemElement) {
      treeItemElement.addEventListener(
        'mdsTreeItemExpand',
        (event: CustomEvent<MdsTreeItemEventDetail>) => {
          const { element } = event.detail;
          if (!element.async) return;
          setTimeout(() => {
            element.expand();
            element.async = false;
          }, 3000);
        },
      );
    }
  }, []);

  return (
    <mds-tree toggle="chevron" {...args}>
      <mds-tree-item
        async
        class="mds-tree-item"
        {...args}
        label="Segreteria"
        icon="mi/baseline/desk"
      >
        <mds-tree-item {...args} label="Genoveffo Baci" icon="mi/baseline/person"></mds-tree-item>
        <mds-tree-item
          {...args}
          label="Donaldo Trombetta"
          icon="mi/baseline/person"
        ></mds-tree-item>
        <mds-tree-item {...args} label="Elone Muschio" icon="mi/baseline/person"></mds-tree-item>
        <mds-tree-item
          {...args}
          label="Andrew Mountflower"
          icon="mi/baseline/person"
        ></mds-tree-item>
        <mds-tree-item {...args} label="Super Mauro Bros" icon="mi/baseline/person"></mds-tree-item>
      </mds-tree-item>
    </mds-tree>
  );
};

export const Default = {
  render: Template,
};
export const AsyncRequest = {
  render: TemplateAsync,
};

/**
 * Every state an item has of its own once the story has opened (#1440, @fixture/states), each in
 * a tree of its own, named by its `label` as a product names it: the item in the state is the
 * first of the tree ("Area tecnica"), or the nested one in the state named so. A leaf, with its
 * icon, a branch closed and open, nested in an open branch, its actions on hover and always
 * shown, the branch whose children load on demand (`async`) and the long label. The states that
 * come from the tree (the toggle and its position, the depth lines, how the labels truncate, the
 * whole tree opened) are in the story of mds-tree.
 *
 * An `async` item asks for its children (`mdsTreeItemExpand`) and waits: the page answers as a
 * product does, adding them and calling `expand()`, only in the state named `loaded`. A state
 * only an interaction reaches (`play: true`) is brought there by the play function, which checks
 * `expanded` on the item and `disabled` on its label while it waits, not their look.
 */
interface ItemState {
  state: string;
  play?: boolean;
  item: Record<string, string | boolean>;
  children?: string[];
  nested?: boolean;
  actions?: boolean;
  loads?: boolean;
}

const technical = { label: 'Area tecnica' };
const offices = ['Edilizia privata', 'Lavori pubblici'];

const itemStates: ItemState[] = [
  { state: 'leaf', item: technical },
  { state: 'leaf with icon', item: { ...technical, icon: 'mi/baseline/desk' } },
  { state: 'branch, closed', item: technical, children: offices },
  { state: 'branch, open', item: { ...technical, expanded: true }, children: offices },
  {
    state: 'branch with icon, open',
    item: { ...technical, icon: 'mi/baseline/desk', expanded: true },
    children: offices,
  },
  {
    state: 'nested, in an open branch',
    item: { label: 'Edilizia privata', expanded: true },
    children: ['Permessi di costruire', 'Segnalazioni certificate'],
    nested: true,
  },
  { state: 'actions on hover', item: technical, children: offices, actions: true },
  {
    state: 'actions always shown',
    item: { ...technical, actions: 'visible' },
    children: offices,
    actions: true,
  },
  { state: 'loads on demand, closed', item: { ...technical, async: true } },
  {
    state: 'long label',
    item: {
      label: "Sportello unico per le imprese e per l'edilizia residenziale privata",
    },
    children: offices,
  },
  { state: 'opened by its toggle', play: true, item: technical, children: offices },
  { state: 'opened by its label', play: true, item: technical, children: offices },
  { state: 'opened with Enter', play: true, item: technical, children: offices },
  {
    state: 'closed by its toggle',
    play: true,
    item: { ...technical, expanded: true },
    children: offices,
  },
  { state: 'loading on demand', play: true, item: { ...technical, async: true } },
  { state: 'loaded on demand', play: true, item: { ...technical, async: true }, loads: true },
];

/** What the page does when an item asks for its children: it adds them and opens the item. */
const loadBranch = (event: CustomEvent<MdsTreeItemEventDetail>) => {
  const { element } = event.detail;
  offices.forEach((label) => {
    const child = document.createElement('mds-tree-item');
    child.setAttribute('label', label);
    element.appendChild(child);
  });
  void element.expand();
};

/** The actions of a row, icon-only buttons named for the item they act on. */
const rowActions = (label: string) => [
  <mds-button
    key="allega"
    slot="action"
    icon="mi/baseline/attach-file"
    variant="primary"
    tone="text"
    aria-label={`Allega a ${label}`}
  ></mds-button>,
  <mds-button
    key="altro"
    slot="action"
    icon="mi/baseline/more-vert"
    variant="primary"
    tone="text"
    aria-label={`Altre azioni su ${label}`}
  ></mds-button>,
];

const TemplateStates = () => (
  <StatesGrid>
    {itemStates.map(({ state, play, item, children, nested, actions, loads }) => {
      const subject = (
        <mds-tree-item {...item}>
          {actions && rowActions(item.label as string)}
          {children?.map((label) => (
            <mds-tree-item key={label} label={label}></mds-tree-item>
          ))}
        </mds-tree-item>
      );
      return (
        <StateCell key={state} state={state} play={play}>
          <mds-tree
            label="Uffici del comune"
            ref={(element) =>
              loads && element?.addEventListener('mdsTreeItemExpand', loadBranch as EventListener)
            }
          >
            {nested ? (
              <mds-tree-item label="Area tecnica" expanded>
                {subject}
                <mds-tree-item label="Lavori pubblici"></mds-tree-item>
              </mds-tree-item>
            ) : (
              subject
            )}
            <mds-tree-item label="Area amministrativa"></mds-tree-item>
          </mds-tree>
        </StateCell>
      );
    })}
  </StatesGrid>
);

/** The item of a cell in the state, once every Magma element of the cell has loaded. */
const loadedItem = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  return cell.querySelector('mds-tree > mds-tree-item') as HTMLMdsTreeItemElement;
};

/** The two buttons of an item, which it listens on (not its host): the toggle and the label. */
const toggleButton = (item: HTMLMdsTreeItemElement) =>
  item.shadowRoot!.querySelector('.toggle-icon mds-button') as HTMLMdsButtonElement;
const labelButton = (item: HTMLMdsTreeItemElement) =>
  item.shadowRoot!.querySelector('.label-action') as HTMLMdsButtonElement;

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const byToggle = await loadedItem(canvasElement, 'opened by its toggle');
  toggleButton(byToggle).click();
  const byLabel = await loadedItem(canvasElement, 'opened by its label');
  labelButton(byLabel).click();
  const enter = await loadedItem(canvasElement, 'opened with Enter');
  labelButton(enter).dispatchEvent(
    new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', bubbles: true, cancelable: true }),
  );
  const closed = await loadedItem(canvasElement, 'closed by its toggle');
  toggleButton(closed).click();
  // an item still without children shows no toggle: its label is what a person clicks
  const loading = await loadedItem(canvasElement, 'loading on demand');
  labelButton(loading).click();
  const loaded = await loadedItem(canvasElement, 'loaded on demand');
  labelButton(loaded).click();

  // the properties, not the attributes: Stencil reflects them on the next frame, and a hidden
  // page draws no frame
  await waitFor(() => expect(byToggle).toHaveProperty('expanded', true));
  await waitFor(() => expect(byLabel).toHaveProperty('expanded', true));
  await waitFor(() => expect(enter).toHaveProperty('expanded', true));
  await waitFor(() => expect(closed).toHaveProperty('expanded', false));
  // waiting for the page: still closed, its label out of use until the children come
  await waitFor(() => expect(labelButton(loading)).toHaveProperty('disabled', true));
  await waitFor(() => expect(loading).not.toHaveProperty('expanded', true));
  await waitFor(() => expect(loaded).toHaveProperty('expanded', true));
  await waitFor(() => expect(labelButton(loaded)).not.toHaveProperty('disabled', true));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
