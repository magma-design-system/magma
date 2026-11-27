import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { MdsTreeItemEventDetail } from 'src/components';
import { buttonIconPositionDictionary } from '@type/button';
import { treeIconDictionary, treeAppearanceDictionary, treeActionsDictionary } from '@type/tree';
import { truncateDictionary } from '@type/text';

export default {
  title: 'UI / Navigation / Tree',
  id: 'ui-tree',
  argTypes: {
    actions: {
      type: { name: 'string' },
      description: 'Show actions on the every tree item on hover or by default',
      options: treeActionsDictionary,
      control: { type: 'select' },
    },
    appearance: {
      type: { name: 'string' },
      description: 'Specifies the horizontal position of the icon displayed in the component',
      options: treeAppearanceDictionary,
      control: { type: 'select' },
    },
    expanded: {
      type: { name: 'boolean' },
      description: 'Specifies if the tree is expanded',
    },
    'toggle-position': {
      type: { name: 'string' },
      description:
        'Specifies the horizontal position of the toggle icon displayed in the component',
      options: buttonIconPositionDictionary,
      control: { type: 'select' },
    },
    toggle: {
      type: { name: 'string' },
      description:
        'Specifies the horizontal position of the toggle icon displayed in the component',
      options: treeIconDictionary,
      control: { type: 'select' },
    },
    truncate: {
      control: { type: 'select' },
      description: 'Specifies if the text shoud be truncated or should behave as a normal text',
      options: truncateDictionary,
    },
  },
};

const Template = ({ ...args }) => (
  <mds-tree {...args}>
    <mds-tree-item label="First element of the tree">
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
      <mds-tree-item label="First children element"></mds-tree-item>
      <mds-tree-item label="Second element"></mds-tree-item>
      <mds-tree-item label="This is the third element children"></mds-tree-item>
      <mds-tree-item label="The fourth and final children">
        <mds-tree-item label="Hello beautiful world"></mds-tree-item>
        <mds-tree-item label="Surpraaaaaise!"></mds-tree-item>
      </mds-tree-item>
      <mds-tree-item label="Surprise! There is a fifth element"></mds-tree-item>
      <mds-tree-item label="And probably a sixth"></mds-tree-item>
    </mds-tree-item>
    <mds-tree-item label="Second element used in this tree">
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
      <mds-tree-item label="First children element"></mds-tree-item>
      <mds-tree-item label="Second element"></mds-tree-item>
      <mds-tree-item label="This is the third element children"></mds-tree-item>
      <mds-tree-item label="The fourth and final children">
        <mds-tree-item label="Hello beautiful world"></mds-tree-item>
        <mds-tree-item label="Surpraaaaaise!"></mds-tree-item>
      </mds-tree-item>
      <mds-tree-item label="Surprise! There is a fifth element"></mds-tree-item>
      <mds-tree-item label="And probably a sixth"></mds-tree-item>
    </mds-tree-item>
  </mds-tree>
);

