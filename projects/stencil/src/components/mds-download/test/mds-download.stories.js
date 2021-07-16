import React from 'react'
import faker from 'faker'
import MdsDownload from '@component/mds-download/mds-download'
import MdsIcon from '@component/mds-icon/mds-icon'
import { fileExtensionsDictionary } from '@dictionary/file-extensions'

// import imageFile from './avatar-gruppo-maggioli-512w.png'

const filesList = [
  'this_is_an_extensionless_file',
  'https://i2.wp.com/clipart.info/images/ccovers/1495750818Apple-PNG-Clip-Art.png',
]
const extensionsList = Object.keys(fileExtensionsDictionary).sort()
extensionsList.forEach((extension) => {
  filesList.push(`${faker.system.commonFileName().split('.')[0]}.${extension}`)
})

const getFile = () =>
  filesList[faker.datatype.number(filesList.length - 1)]

export default {
  title: 'UI / Download',
  component: MdsDownload,
  subcomponents: { MdsIcon },
  argTypes: {
    description: {
      type: { name: 'string', required: false },
      description: 'Overrides the default filetype description',
    },
    filename: {
      type: { name: 'string', required: false },
      description: 'The filename shown as component title, is used to auto assign one of the filetype known in the filetype dictionary',
      options: filesList,
      control: { type: 'select' },
    },
    preview: {
      type: { name: 'string', required: false },
      description: 'The image preview src if available of a file, useful if you have a logo to display, or a smaller version of a bigger image',
    },
    suffix: {
      type: { name: 'string', required: false },
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
  filename: getFile(),
}

export const Description = Template.bind({})
Description.args = {
  description: 'This is a custom description',
  filename: getFile(),
}

export const tailwindInline = () =>
  <mds-download filename={getFile()} class="w-auto"/>

export const filesWithoutExtension = Template.bind({})
filesWithoutExtension.args = {
  filename: getFile(),
  suffix: 'pdf',
}

export const preview = Template.bind({})
preview.args = {
  filename: getFile(),
  preview: 'https://i2.wp.com/clipart.info/images/ccovers/1495750818Apple-PNG-Clip-Art.png',
}
