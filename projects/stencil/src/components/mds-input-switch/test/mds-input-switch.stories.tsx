import { typographyInfoDictionary, typographyVariationsDictionary } from '@dictionary/typography'
import { inputSwitchSizeDictionary } from '../meta/dictionary'
import { iconsDictionary } from '@dictionary/icon'
import { h } from '@stencil/core'

export default {
  title: 'Form / Switch',
  argTypes: {
    autofocus: {
      type: { name: 'boolean' },
      description: 'Sets or returns whether a checkbox should automatically get focus when the page loads',
    },
    checked: {
      type: { name: 'boolean' },
      description: 'Specifies that an <input> element should be pre-selected when the page loads (for type="checkbox" or type="radio")',
    },
    disabled: {
      type: { name: 'boolean' },
      description: 'Sets or returns whether a checkbox is disabled, or not',
    },
    explicit: {
      type: { name: 'boolean' },
      description: 'Sets if the type switch mode shows explicit icons',
    },
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    indeterminate: {
      type: { name: 'boolean' },
      description: 'Sets or returns the indeterminate state of the checkbox',
    },
    name: {
      type: { name: 'string' },
      description: 'Specifies the name of an <input> element',
    },
    size: {
      control: { type: 'select' },
      description: 'Specifies the size for the switch toggle, it works only if attribute "type" is set to "switch"',
      options: inputSwitchSizeDictionary,
      type: { name: 'string' },
    },
    typography: {
      control: { type: 'select' },
      description: 'Specifies the font typography of the element',
      options: typographyInfoDictionary,
      type: { name: 'string' },
    },
    variant: {
      description: 'Specifies the variant for `typography`',
      options: typographyVariationsDictionary,
      control: { type: 'select' },
    },
    type: {
      control: { type: 'select' },
      description: 'Specifies the type of element',
      options: ['switch', 'checkbox', 'radio'],
      type: { name: 'string' },
    },
    value: {
      type: { name: 'string' },
      description: 'Specifies the value of the input element',
    },
  },
}

const Template = args =>
  <mds-input-switch {...args}>Notifiche via e-mail</mds-input-switch>

const TemplateMultiple = args =>
  <form name="form-name" class="grid grid-cols-1 gap-400">
    <mds-input-switch {...args} value="1">Choice A</mds-input-switch>
    <mds-input-switch {...args} value="2">Choice B</mds-input-switch>
    <mds-input-switch {...args} value="2">Choice C</mds-input-switch>
    <mds-input-switch {...args} value="2">Choice D</mds-input-switch>
  </form>

export const Default = Template.bind({})
Default.args = {
  name: 'input-name',
  type: 'switch',
  value: '1',
}

export const Checked = Template.bind({})
Checked.args = {
  checked: true,
  name: 'input-name',
  type: 'switch',
  value: '1',
}

export const Disabled = Template.bind({})
Disabled.args = {
  checked: true,
  disabled: true,
  name: 'input-name',
  type: 'switch',
  value: '1',
}

export const Explicit = Template.bind({})
Explicit.args = {
  explicit: true,
  name: 'input-name',
  type: 'switch',
  value: '1',
}

export const Icon = Template.bind({})
Icon.args = {
  name: 'input-name',
  checked: true,
  icon: 'mi/baseline/check-circle',
  type: 'checkbox',
  value: '1',
}

export const Indeterminate = Template.bind({})
Indeterminate.args = {
  name: 'input-name',
  checked: true,
  indeterminate: true,
  type: 'checkbox',
  value: '1',
}

export const Size = Template.bind({})
Size.args = {
  checked: true,
  size: inputSwitchSizeDictionary[0],
  name: 'input-name',
  type: 'switch',
  value: '1',
}

export const Typography = Template.bind({})
Typography.args = {
  checked: true,
  size: inputSwitchSizeDictionary[0],
  typography: 'caption',
  name: 'input-name',
  type: 'switch',
  value: '1',
}

export const Checkbox = Template.bind({})
Checkbox.args = {
  name: 'checkbox-name',
  type: 'checkbox',
  value: '1',
}

export const Radio = TemplateMultiple.bind({})
Radio.args = {
  name: 'radio-name',
  type: 'radio',
}
