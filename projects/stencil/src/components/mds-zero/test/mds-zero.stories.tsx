import { h } from '@stencil/core'

export default {
  title: 'UI / Zero',
}

const Template = args =>
  <mds-zero {...args}>
    <mds-img src="./icon-newspaper-03.png" class="w-full max-w-[280px]"/>
    <mds-text typography="h5" slot="content">Crea il tuo primo articolo</mds-text>
    <mds-text typography="detail" slot="content">Contribuisci alla creazione contenuti editoriali di riferimento per la pubblica amminstrazione in Italia.</mds-text>
    <mds-button slot="action" size="lg" class="mobile:w-full">Nuovo</mds-button>
  </mds-zero>

export const Default = Template.bind({})
