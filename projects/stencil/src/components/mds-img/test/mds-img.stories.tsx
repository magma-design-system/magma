import { h } from '@stencil/core'
import { argTypes, aspectRatios, URLs } from '../meta/storybook'

export default {
  title: 'UI / Image',
  argTypes,
}

const Template = args =>
  <mds-img {...args}/>

const TemplateConsumption = args =>
  <div class="grid gap-600 tablet:grid-cols-2 auto-rows-min">
    <div>
      <mds-img {...args}/>
    </div>
    <div class="grid gap-600 mobile:grid-cols-1 tablet:grid-cols-1 grid-cols-3 auto-rows-min">
      <div class="grid gap-100 auto-rows-min">
        <mds-text typography="h6">Consumption Low</mds-text>
        <mds-text typography="detail">Image is not loaded by default, alt text attribute is displayed as content, if element is clicked the image is loaded. </mds-text>
        <mds-text typography="detail">It's recommended to load black and white image at 1X resolution to decrease CPU consumption and data bandwidth.</mds-text>
      </div>
      <div class="grid gap-100 auto-rows-min">
        <mds-text typography="h6">Consumption Medium</mds-text>
        <mds-text typography="detail">Image is loaded by default, loading attribute will be applied.</mds-text>
        <mds-text typography="detail">It's recommended to load an image at 1X resolution to decrease CPU consumption and data bandwidth.</mds-text>
      </div>
      <div class="grid gap-100 auto-rows-min">
        <mds-text typography="h6">Consumption High</mds-text>
        <mds-text typography="detail">Image is loaded by default, loading attribute will be applied.</mds-text>
      </div>
    </div>
  </div>

const TemplateBook = args =>
  <div class="grid gap-600">
    <div class="grid gap-600 mobile:grid-cols-1 tablet:grid-cols-1 grid-cols-3 auto-rows-min">
      <div class="grid gap-100 auto-rows-min">
        <mds-text typography="h6">Consumption Low</mds-text>
        <mds-text typography="detail">Set consumption to <b>low</b> in <b>Magma accessibility</b> tab in storybook.</mds-text>
      </div>
    </div>
    <div class="grid gap-600 grid-cols-fit-sm">
      <mds-img {...args}/>
      <mds-img class="aspect-book rounded-md shadow" src="./book-cover-11.webp" srcset-consumption="./book-cover-11.webp low" alt="Concorso regione Valle d'Aosta 86 assistenti amministrativo contabili"/>
      <mds-img class="aspect-book rounded-md shadow" src="./book-cover-10.webp" srcset-consumption="./book-cover-10.webp low" alt="Il principio di rotazione e il regolamento degli appalti sotto soglia di lavori, forniture e servizi"/>
    </div>
  </div>

export const Default = Template.bind({})
Default.args = {
  src: URLs[0],
  class: 'aspect-book',
}

export const AltText = Template.bind({})
AltText.args = {
  alt: 'This is an alternative text',
  src: URLs[0],
}

export const AspectRatio = Template.bind({})
AspectRatio.args = {
  class: 'aspect-square',
  src: URLs[2],
}

export const SrcsetConsumption = TemplateConsumption.bind({})
SrcsetConsumption.args = {
  alt: 'This is the alt attribute text',
  'srcset-consumption': 'https://placehold.co/600x400?text=Consumption+LOW low, https://placehold.co/300x200?text=Consumption+MEDIUM medium, https://placehold.co/1200x800/orange/green/?text=Consumption+HIGH high',
}

export const SrcsetConsumptionAlternative = TemplateConsumption.bind({})
SrcsetConsumptionAlternative.args = {
  alt: 'This is the alt attribute text',
  src: 'https://placehold.co/1200x800/orange/green/?text=Consumption+HIGH',
  'srcset-consumption': 'https://placehold.co/600x400?text=Consumption+LOW low, https://placehold.co/300x200?text=Consumption+MEDIUM medium',
}

export const SrcsetConsumptionBookExample = TemplateBook.bind({})
SrcsetConsumptionBookExample.args = {
  class: 'aspect-book rounded-md shadow',
  alt: 'Il nuovo codice dei contratti pubblici e la disciplina vigente nel periodo transitorio',
  src: './book-cover-12.webp',
  'srcset-consumption': './book-cover-12.webp low',
}

export const BrokenImage = TemplateBook.bind({})
BrokenImage.args = {
  class: 'aspect-book rounded-md shadow',
  'aspect-ratio': aspectRatios[2],
  alt: 'Il nuovo codice dei contratti pubblici e la disciplina vigente nel periodo transitorio',
  src: './broken-image-path.jpg',
  'srcset-consumption': './broken-image-path.jpg low',
}
