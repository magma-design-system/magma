import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'
import {
  buttonVariantDictionary,
  buttonSizeDictionary,
  buttonToneVariantDictionary,
  buttonTargetDictionary,
  buttonIconPositionDictionary,
} from '@dictionary/button'

export default {
  title: 'UI / Button',
  argTypes: {
    'auto-focus': {
      type: { name: 'boolean' },
      description: 'Specifies if the component is focused when is loaded on the viewport',
    },
    await: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is awaiting to load a response',
    },
    disabled: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is disabled or not',
    },
    href: {
      type: { name: 'string' },
      description: 'Specifies the URL target of the button',
    },
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    'icon-position': {
      type: { name: 'string' },
      description: 'Specifies the horizontal position of the icon displayed in the button',
      options: buttonIconPositionDictionary,
      control: { type: 'select' },
    },
    size: {
      type: { name: 'string' },
      description: 'Specifies the size of the button',
      options: buttonSizeDictionary,
      control: { type: 'select' },
    },
    target: {
      type: { name: 'string' },
      options: buttonTargetDictionary,
      description: 'Specifies the target of the URL, if self or blank',
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
  <mds-button {...args}>
    Conferma azione
  </mds-button>

const TemplateAwait = args =>
  <mds-button {...args}>
    Salvataggio in corso...
  </mds-button>

const TemplateKeyboard = args =>
  <div class="bg-tone-grey-10 p-6 grid gap-6">
    <mds-text>Focus this button with tab before press enter.</mds-text>
    <mds-button {...args}>
      Click me from enter keyborad
    </mds-button>
  </div>

const TemplateIcon = args =>
  <mds-button {...args}/>

export const Default = Template.bind({})

export const AutoFocus = Template.bind({})
AutoFocus.args = {
  'auto-focus': true,
}

export const Await = TemplateAwait.bind({})
Await.args = {
  tone: 'weak',
  await: true,
}

export const Disabled = Template.bind({})
Disabled.args = {
  disabled: true,
}

export const Variant = Template.bind({})
Variant.args = {
  variant: 'success',
}

export const Tone = Template.bind({})
Tone.args = {
  variant: 'success',
  tone: 'weak',
}

export const Size = Template.bind({})
Size.args = {
  size: 'sm',
}

export const Icon = TemplateIcon.bind({})
Icon.args = {
  icon: 'mi/baseline/eco',
  title: 'Pianta un albero',
}

export const IconARIATitle = TemplateIcon.bind({})
IconARIATitle.args = {
  icon: 'mi/baseline/eco',
  'aria-label': 'Pianta un albero',
}

export const IconPosition = Template.bind({})
IconPosition.args = {
  'icon-position': 'right',
  icon: 'mi/baseline/eco',
}

export const KeyboardPress = TemplateKeyboard.bind({})
KeyboardPress.args = {
  onClick: () => { alert('Button clicked') },
}

export const Href = Template.bind({})
Href.args = {
  href: 'http://www.maggioli.it',
}

export const Target = Template.bind({})
Target.args = {
  href: 'http://www.maggioli.it',
  target: 'blank',
}