const TemplateFolder = ({ ...args }) => (
  <mds-tree {...args}>
    <mds-tree-item label="First element of the tree">
      <mds-icon slot="action" name="mi/baseline/attach-file" title="Schedule"></mds-icon>
      <mds-icon slot="action" name="mi/baseline/more-vert" title="Options"></mds-icon>
      <mds-tree-item label="First children element">
        <mds-icon slot="action" name="mi/baseline/attach-file" title="Schedule"></mds-icon>
        <mds-icon slot="action" name="mi/baseline/more-vert" title="Options"></mds-icon>
      </mds-tree-item>
      <mds-tree-item label="Second element">
        <mds-icon slot="action" name="mi/baseline/attach-file" title="Schedule"></mds-icon>
        <mds-icon slot="action" name="mi/baseline/more-vert" title="Options"></mds-icon>
      </mds-tree-item>
      <mds-tree-item label="This is the third element children">
        <mds-icon slot="action" name="mi/baseline/attach-file" title="Schedule"></mds-icon>
        <mds-icon slot="action" name="mi/baseline/more-vert" title="Options"></mds-icon>
      </mds-tree-item>
      <mds-tree-item label="The fourth and final children">
        <mds-icon slot="action" name="mi/baseline/attach-file" title="Schedule"></mds-icon>
        <mds-icon slot="action" name="mi/baseline/more-vert" title="Options"></mds-icon>
        <mds-tree-item label="Hello beautiful world">
          <mds-icon slot="action" name="mi/baseline/attach-file" title="Schedule"></mds-icon>
          <mds-icon slot="action" name="mi/baseline/more-vert" title="Options"></mds-icon>
        </mds-tree-item>
        <mds-tree-item label="Surpraaaaaise!">
          <mds-icon slot="action" name="mi/baseline/attach-file" title="Schedule"></mds-icon>
          <mds-icon slot="action" name="mi/baseline/more-vert" title="Options"></mds-icon>
        </mds-tree-item>
      </mds-tree-item>
      <mds-tree-item label="Surprise! There is a fifth element">
        <mds-icon slot="action" name="mi/baseline/attach-file" title="Schedule"></mds-icon>
        <mds-icon slot="action" name="mi/baseline/more-vert" title="Options"></mds-icon>
      </mds-tree-item>
      <mds-tree-item label="And probably a sixth">
        <mds-icon slot="action" name="mi/baseline/attach-file" title="Schedule"></mds-icon>
        <mds-icon slot="action" name="mi/baseline/more-vert" title="Options"></mds-icon>
      </mds-tree-item>
    </mds-tree-item>
  </mds-tree>
);

export const Default = {
  render: Template,
};

export const ComplexMenu = {
  render: Template,

  args: {
    toggle: 'chevron',
    'toggle-position': 'right',
    appearance: 'none',
    style: {
      '--mds-tree-label-hover-background': 'rgb(var(--magma-wash-base))',
    },
  },
};

export const FolderMenu = {
  render: TemplateFolder,

  args: {
    actions: 'visible',
    toggle: 'folder',
  },
};

/**
 * Every state of the tree once the story has opened (#1440, @fixture/states): closed and open as
 * a whole (`expanded` on the tree), without the depth lines, with the folder toggle closed and
 * open, the toggle on the right, the actions of the items always shown, and the long labels
 * truncated on a line, clamped to two or wrapped. Each tree is named by its `label`, as a product
 * names it. The states an item has of its own (leaf or branch, its icon, its actions, opened or
 * closed by the user, loaded on demand) are in the story of mds-tree-item.
 *
 * The tree hands its props to the items that arrive later too, a branch the page loads on demand:
 * the page answers `mdsTreeItemExpand` as a product does, adding the children and calling
 * `expand()`. A state only an interaction reaches (`play: true`) is brought there by the play
 * function, which checks `expanded` and `toggle` on the items, not their look.
 */
interface TreeNode {
  label: string;
  async?: boolean;
  children?: TreeNode[];
}

interface TreeState {
  state: string;
  play?: boolean;
  tree: Record<string, string | boolean>;
  nodes: TreeNode[];
  actions?: boolean;
  loads?: boolean;
}

const offices: TreeNode[] = [
  {
    label: 'Area tecnica',
    children: [
      {
        label: 'Edilizia privata',
        children: [{ label: 'Permessi di costruire' }, { label: 'Segnalazioni certificate' }],
      },
      { label: 'Lavori pubblici' },
    ],
  },
  { label: 'Area amministrativa', children: [{ label: 'Protocollo' }, { label: 'Ragioneria' }] },
];

const longOffices: TreeNode[] = [
  {
    label:
      "Sportello unico per le imprese e per l'edilizia residenziale privata, con ricevimento del pubblico su appuntamento nei giorni di apertura degli uffici comunali",
    children: [
      { label: 'Ufficio per il rilascio dei permessi di costruire e delle sanatorie' },
      { label: 'Ufficio controlli sulle segnalazioni certificate di inizio lavori' },
    ],
  },
];

const onDemand: TreeNode[] = [
  { label: 'Area tecnica', async: true },
  { label: 'Area amministrativa', children: [{ label: 'Protocollo' }, { label: 'Ragioneria' }] },
];

