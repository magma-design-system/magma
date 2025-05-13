import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'
import {
  buttonVariantDictionary,
  buttonSizeDictionary,
  buttonToneVariantDictionary,
} from '@dictionary/button'
import { directionDictionary } from '../meta/dictionary'
import { useState } from 'react'

export default {
  title: 'UI / Radial Menu',
  argTypes: {
    'angle-start': {
      type: { name: 'number' },
      description: 'Specifies the starting angle of the menu',
    },
    'angle-end': {
      type: { name: 'number' },
      description: 'Specifies the ending angle of the menu',
    },
    radius: {
      type: { name: 'number' },
      control: { type: 'range', min: 1, max: 20 },
      description: 'Specifies the radius of the menu',
    },
    direction: {
      type: { name: 'string' },
      description: 'Specifies the direction of the menu elements',
      options: directionDictionary,
      control: { type: 'select' },
    },
    opened: {
      type: { name: 'boolean' },
      description: 'Specifies if the menu is opened or not',
    },
    disc: {
      type: { name: 'boolean' },
      description: 'Specifies if the menu has a disc beneath or not',
    },
    backdrop: {
      type: { name: 'boolean' },
      description: 'Specifies if the component has a backdrop background',
    },
    icon: {
      type: { name: 'string' },
      description: 'The icon displayed in the button',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the color variant for the button',
      options: buttonVariantDictionary,
      control: { type: 'select' },
    },
    size: {
      type: { name: 'string' },
      description: 'Specifies the size for the button',
      options: buttonSizeDictionary,
      control: { type: 'select' },
    },
    tone: {
      type: { name: 'string' },
      description: 'Specifies the tone variant for the button',
      options: buttonToneVariantDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <div class="h-dvh min-h-[600px] flex items-center justify-center">
    { args.interaction === 'rightclick' && <mds-banner class="max-w-4xl" variant='info' tone="strong" icon="mi/baseline/list-alt" headline="Variant with contextual menu">
      <mds-text>Use <b>Right click</b> of the mouse to trigger the component</mds-text>
    </mds-banner> }
    <mds-radial-menu {...args}>
      <mds-radial-menu-item icon="mi/baseline/favorite" tooltip="Add to favorites" variant="dark" tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mi/baseline/email" tooltip="Send email" variant="dark"tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mi/baseline/insert-drive-file" tooltip="New document" variant="dark"tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mi/baseline/info" tooltip="Show infos" variant="dark" tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mi/baseline/print" tooltip="Print" variant="dark" tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mi/baseline/ios-share" tooltip="Share" variant="dark" tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mi/baseline/edit" tooltip="Edit metadata" variant="dark" tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mi/baseline/delete" tooltip="Delete" variant="error"></mds-radial-menu-item>
    </mds-radial-menu>
  </div>

const TemplateImage = args =>
  <div class="h-dvh min-h-[600px] flex items-center justify-center">
    <div class="relative w-full max-w-[320px]">
      <mds-img src="/book-cover-10.webp" class="rounded-xl shadow-lg-sharp"></mds-img>
      <mds-radial-menu {...args} class="absolute top-600 right-600">
        <mds-radial-menu-item icon="mi/baseline/favorite" variant="light" tooltip="Add to favorites"></mds-radial-menu-item>
        <mds-radial-menu-item icon="mi/baseline/ios-share" tooltip="Share" variant="light"></mds-radial-menu-item>
        <mds-radial-menu-item icon="mi/baseline/delete" tooltip="Delete" variant="error"></mds-radial-menu-item>
      </mds-radial-menu>
    </div>
  </div>

const TemplateNumericOrder = args =>
  <div class="h-dvh min-h-[600px] flex items-center justify-center">
    { args.interaction === 'rightclick' && <mds-banner variant='info' tone="strong" icon="mi/baseline/list-alt" headline="Variant with contextual menu">
      <mds-text>Use <b>Right click</b> of the mouse to trigger the component</mds-text>
    </mds-banner> }
    <mds-radial-menu {...args}>
      <mds-radial-menu-item icon="mdi/numeric-1" tooltip="Item number 1" variant="info" tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mdi/numeric-2" tooltip="Item number 2" variant="info" tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mdi/numeric-3" tooltip="Item number 3" variant="success" tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mdi/numeric-4" tooltip="Item number 4" variant="success" tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mdi/numeric-5" tooltip="Item number 5" variant="warning" tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mdi/numeric-6" tooltip="Item number 6" variant="warning" tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mdi/numeric-7" tooltip="Item number 7" variant="error" tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mdi/numeric-8" tooltip="Item number 8" variant="error"></mds-radial-menu-item>
    </mds-radial-menu>
  </div>

const TemplateAddRemoveItems = args => {
  const [count, setCount] = useState(6)
  return (
    <div class="h-dvh min-h-[600px] flex items-center justify-center relative">
      <div class="absolute top-600 left-600 flex gap-400 items-baseline">
        <mds-button onClick={() => setCount(count + 1) }>Add</mds-button>
        <mds-button onClick={() => setCount(count - 1) } disabled={count <= 1} variant="error">Remove</mds-button>
        <mds-text>Items count: {count}</mds-text>
      </div>
      <mds-radial-menu {...args}>
        {Array.from(Array(count).keys()).map(index => <mds-radial-menu-item slot="item" key={index} icon="mi/baseline/favorite" tooltip={`Element ${index + 1}`} variant="dark" tone="weak"></mds-radial-menu-item>)}
      </mds-radial-menu>
    </div>
  )
}

export const Default = TemplateNumericOrder.bind({})

export const ImageOptions = TemplateImage.bind({})
ImageOptions.args = {
  'angle-start': 180,
  'angle-end': 270,
  radius: 5,
  direction: 'counterclockwise',
}

export const ContextualMenu = Template.bind({})
ContextualMenu.args = {
  interaction: 'rightclick',
  disc: true,
}

export const AddRemoveItems = TemplateAddRemoveItems.bind({})
AddRemoveItems.args = {
  radius: 5,
  opened: true,
}
