import { loadingDictionary } from '@dictionary/loading'

const URLs = [
  'https://via.placeholder.com/1920x1024',
  'https://via.placeholder.com/1280x768',
  'https://via.placeholder.com/1024x1024',
  'https://via.placeholder.com/640x480',
  'https://via.placeholder.com/480x640',
  'https://via.placeholder.com/300x800',
]

const argTypes = {
  alt: {
    description: 'Specifies an alternate text for an image',
    type: { name: 'string', required: false },
  },
  height: {
    description: 'The height attribute specifies the height of an image, in pixels',
    type: { name: 'string', required: false },
  },
  loading: {
    control: { type: 'select' },
    description: 'Specifies whether a browser should load an image immediately or to defer loading of images until some conditions are met',
    options: loadingDictionary,
    type: { name: 'string', required: false },
  },
  sizes: {
    description: 'One or more strings separated by commas, indicating a set of source sizes',
    type: { name: 'string', required: false },
  },
  srcset: {
    description: 'Specifies a list of image files to use in different situations',
    type: { name: 'string', required: false },
  },
  'srcset-consumption': {
    description: 'Specifies a list of image files to use in different consumption situations',
    type: { name: 'string' },
  },
  src: {
    control: { type: 'select' },
    description: 'Specifies the path to the image',
    options: URLs,
    type: { name: 'string', required: true },
  },
  width: {
    description: 'The width attribute specifies the width of an image, in pixels',
    type: { name: 'string', required: false },
  },
}

export {
  argTypes,
  URLs,
}
