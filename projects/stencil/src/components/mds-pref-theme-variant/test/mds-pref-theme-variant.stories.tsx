import { h } from '@stencil/core'
import { themeSchemeDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Preferences / Theme Variant',
  argTypes: {
    name: {
      type: { name: 'string' },
      description: 'Specifies the preference mode',
    },
    scheme: {
      type: { name: 'string' },
      options: themeSchemeDictionary,
      control: { type: 'select' },
      description:
        'Specifies the transition of switching from a theme to another one',
    },
  },
}

const TemplateController = args => <mds-pref-theme-variant {...args} ></mds-pref-theme-variant>

const Template = args => <mds-pref-theme-variant {...args}>
  <mds-pref-theme-variant-item
    label="Default"
    name="default"/>
  <mds-pref-theme-variant-item
    label="Summer"
    name="summer"
    scheme="light"/>
  <mds-pref-theme-variant-item
    label="Twilight"
    name="twilight"/>
</mds-pref-theme-variant>

export const Default = {
  render: TemplateController,
  args: {},
}

export const ThemeList = {
  render: Template,
  args: {},
}
