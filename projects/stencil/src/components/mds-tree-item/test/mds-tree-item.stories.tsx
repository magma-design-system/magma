import { h } from '@stencil/core'
import { treeIconDictionary } from '@dictionary/tree'
import { iconsDictionary } from '@dictionary/icon'
import { MdsTreeItemEventDetail } from 'src/components'
import { useEffect } from 'react'

export default {
  title: 'UI / Tree / Tree Item',
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
}

const Template = ({ ...args }) => (
  <mds-tree>
    <mds-tree-item {...args} label="First element of the tree">
      <mds-button
        slot="action"
        icon="mi/baseline/attach-file"
        variant="primary"
        tone="quiet"
        title="Schedule"
      ></mds-button>
      <mds-button
        slot="action"
        icon="mi/baseline/more-vert"
        variant="primary"
        tone="quiet"
        title="Options"
      ></mds-button>
      <mds-tree-item {...args} label="First children element"></mds-tree-item>
      <mds-tree-item {...args} label="Second element"></mds-tree-item>
      <mds-tree-item
        {...args}
        label="This is the third element children"
      ></mds-tree-item>
      <mds-tree-item {...args} label="The fourth and final children">
        <mds-tree-item {...args} label="Hello beautiful world"></mds-tree-item>
        <mds-tree-item {...args} label="Surpraaaaaise!"></mds-tree-item>
      </mds-tree-item>
      <mds-tree-item
        {...args}
        label="Surprise! There is a fifth element"
      ></mds-tree-item>
      <mds-tree-item {...args} label="And probably a sixth"></mds-tree-item>
    </mds-tree-item>
    <mds-tree-item {...args} label="Second element used in this tree">
      <mds-button
        slot="action"
        icon="mi/baseline/attach-file"
        variant="primary"
        tone="quiet"
        title="Schedule"
      ></mds-button>
      <mds-button
        slot="action"
        icon="mi/baseline/more-vert"
        variant="primary"
        tone="quiet"
        title="Options"
      ></mds-button>
      <mds-tree-item {...args} label="First children element"></mds-tree-item>
      <mds-tree-item {...args} label="Second element"></mds-tree-item>
      <mds-tree-item
        {...args}
        label="This is the third element children"
      ></mds-tree-item>
      <mds-tree-item {...args} label="The fourth and final children">
        <mds-tree-item {...args} label="Hello beautiful world"></mds-tree-item>
        <mds-tree-item {...args} label="Surpraaaaaise!"></mds-tree-item>
      </mds-tree-item>
      <mds-tree-item
        {...args}
        label="Surprise! There is a fifth element"
      ></mds-tree-item>
      <mds-tree-item {...args} label="And probably a sixth"></mds-tree-item>
    </mds-tree-item>
  </mds-tree>
)

const TemplateAsync = ({ ...args }) => {
  // Simulate async request
  useEffect(() => {
    const treeItemElement = document.querySelectorAll('.mds-tree-item')?.[0]
    if (treeItemElement) {
      treeItemElement.addEventListener(
        'mdsTreeItemExpand',
        (event: CustomEvent<MdsTreeItemEventDetail>) => {
          const { element } = event.detail
          if (!element.async) return
          setTimeout(() => {
            element.expand()
            element.async = false
          }, 3000)
        },
      )
    }
  }, [])

  return (
    <mds-tree toggle="chevron" {...args}>
      <mds-tree-item
        async
        class="mds-tree-item"
        {...args}
        label="Segreteria"
        icon="mi/baseline/desk"
      >
        <mds-tree-item
          {...args}
          label="Genoveffo Baci"
          icon="mi/baseline/person"
        ></mds-tree-item>
        <mds-tree-item
          {...args}
          label="Donaldo Trombetta"
          icon="mi/baseline/person"
        ></mds-tree-item>
        <mds-tree-item
          {...args}
          label="Elone Muschio"
          icon="mi/baseline/person"
        ></mds-tree-item>
        <mds-tree-item
          {...args}
          label="Andrew Mountflower"
          icon="mi/baseline/person"
        ></mds-tree-item>
        <mds-tree-item
          {...args}
          label="Super Mauro Bros"
          icon="mi/baseline/person"
        ></mds-tree-item>
      </mds-tree-item>
    </mds-tree>
  )
}

export const Default = {
  render: Template,
}
export const AsyncRequest = {
  render: TemplateAsync,
}
