import React from 'react'
import MdsDownload from '@component/mds-download/mds-download'
import MdsIcon from '@component/mds-icon/mds-icon'
import { fileExtensionsDictionary } from '../meta/dictionary'
import { filesList } from './fixtures'

const extensionsList = Object.keys(fileExtensionsDictionary).sort()

export default {
  title: 'UI / Download',
  component: MdsDownload,
  subcomponents: { MdsIcon },
  argTypes: {
    description: {
      type: { name: 'string' },
      description: 'Overrides the default filetype description',
    },
    filename: {
      type: { name: 'string' },
      description: 'The filename shown as component title, is used to auto assign one of the filetype known in the filetype dictionary',
      options: filesList,
      control: { type: 'select' },
    },
    preview: {
      type: { name: 'string' },
      description: 'The image preview src if available of a file, useful if you have a logo to display, or a smaller version of a bigger image',
    },
    suffix: {
      type: { name: 'string' },
      description: 'Overrides the automatic filetype recongition by forcing the suffix to one of the available formats choosen',
      options: extensionsList,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-download {...args}/>

export const Default = Template.bind({})
Default.args = {
  filename: filesList[1],
}

export const Description = Template.bind({})
Description.args = {
  description: 'This is a custom description',
  filename: filesList[2],
}

export const filesWithoutExtension = Template.bind({})
filesWithoutExtension.args = {
  filename: filesList[0],
  suffix: 'pdf',
}

export const preview = Template.bind({})
preview.args = {
  filename: filesList[5],
  preview: 'https://via.placeholder.com/64x64',
}
