import { h } from '@stencil/core'
import { buttonIconPositionDictionary } from '@dictionary/button'
import { treeIconDictionary, treeAppearanceDictionary } from '../meta/dictionary'
import { truncateDictionary } from '@dictionary/text'

export default {
  title: 'UI / Tree',
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
    label: {
      type: { name: 'string' },
      description: 'Specifies where the component should be placed relative to the caller',
    },
    'icon-position': {
      type: { name: 'string' },
      description: 'Specifies the horizontal position of the icon displayed in the component',
      options: buttonIconPositionDictionary,
      control: { type: 'select' },
    },
    icon: {
      type: { name: 'string' },
      description: 'Specifies the horizontal position of the icon displayed in the component',
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
    <mds-button slot="action" icon="mi/baseline/explore" variant="dark" tone="quiet"></mds-button>
    <mds-button slot="action" icon="mi/baseline/explore" variant="dark" tone="quiet"></mds-button>
    <mds-tree icon={args.icon} icon-position={args['icon-position']} truncate={args.truncate} label="First children element"></mds-tree>
    <mds-tree icon={args.icon} icon-position={args['icon-position']} truncate={args.truncate} label="Second element"></mds-tree>
    <mds-tree icon={args.icon} icon-position={args['icon-position']} truncate={args.truncate} label="This is the third element children"></mds-tree>
    <mds-tree icon={args.icon} icon-position={args['icon-position']} truncate={args.truncate} label="The fourth and final children">
      <mds-tree icon={args.icon} icon-position={args['icon-position']} truncate={args.truncate} label="Surpraaaaaise!"></mds-tree>
    </mds-tree>
    <mds-tree icon={args.icon} icon-position={args['icon-position']} truncate={args.truncate} label="Surprise! There is a fifth element"></mds-tree>
    <mds-tree icon={args.icon} icon-position={args['icon-position']} truncate={args.truncate} label="And probably a sixth"></mds-tree>
  </mds-tree>

export const Default = Template.bind({})
Default.args = {
  label: '1.2.0 - Denominazione, territorio, Circoscrizione di decentralizzazione, Toponomastica',
}
