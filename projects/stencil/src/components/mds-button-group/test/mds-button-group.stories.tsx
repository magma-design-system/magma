import { h } from '@stencil/core'

export default {
  title: 'UI / Button group',
}

const Template = args => (
  <mds-button-group {...args}>
    <mds-button
      icon="mi/baseline/text-format"
      variant="dark"
      tone="quiet"
    ></mds-button>
    <mds-button
      icon="mi/baseline/text-rotate-up"
      variant="dark"
      tone="quiet"
    ></mds-button>
    <mds-button
      icon="mi/baseline/wrap-text"
      variant="dark"
      tone="quiet"
    ></mds-button>
  </mds-button-group>
)

const TemplateComplex = args => (
  <div>
    <mds-button-group {...args}>
      <mds-button
        icon="mi/baseline/text-format"
        variant="dark"
        tone="quiet"
      ></mds-button>
      <mds-button
        icon="mi/baseline/text-rotate-up"
        variant="dark"
        tone="quiet"
      ></mds-button>
      <mds-button
        icon="mi/baseline/wrap-text"
        variant="dark"
        tone="quiet"
      ></mds-button>
    </mds-button-group>
  </div>
)

export const Default = {
  render: Template,
}
export const ComplexBar = {
  render: TemplateComplex,
}
