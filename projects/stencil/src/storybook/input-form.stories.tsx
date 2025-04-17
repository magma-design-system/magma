
import { h } from '@stencil/core'

export default {
  title: 'Form',
}

/*
not supported name attribute
<mds-input-date name="birthDate"></mds-input-date>
<mds-input-range min={0} max={100} name="coolness">Coolness</mds-input-range>
*/

const Template = () =>
  <form class="grid gap-600 max-w-screen-tablet m-auto">
    <div class="grid">
      <mds-text typography='h5'>Form example</mds-text>
      <mds-text typography='detail'>This is a form example with all released components.</mds-text>
    </div>
    <mds-hr></mds-hr>
    <div class="grid gap-600">
      <mds-input-field label="Full name">
        <mds-input type="text" placeholder="Es: Mario Rossi" maxlength={50} name="fullName" required></mds-input>
      </mds-input-field>
      <mds-input-field label="Fiscal code">
        <mds-input type="cf" placeholder="Es: MROBRS86R14D788J" name="cf" required></mds-input>
      </mds-input-field>
      <mds-input-field label="Birth date">
        <mds-input-date></mds-input-date>
      </mds-input-field>
      <mds-input-field label="Bigraphy">
        <mds-input type="textarea" placeholder="Es: I would like to save the world, but first I'll try to save myself" name="bigraphy" maxlength={250}></mds-input>
      </mds-input-field>
      <mds-input-field label="Birth date">
        <mds-input-select name="sex">
          <option value="1">Male</option>
          <option value="2">Female</option>
          <option value="3">Chair</option>
          <option value="4">Not specified</option>
        </mds-input-select>
      </mds-input-field>
      <mds-input-range min={0} max={100}>Coolness</mds-input-range>
      <mds-input-switch type="switch" explicit size="sm" name="isSuperHero">Super hero</mds-input-switch>
      <mds-input-switch type="checkbox" explicit size="sm" name="isSellPrivacy" icon="mi/baseline/privacy-tip">Sell your privacy to out best offer without gain nothing</mds-input-switch>
    </div>
  </form>

export const MainExample = Template.bind({})
