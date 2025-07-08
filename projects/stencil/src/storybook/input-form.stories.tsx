import { h } from '@stencil/core'
import { useEffect, useState } from 'react'

export default {
  title: 'Form',
}

/*
not supported name attribute
<mds-input-date name="birthDate"></mds-input-date>
<mds-input-range min={0} max={100} name="coolness">Coolness</mds-input-range>

mds-input-range cannot be required
*/

const Template = () => {
  const [haveBeenJapan, setInJapan] = useState(false)
  useEffect(() => {
    const elEmail = document.querySelector('#email') as HTMLMdsInputElement
    const elInputEmail = document.querySelector(
      '#email mds-input',
    ) as HTMLMdsInputElement
    elEmail.addEventListener('mdsInputBlur', (e: CustomEvent) => {
      const elementValue = (e.target as HTMLMdsInputElement).value
      if (elementValue.length < 3) {
        return
      }
      elInputEmail.setAttribute('await', 'true')
      elEmail.setAttribute('variant', 'primary')
      setTimeout(() => {
        elEmail.setAttribute('variant', 'error')
        elEmail.setAttribute('message', 'Email already present in database')
        elInputEmail.setAttribute('await', 'false')
      }, 2000)
    })
    const elSwitch = document.querySelector(
      '#japan-switch',
    ) as HTMLMdsInputSwitchElement
    elSwitch.addEventListener('mdsInputSwitchChange', (e: CustomEvent) => {
      setInJapan(e.detail.checked)
    })
  }, [])
  return (
    <form class="grid gap-600 max-w-screen-tablet m-auto">
      <div class="grid">
        <mds-text typography="h5">Form example</mds-text>
        <mds-text typography="detail">
          This is a form example with all released components.
        </mds-text>
      </div>
      <mds-hr></mds-hr>
      <div class="grid gap-300">
        <mds-input-field label="Full name">
          <mds-input
            type="text"
            placeholder="Es: Mario Rossi"
            maxlength={50}
            name="fullName"
            required
          ></mds-input>
        </mds-input-field>
        <mds-input-field label="email" id="email">
          <mds-input
            type="email"
            placeholder="Es: used@email.com"
            name="mail"
            required
          ></mds-input>
        </mds-input-field>
        <mds-input-field label="Fiscal code">
          <mds-input
            type="cf"
            placeholder="Es: MROBRS86R14D788J"
            name="cf"
            required
          ></mds-input>
        </mds-input-field>
        <div class="grid gap-x-600 gap-y-300 grid-cols-fit-md">
          <mds-input-field label="temporary code">
            <mds-input
              type="text"
              placeholder="Es: MROBRS86R14D788J"
              name="secretPhrase"
              readonly
              value="BFG9000"
            ></mds-input>
          </mds-input-field>
          <mds-input-field label="Confirm madness">
            <mds-input
              type="text"
              placeholder="Es: MROBRS86R14D788J"
              name="madness"
              disabled
              value="I confirm I'm MAD"
            ></mds-input>
          </mds-input-field>
        </div>
        <div class="grid gap-x-600 gap-y-300 grid-cols-fit-md">
          <mds-input-field label="Birth date">
            <mds-input-date></mds-input-date>
          </mds-input-field>
          <mds-input-field label="Sex">
            <mds-input-select name="sex">
              <option selected value="4">
                Not specified
              </option>
              <option value="1">Male</option>
              <option value="2">Female</option>
              <option value="3">Chair</option>
            </mds-input-select>
          </mds-input-field>
        </div>
        <mds-input-field label="Bigraphy">
          <mds-input
            type="textarea"
            placeholder="Es: I would like to save the world, but first I'll try to save myself"
            name="bigraphy"
            maxlength={350}
          ></mds-input>
        </mds-input-field>
        <mds-input-switch id="japan-switch" size="sm">
          I've been in Japan
        </mds-input-switch>
        {haveBeenJapan && (
          <mds-input-field label="period in japan">
            <mds-input-date-range>
              <mds-input-date slot="start"></mds-input-date>
              <mds-input-date slot="end"></mds-input-date>
            </mds-input-date-range>
          </mds-input-field>
        )}
        <mds-input-range min={0} max={100}>
          Coolness
        </mds-input-range>
        <mds-input-switch
          type="checkbox"
          explicit
          size="sm"
          name="isSellPrivacy"
          icon="mi/baseline/privacy-tip"
        >
          Sell your privacy to our best buyer without gain nothing
        </mds-input-switch>
        <div class="grid gap-x-600 gap-y-300 grid-cols-fit-md">
          <div></div>
          <mds-button type="submit" size="lg">
            Submit
          </mds-button>
        </div>
      </div>
    </form>
  )
}

export const MainExample = {
  render: Template,
}
