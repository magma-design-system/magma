import { h } from '@stencil/core'

import { tabSizeDictionary } from '@dictionary/button'

export default {
  title: 'UI / Preferences',
  argTypes: {
    controller: {
      type: { name: 'boolean' },
      description:
        'Sets if the component works as hidden element controller instead as UI element, visible on the DOM',
    },
    size: {
      type: { name: 'string' },
      description: 'Sets the size of the tab item',
      options: tabSizeDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args => (
  <mds-pref {...args}>
    <mds-pref-theme></mds-pref-theme>
    <mds-pref-theme-variant>
      <mds-pref-theme-variant-item name="default"></mds-pref-theme-variant-item>
      <mds-pref-theme-variant-item name="magma"></mds-pref-theme-variant-item>
      <mds-pref-theme-variant-item name="maggioli-editore"></mds-pref-theme-variant-item>
    </mds-pref-theme-variant>
    <mds-pref-contrast></mds-pref-contrast>
    <mds-pref-animation></mds-pref-animation>
    <mds-pref-consumption></mds-pref-consumption>
    <mds-pref-language>
      <mds-pref-language-item code="it"></mds-pref-language-item>
      <mds-pref-language-item code="en"></mds-pref-language-item>
      <mds-pref-language-item code="el"></mds-pref-language-item>
      <mds-pref-language-item code="es"></mds-pref-language-item>
      <mds-pref-language-item code="ja"></mds-pref-language-item>
    </mds-pref-language>
  </mds-pref>
)

const TemplateController = () => (
  <div>
    <mds-text>
      When attribute <mds-text typography="snippet">controller</mds-text> is
      set, <mds-text typography="snippet">mds-pref</mds-text> acts as ad hidden
      element which retrives user preferences from localStorage, it's useful
      when you dont' need to render the component but you need it sets used
      preferences based on localStorage method.
    </mds-text>
    <mds-pref controller>
      <mds-pref-theme></mds-pref-theme>
      <mds-pref-contrast></mds-pref-contrast>
      <mds-pref-animation></mds-pref-animation>
      <mds-pref-consumption></mds-pref-consumption>
      <mds-pref-language>
        <mds-pref-language-item code="it"></mds-pref-language-item>
        <mds-pref-language-item code="en"></mds-pref-language-item>
        <mds-pref-language-item code="el"></mds-pref-language-item>
        <mds-pref-language-item code="es"></mds-pref-language-item>
        <mds-pref-language-item code="ja"></mds-pref-language-item>
      </mds-pref-language>
    </mds-pref>
  </div>
)

export const Default = {
  render: Template,
  args: {},
}

export const Controller = {
  render: TemplateController,
}
