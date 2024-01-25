import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'
// import { themeFullVariantAvatarDictionary, toneMinimalVariantDictionary } from '@dictionary/variant'

export default {
  title: 'Form / Input Upload',
  argTypes: {
    icon: {
      type: { name: 'string' },
      description: 'Specifies the icon to be displayed if src propery is not used',
      options: iconsDictionary,
      control: { type: 'select' },
    },
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
    multiple: {
      type: { name: 'boolean' },
      description: 'Specifies if its possible to upload multiple file',
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
  accept: '.pdf, image/jpeg',
  'max-file-size': 70,
  'max-files': 5,
}
