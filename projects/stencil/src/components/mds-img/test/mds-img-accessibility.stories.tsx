import { h } from '@stencil/core'

import { argTypes, aspectRatios, URLs } from '../meta/storybook'

export default {
  title: 'UI / Image / ARIA',
  argTypes,
}

const TemplateAriaLabeled = args =>
  <mds-img {...args} aria-label="Image with 640 x 480 pixels of resolution."/>

export const Labelled = TemplateAriaLabeled.bind({})
Labelled.args = {
  src: URLs[3],
}

const TemplateAriaLabelledByText = args =>
  <div class="flex flex-col items-center gap-600">
    <mds-img {...args} aria-labelledby="image-label"/>
    <mds-text id="image-label" typography='caption' aria-hidden="true">
      Image with 640 x 480 pixels of resolution.
    </mds-text>
  </div>

export const LabelledByText = TemplateAriaLabelledByText.bind({})
LabelledByText.args = {
  src: URLs[3],
}

const TemplateAriaLabelledBackground = args =>
  <div class="flex flex-col items-center gap-600">
    <mds-img {...args} aria-labelledby="image-label"/>
    <mds-text id="image-label" typography='caption' aria-hidden="true">
      Background image with 640 x 480 pixels of resolution.
    </mds-text>
  </div>

export const LabelledBackgroundImage = TemplateAriaLabelledBackground.bind({})
LabelledBackgroundImage.args = {
  src: URLs[3],
  'aspect-ratio': aspectRatios[5],
}


const TemplateAriaDescription = args =>
  <div role="img" aria-describedby="image-description" class="flex flex-col items-center gap-600">
    <mds-img {...args}/>
    <mds-text id="image-description" typography='caption'>
      Descriptions are more verbose explanations. This image shows an empty preview with the resolution of 640 x 480 pixels, the source image is from placeholder.com.
    </mds-text>
  </div>

export const Description = TemplateAriaDescription.bind({})
Description.args = {
  src: URLs[3],
}
