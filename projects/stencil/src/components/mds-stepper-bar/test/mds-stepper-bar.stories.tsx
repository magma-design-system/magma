import { h } from '@stencil/core'

export default {
  title: 'UI / Stepper Bar',
  argTypes: {
    'items-done': {
      type: { name: 'number' },
      description: 'Sets the current item to the given index: 0 is none selected, 1 is the first item selected, last number + 1 is all items checked',
    },
  },
}

const Template = args =>
  <mds-stepper-bar {...args}>
    <mds-stepper-bar-item badge step icon-checked="mi/baseline/done" icon="mi/baseline/person" text="Nuovo account">
      <div class="min-h-80 flex rounded-lg items-center justify-center bg-label-amaranth-10 text-label-amaranth-04">
        <mds-text>Nuovo account</mds-text>
      </div>
    </mds-stepper-bar-item>
    <mds-stepper-bar-item badge step icon-checked="mi/baseline/done" icon="mi/baseline/badge" text="Dati personali">
      <div class="min-h-80 flex rounded-lg items-center justify-center bg-label-blue-10 text-label-blue-04">
        <mds-text>Dati personali</mds-text>
      </div>
    </mds-stepper-bar-item>
    <mds-stepper-bar-item badge step icon-checked="mi/baseline/done" icon="mi/round/email" text="Impostazioni newsletter">
      <div class="min-h-80 flex rounded-lg items-center justify-center bg-label-green-10 text-label-green-04">
        <mds-text>Impostazioni newsletter</mds-text>
      </div>
    </mds-stepper-bar-item>
    <mds-stepper-bar-item badge step icon-checked="mi/baseline/done" icon="mi/baseline/lock-open" text="Attivazione account">
      <div class="min-h-80 flex rounded-lg items-center justify-center bg-label-orange-10 text-label-orange-04">
        <mds-text>Attivazione account</mds-text>
      </div>
    </mds-stepper-bar-item>
    <mds-stepper-bar-item badge step icon-checked="mi/baseline/done" icon="mi/baseline/login" text="Accedi">
      <div class="min-h-80 flex rounded-lg items-center justify-center bg-label-violet-10 text-label-violet-04">
        <mds-text>Accedi</mds-text>
      </div>
    </mds-stepper-bar-item>
    <mds-stepper-bar-item badge step icon-checked="mi/baseline/done" icon="mi/baseline/done" text="Finito">
      <div class="min-h-80 flex rounded-lg items-center justify-center bg-label-sky-10 text-label-sky-04">
        <mds-text>Finito</mds-text>
      </div>
    </mds-stepper-bar-item>
  </mds-stepper-bar>

export const Default = Template.bind({})
export const Select = Template.bind({})
Select.args = {
  'items-done': 2,
}
