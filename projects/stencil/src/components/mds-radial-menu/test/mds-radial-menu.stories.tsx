import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'
import {
  buttonVariantDictionary,
  buttonSizeDictionary,
  buttonToneVariantDictionary,
} from '@dictionary/button'
import { directionDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Radial Menu',
  argTypes: {
    'angle-start': {
      type: { name: 'number' },
      description: 'Specifies the angle start',
    },
    'angle-end': {
      type: { name: 'number' },
      description: 'Specifies the angle end',
    },
    radius: {
      type: { name: 'number' },
      description: 'Specifies the length of the radius in rem',
    },
    disc: {
      type: { name: 'boolean' },
      description: '',
    },
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    direction: {
      type: { name: 'string' },
      description: 'Specifies the direction',
      options: directionDictionary,
      control: { type: 'select' },
    },
    opened: {
      type: { name: 'boolean' },
      description: 'Specifies the opened',
    },
    size: {
      type: { name: 'string' },
      description: 'Specifies the size of the button',
      options: buttonSizeDictionary,
      control: { type: 'select' },
    },
    tone: {
      type: { name: 'string' },
      description: 'Specifies the tone variant of the button',
      options: buttonToneVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the variant of the button',
      options: buttonVariantDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <div class="h-dvh min-h-[600px] flex items-center justify-center -m-600">
    { args.interaction === 'rightclick' && <mds-banner variant='info' tone="strong" icon="mi/baseline/list-alt" headline="Variant with contextual menu">
      <mds-text>Use <b>Right click</b> of the mouse to trigger the component</mds-text>
    </mds-banner> }
    <mds-radial-menu {...args}>
      <mds-radial-menu-item icon="mi/baseline/favorite" tooltip="Add to favorites" variant="dark" tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mi/baseline/email" tooltip="Send email" variant="dark"tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mi/baseline/insert-drive-file" tooltip="New document" variant="dark"tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mi/baseline/info" tooltip="Show infos" variant="dark"tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mi/baseline/print" tooltip="Print" variant="dark"tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mi/baseline/ios-share" tooltip="Share" variant="dark"tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mi/baseline/edit" tooltip="Edit metadata" variant="dark"tone={args.interaction === 'rightclick' ? 'quiet' : 'weak'}></mds-radial-menu-item>
      <mds-radial-menu-item icon="mi/baseline/delete" tooltip="Delete" variant="error"></mds-radial-menu-item>
    </mds-radial-menu>
  </div>

const TemplateImage = args =>
  <div class="h-dvh min-h-[600px] flex items-center justify-center -m-600">
    <div class="relative w-full max-w-[320px]">
      <mds-img src="/book-cover-10.webp" class="rounded-xl shadow-lg-sharp"></mds-img>
      <mds-radial-menu {...args} class="absolute top-600 right-600">
        <mds-radial-menu-item icon="mi/baseline/favorite" variant="light" tooltip="Add to favorites"></mds-radial-menu-item>
        <mds-radial-menu-item icon="mi/baseline/ios-share" tooltip="Share" variant="light"></mds-radial-menu-item>
        <mds-radial-menu-item icon="mi/baseline/delete" tooltip="Delete" variant="error"></mds-radial-menu-item>
      </mds-radial-menu>
    </div>
  </div>

export const Default = Template.bind({})

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