const treeStates: TreeState[] = [
  { state: 'closed', tree: { label: 'Uffici del comune' }, nodes: offices },
  { state: 'open', tree: { label: 'Uffici del comune', expanded: true }, nodes: offices },
  {
    state: 'without depth lines, open',
    tree: { label: 'Uffici del comune', expanded: true, appearance: 'none' },
    nodes: offices,
  },
  {
    state: 'folder toggle, closed',
    tree: { label: 'Uffici del comune', toggle: 'folder' },
    nodes: offices,
  },
  {
    state: 'folder toggle, open',
    tree: { label: 'Uffici del comune', toggle: 'folder', expanded: true },
    nodes: offices,
  },
  {
    state: 'toggle on the right, open',
    tree: { label: 'Uffici del comune', 'toggle-position': 'right', expanded: true },
    nodes: offices,
  },
  {
    state: 'actions on hover, open',
    tree: { label: 'Uffici del comune', expanded: true },
    nodes: offices,
    actions: true,
  },
  {
    state: 'actions always shown, open',
    tree: { label: 'Uffici del comune', expanded: true, actions: 'visible' },
    nodes: offices,
    actions: true,
  },
  {
    state: 'long labels on a line',
    tree: { label: 'Sportelli del comune', expanded: true },
    nodes: longOffices,
  },
  {
    state: 'long labels on two lines',
    tree: { label: 'Sportelli del comune', expanded: true, truncate: 'all' },
    nodes: longOffices,
  },
  {
    state: 'long labels wrapped',
    tree: { label: 'Sportelli del comune', expanded: true, truncate: 'none' },
    nodes: longOffices,
  },
  {
    state: 'folder toggle, a branch loaded on demand',
    play: true,
    tree: { label: 'Uffici del comune', toggle: 'folder' },
    nodes: onDemand,
    loads: true,
  },
];

/** What the page does when an item asks for its children: it adds them and opens the item. */
const loadBranch = (event: CustomEvent<MdsTreeItemEventDetail>) => {
  const { element } = event.detail;
  ['Edilizia privata', 'Lavori pubblici'].forEach((label) => {
    const child = document.createElement('mds-tree-item');
    child.setAttribute('label', label);
    element.appendChild(child);
  });
  void element.expand();
};

/** The items of a branch, with the actions of a row when the state shows them. */
const renderNodes = (nodes: TreeNode[], actions?: boolean) =>
  nodes.map(({ label, async, children }) => (
    <mds-tree-item key={label} label={label} async={async}>
      {actions && [
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
      ]}
      {children && renderNodes(children, actions)}
    </mds-tree-item>
  ));

const TemplateStates = () => (
  <StatesGrid>
    {treeStates.map(({ state, play, tree, nodes, actions, loads }) => (
      <StateCell key={state} state={state} play={play}>
        <mds-tree
          {...tree}
          ref={(element) =>
            loads && element?.addEventListener('mdsTreeItemExpand', loadBranch as EventListener)
          }
        >
          {renderNodes(nodes, actions)}
        </mds-tree>
      </StateCell>
    ))}
  </StatesGrid>
);

/** The items of a cell, by label, once every Magma element of the cell has loaded. */
const loadedTree = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  return (label: string) =>
    Array.from(cell.querySelectorAll('mds-tree-item')).find(
      (item) => item.getAttribute('label') === label,
    ) as HTMLMdsTreeItemElement;
};

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const loaded = await loadedTree(canvasElement, 'folder toggle, a branch loaded on demand');
  // the item listens on its inner toggle button, not on its host
  const toggle = loaded('Area tecnica').shadowRoot!.querySelector('.toggle-icon mds-button');
  (toggle as HTMLElement).click();

  // the properties, not the attributes: Stencil reflects them on the next frame, and a hidden
  // page draws no frame
  await waitFor(() => expect(loaded('Area tecnica')).toHaveProperty('expanded', true));
  await waitFor(() => expect(loaded('Edilizia privata')).toHaveProperty('toggle', 'folder'));
  await waitFor(() => expect(loaded('Lavori pubblici')).toHaveProperty('toggle', 'folder'));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
