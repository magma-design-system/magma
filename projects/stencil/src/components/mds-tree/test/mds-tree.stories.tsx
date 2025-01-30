import { h } from '@stencil/core'
import { buttonIconPositionDictionary } from '@dictionary/button'
import { treeIconDictionary, treeAppearanceDictionary, treeActionsDictionary } from '@dictionary/tree'
import { truncateDictionary } from '@dictionary/text'

export default {
  title: 'UI / Tree',
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
      description: 'Specifies the horizontal position of the toggle icon displayed in the component',
      options: buttonIconPositionDictionary,
      control: { type: 'select' },
    },
    toggle: {
      type: { name: 'string' },
      description: 'Specifies the horizontal position of the toggle icon displayed in the component',
      options: treeIconDictionary,
      control: { type: 'select' },
    },
    truncate: {
      control: { type: 'select' },
      description: 'Specifies if the text shoud be truncated or should behave as a normal text',
      options: truncateDictionary,
    },
  },
}

const Template = ({ ...args }) =>
  <mds-tree {...args}>
    <mds-tree-item label="First element of the tree">
      <mds-button slot="action" icon="mi/baseline/attach-file" variant="primary" tone="quiet" title="Schedule"></mds-button>
      <mds-button slot="action" icon="mi/baseline/more-vert" variant="primary" tone="quiet" title="Options"></mds-button>
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
      <mds-button slot="action" icon="mi/baseline/attach-file" variant="primary" tone="quiet" title="Schedule"></mds-button>
      <mds-button slot="action" icon="mi/baseline/more-vert" variant="primary" tone="quiet" title="Options"></mds-button>
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

export const Default = Template.bind({})
Default.args = {
  label: '1.2.0 - Denominazione, territorio, Circoscrizione di decentralizzazione, Toponomastica',
}
