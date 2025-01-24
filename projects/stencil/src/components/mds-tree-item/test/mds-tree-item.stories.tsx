import { h } from '@stencil/core'
import { treeIconDictionary, treeAppearanceDictionary } from '@component/mds-tree-item/meta/dictionary'
import { truncateDictionary } from '@dictionary/text'
import { iconsDictionary } from '@dictionary/icon'

export default {
  title: 'UI / Tree / Tree Item',
  argTypes: {
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
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    label: {
      type: { name: 'string' },
      description: 'Specifies where the component should be placed relative to the caller',
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
  <mds-tree>
    <mds-tree-item {...args} label="First element of the tree">
      <mds-button slot="action" icon="mi/baseline/attach-file" variant="primary" tone="quiet" title="Schedule"></mds-button>
      <mds-button slot="action" icon="mi/baseline/more-vert" variant="primary" tone="quiet" title="Options"></mds-button>
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
      <mds-button slot="action" icon="mi/baseline/attach-file" variant="primary" tone="quiet" title="Schedule"></mds-button>
      <mds-button slot="action" icon="mi/baseline/more-vert" variant="primary" tone="quiet" title="Options"></mds-button>
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

const TemplateOrganizationalChart = ({ ...args }) =>
  <mds-tree toggle="chevron" toggle-position="right">
    <mds-tree-item {...args} label="Comune di Rimini" icon="mgg/historic-building">
      <mds-tree-item {...args} label="Settore Affari Generali" icon="mdi/handshake">
        <mds-tree-item {...args} label="Servizio Affari Generali" icon="mi/baseline/home-repair-service">
          <mds-tree-item {...args} label="Segreteria" icon="mi/baseline/desk">
            <mds-tree-item {...args} label="Andrea Rossi" icon="mi/baseline/person"></mds-tree-item>
            <mds-tree-item {...args} label="Mirco Romanelli" icon="mi/baseline/person"></mds-tree-item>
            <mds-tree-item {...args} label="Elone Muschio" icon="mi/baseline/person"></mds-tree-item>
          </mds-tree-item>
          <mds-tree-item {...args} label="Demografici" icon="mi/baseline/desk"></mds-tree-item>
        </mds-tree-item>
      </mds-tree-item>
    </mds-tree-item>
  </mds-tree>

export const Default = Template.bind({})

export const OrganizationalChart = TemplateOrganizationalChart.bind({})
