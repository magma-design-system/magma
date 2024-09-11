import { h } from '@stencil/core'

// import { animationDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Preferences',
}

const Template = args =>
  <mds-pref {...args}>
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

export const Default = Template.bind({})
Default.args = { }
