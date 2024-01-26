import { h } from '@stencil/core'
import { fileExtensionsDictionary } from '@dictionary/file-extensions'
import { filesList } from '@fixture/filenames'

const extensionsList = Object.keys(fileExtensionsDictionary).sort()

export default {
  title: 'UI / File',
  argTypes: {
    description: {
      type: { name: 'string' },
      description: 'Overrides the default filetype description',
    },
    'downloaded-label': {
      type: { name: 'string' },
      description: 'Sets a label which is shown when the file is downloaded',
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
  <mds-file {...args}/>

export const Default = Template.bind({})
Default.args = {
  filename: filesList[1],
}

export const Description = Template.bind({})
Description.args = {
  description: 'This is a custom description',
  filename: filesList[2],
}

export const FilesWithoutExtension = Template.bind({})
FilesWithoutExtension.args = {
  filename: filesList[0],
  suffix: 'pdf',
}

export const Preview = Template.bind({})
Preview.args = {
  filename: filesList[5],
  preview: './icon-newspaper-02.png',
}

export const DownlaodedLabel = Template.bind({})
DownlaodedLabel.args = {
  'downloaded-label': 'You already downloaded this file',
  filename: filesList[5],
  preview: './icon-newspaper-02.png',
}
