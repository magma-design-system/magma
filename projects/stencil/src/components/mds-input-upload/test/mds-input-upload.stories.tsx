import { h } from '@stencil/core'
import { attachmentSortDictionary } from '../meta/dictionary'

export default {
  title: 'Form / Input Upload',
  argTypes: {
    accept: {
      type: { name: 'string' },
      description: 'Defines the file types the file input should accept',
    },
    'max-file-size': {
      type: { name: 'number' },
      description: 'Specifies the max size of a single file that can be uploaded in MB',
    },
    'max-files': {
      type: { name: 'number' },
      description: 'Specifies the max number of files that can be uploaded',
    },
    sort: {
      type: { name: 'string' },
      description: 'Specifies if the component should show a sort widget by alphabetical name or date of upload',
      options: attachmentSortDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <div>
    <mds-input-upload {...args}></mds-input-upload>
  </div>

export const Default = Template.bind({})
Default.args = {
  // icon: 'mi/baseline/email',
  accept: '',
}

export const CustomAccept = Template.bind({})
CustomAccept.args = {
  accept: '.pdf, image/jpeg',
  'max-file-size': 70,
}

export const Multiple = Template.bind({})
Multiple.args = {
  accept: '.pdf, image/jpeg, image/png, .svg, .heic, .webp',
  'max-file-size': 70,
  'max-files': 3,
}
