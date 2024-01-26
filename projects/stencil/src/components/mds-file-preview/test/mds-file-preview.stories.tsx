import { h } from '@stencil/core'
import { fileExtensionsDictionary } from '@dictionary/file-extensions'
import { filesList } from '@fixture/filenames'
import { truncateDictionary } from '@dictionary/text'
import { iconsDictionary, mggIconsDictionary, svgIconsDictionary } from '@dictionary/icon'


const extensionsList = Object.keys(fileExtensionsDictionary).sort()

export default {
  title: 'UI / File Preview',
  argTypes: {
    deletable: {
      type: 'boolean',
      description: 'Enables the cross icon to perform cancel/delete action on element',
    },
    description: {
      type: 'string',
      description: 'Overrides the default filetype description',
    },
    filename: {
      type: { name: 'string' },
      description: 'The filename shown as component title, is used to auto assign one of the filetype known in the filetype dictionary',
      options: filesList,
      control: { type: 'select' },
    },
    filesize: {
      type: 'string',
      description: 'The filesize shown, if you pass a string you can write whathever you want, if you pass a number it expect filesize in bytes, the component will format it automatically.',
    },
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon or a base64 string to render it as an svg',
      options: mggIconsDictionary.concat(iconsDictionary).concat(svgIconsDictionary),
      control: { type: 'select' },
    },
    message: {
      type: 'string',
      description: 'The filesize shown, if you pass a string you can write whathever you want, if you pass a number it expect filesize in bytes, the component will format it automatically.',
    },
    truncate: {
      control: { type: 'select' },
      description: 'Specifies if the text shoud be truncated or should behave as a normal text',
      options: truncateDictionary,
    },
    src: {
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
  <mds-file-preview class="w-full max-w-5600" {...args}/>

export const Default = Template.bind({})
Default.args = {
  filename: filesList[1],
  src: './fred-brooks-zoom.webp',
}

