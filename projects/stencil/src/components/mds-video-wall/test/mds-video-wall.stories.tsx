import { noiseDictionary, preloadDictionary } from '../meta/dictionary'
import { lokiDisabled } from '@test/loki-disabled'
import { h } from '@stencil/core'

export default {
  title: 'UI / Video wall',
  argTypes: {
    autoplay: {
      type: { name: 'boolean' },
      description: 'Specifies that the video will start playing as soon as it is ready',
    },
    loop: {
      type: { name: 'boolean' },
      description: 'Specifies that the video will start over again, every time it is finished',
    },
    muted: {
      type: { name: 'boolean' },
      description: 'Specifies that the audio output of the video should be muted',
    },
    noise: {
      type: { name: 'string' },
      description: 'Specifies if the video has a noise overlay effect',
      control: { type: 'select' },
      options: noiseDictionary,
    },
    poster: {
      type: { name: 'string' },
      description: 'Specifies an image to be shown while the video is downloading',
    },
    preload: {
      type: { name: 'string' },
      description: 'Specifies if and how the author thinks the video should be loaded when the page loads',
      control: { type: 'select' },
      options: preloadDictionary,
    },
    src: {
      type: { name: 'string' },
      description: 'Specifies the URL of the video file',
    },
  },
}

const Template = args =>
  <mds-video-wall {...args} style={{ '--aspect-ratio': '16/9' }}>
    Your browser doesn't support videos.
  </mds-video-wall>

const TemplateContents = args =>
  <mds-video-wall {...args} style={{ '--aspect-ratio': '16/9' }}>
    <div slot="content" class="text-tone-neutral text-center p-2">
      <mds-text typography="h1">This is a text</mds-text>
    </div>
  </mds-video-wall>

export const Default = Template.bind({})
Default.args = {
  class: 'max-w-full',
  src: './video-nature.mp4',
}

export const Autoplay = Template.bind({})
Autoplay.args = {
  class: 'max-w-full',
  autoplay: false,
  src: './video-nature.mp4',
}

export const Loop = Template.bind({})
Loop.args = {
  class: 'max-w-full',
  loop: false,
  src: './video-nature.mp4',
}

export const Muted = Template.bind({})
Muted.args = {
  class: 'max-w-full',
  muted: false,
  src: './video-nature.mp4',
}

export const Noise = Template.bind({})
Noise.args = {
  class: 'max-w-full',
  noise: 'classic',
  src: './video-nature.mp4',
}

export const Poster = Template.bind({})
Poster.args = {
  class: 'max-w-full',
  autoplay: false,
  poster: './video-nature-preview.webp',
  src: './video-nature.mp4',
}

export const Preload = Template.bind({})
Preload.args = {
  class: 'max-w-full',
  preload: 'metadata',
  src: './video-nature.mp4',
}

export const Content = TemplateContents.bind({})
Content.args = {
  class: 'max-w-full',
  src: './video-nature.mp4',
}


Default.story = lokiDisabled
Autoplay.story = lokiDisabled
Loop.story = lokiDisabled
Muted.story = lokiDisabled
Noise.story = lokiDisabled
// Poster.story = lokiDisabled
Preload.story = lokiDisabled
Content.story = lokiDisabled
