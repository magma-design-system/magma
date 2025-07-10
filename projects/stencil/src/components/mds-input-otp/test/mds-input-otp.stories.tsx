import { h } from '@stencil/core'

import { MdsInputOtpInterface } from '../mds-input-otp'
import { useState } from 'react'

export default {
  title: 'Form / OTP',
  argTypes: {
    length: {
      type: { name: 'number' },
      description: 'Number of digits in the OTP code',
    },
    autosubmit: {
      type: { name: 'boolean' },
      description:
        'Automatically submits the form when the OTP code is complete',
    },
  },
}

const Template = (args: MdsInputOtpInterface) => (
  <mds-input-otp {...args}></mds-input-otp>
)

export const Default = {
  render: Template,
}

const FormIntegrationTemplate = (args: MdsInputOtpInterface) => {
  return (
    <div class="grid gap-600">
      <form
        class="grid gap-400"
        id="mds-icon-fi"
        name="mds-icon-fi"
        onSubmit={(e: SubmitEvent) => {
          e.preventDefault()
          console.info('Submitted', e)
          const form = document.querySelector('form') as HTMLFormElement
          const span = document.querySelector(
            'span.input-value',
          ) as HTMLSpanElement
          span.innerText =
            form['mds-input-otp'].value !== ''
              ? form['mds-input-otp'].value
              : 'Empty'
        }}
      >
        <mds-input-otp {...args}></mds-input-otp>
        <mds-button
          class="w-min"
          type="submit"
          onClick={(e: MouseEvent) => {
            e.preventDefault()
          }}
          disabled={args.autosubmit}
        >
          {args.autosubmit ? 'autosubmit enabled' : 'Submit'}
        </mds-button>
        <mds-text variant="code">
          Input value taken from form element:{' '}
          <span class="inline-flex input-value rounded text-tone-neutral-01 bg-tone-neutral-08 px-200 py-50">
            Empty
          </span>
        </mds-text>
      </form>
    </div>
  )
}

const FormAutoSubmitTemplate = (args: MdsInputOtpInterface) => {
  const [isDisabled, setDisabled] = useState(true)
  const [isAwaiting, setAwait] = useState(false)
  const [isSubmitted, setSubmitted] = useState(false)
  const [buttonLabel, setLabel] = useState('Submit OTP')
  return (
    <div class="grid gap-600">
      <form
        class="grid gap-600 max-w-[370px]"
        id="mds-icon-fi"
        name="mds-icon-fi"
        onSubmit={(e: SubmitEvent) => {
          e.preventDefault()
          setAwait(true)
          setLabel('Submitting...')
          setDisabled(false)
          setTimeout(() => {
            setSubmitted(true)
            setAwait(false)
            setLabel('Submitted successfully')
          }, 2000)
          const form = document.querySelector('form') as HTMLFormElement
          const span = document.querySelector(
            'span.input-value',
          ) as HTMLSpanElement
          span.innerText =
            form['mds-input-otp'].value !== ''
              ? form['mds-input-otp'].value
              : 'Empty'
        }}
      >
        <mds-input-otp {...args} class="justify-center"></mds-input-otp>
        <mds-button
          disabled={isDisabled === true ? true : undefined}
          icon={isSubmitted ? 'mi/baseline/done' : ''}
          variant={isSubmitted ? 'success' : 'primary'}
          await={isAwaiting}
          size="lg"
          type="submit"
          onClick={(e: MouseEvent) => {
            e.preventDefault()
          }}
        >
          {buttonLabel}
        </mds-button>
        <mds-text variant="code">
          Input value taken from form element:{' '}
          <span class="inline-flex input-value rounded text-tone-neutral-01 bg-tone-neutral-08 px-200 py-50">
            Empty
          </span>
        </mds-text>
      </form>
    </div>
  )
}

export const FormIntegration = {
  render: FormIntegrationTemplate,

  args: {
    name: 'mds-input-otp',
    autosubmit: false,
  },
}

export const AutoSubmit = {
  render: FormAutoSubmitTemplate,

  args: {
    name: 'mds-input-otp',
    autosubmit: true,
  },
}
