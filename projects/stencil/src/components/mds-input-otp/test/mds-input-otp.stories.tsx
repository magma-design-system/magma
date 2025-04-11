import { h } from '@stencil/core'

import { MdsInputOtpInterface } from '../mds-input-otp'

export default {
  title: 'Form / OTP',
  argTypes: {
    length: {
      type: { name: 'number' },
      description: 'Number of digits in the OTP code',
    },
    autosubmit: {
      type: { name: 'boolean' },
      description: 'Automatically submits the form when the OTP code is complete',
    },
  },
}

const Template = (args: MdsInputOtpInterface) =>
  <mds-input-otp {...args}></mds-input-otp>

export const Default = Template.bind({})

const FormIntegrationTemplate = (args: MdsInputOtpInterface) => {
  return (
    <div class="grid gap-600">
      <form class="grid gap-400" id="mds-icon-fi" name="mds-icon-fi" onSubmit={(e: SubmitEvent) => {
        e.preventDefault()
        console.info('Submitted', e)
        const form = document.querySelector('form') as HTMLFormElement
        const span = document.querySelector('span.input-value') as HTMLSpanElement
        span.innerText = form['mds-input-otp'].value !== '' ? form['mds-input-otp'].value : 'Empty'
      }}>
        <mds-input-otp {...args}></mds-input-otp>
        <mds-button class="w-min" type="submit" onClick={(e: MouseEvent) => { e.preventDefault() }} disabled={args.autosubmit}>
          {args.autosubmit ? 'autosubmit enabled' : 'Submit' }
        </mds-button>
        <mds-text variant="code">
          Input value taken from form element: <span class="inline-flex input-value rounded text-tone-neutral-01 bg-tone-neutral-08 px-200 py-50">Empty</span>
        </mds-text>
      </form>
    </div>
  )
}

export const FormIntegration = FormIntegrationTemplate.bind({})
FormIntegration.args = {
  name: 'mds-input-otp',
  autosubmit: false,
}