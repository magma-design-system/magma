import { h } from '@stencil/core'
import { fileExtensionsDictionary } from '@dictionary/file-extensions'
import { filesList } from '@fixture/filenames'
import { truncateDictionary } from '@dictionary/text'
import { iconsDictionary, mggIconsDictionary, svgIconsDictionary } from '@dictionary/icon'
import { themeFullVariantAvatarDictionary } from '@dictionary/variant'

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
      type: 'string',
      description: 'The filename shown as component title, is used to auto assign one of the filetype known in the filetype dictionary',
      options: filesList,
      control: { type: 'select' },
    },
    filesize: {
      type: 'string',
      description: 'The filesize shown, if you pass a string you can write whathever you want, if you pass a number it expect filesize in bytes, the component will format it automatically.',
    },
    icon: {
      type: 'string',
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
      type: 'string',
      description: 'The image preview src if available of a file, useful if you have a logo to display, or a smaller version of a bigger image',
    },
    suffix: {
      type: 'string',
      description: 'Overrides the automatic filetype recongition by forcing the suffix to one of the available formats choosen',
      options: extensionsList,
      control: { type: 'select' },
    },
    variant: {
      type: 'string',
      control: { type: 'select' },
      description: 'Sets the theme variant colors',
      options: themeFullVariantAvatarDictionary,
    },
  },
}

const Template = args =>
  <mds-file-preview class="w-full max-w-5600" {...args}/>

export const Default = Template.bind({})
Default.args = {
  filename: filesList[15],
  filesize: 10248594,
}

export const Deletable = Template.bind({})
Deletable.args = {
  filename: filesList[1],
  deletable: true,
  filesize: 10248594,
  src: './fred-brooks-zoom.webp',
}

export const Description = Template.bind({})
Description.args = {
  filename: filesList[1],
  description: 'Incredible format',
  src: './fred-brooks-zoom.webp',
}

export const Filename = Template.bind({})
Filename.args = {
  filename: filesList[1],
}

export const Filesize = Template.bind({})
Filesize.args = {
  filename: filesList[20],
  filesize: '12 MB',
}

export const Icon = Template.bind({})
Icon.args = {
  filename: filesList[20],
  filesize: '12 MB',
  icon: mggIconsDictionary[150],
}

export const Message = Template.bind({})
Message.args = {
  filename: filesList[20],
  filesize: '12 MB',
  message: 'File format non valido',
  variant: 'error',
  icon:'mi/baseline/warning',
}

export const Truncate = Template.bind({})
Truncate.args = {
  filename: 'This is one of the most lenght filename humanity have ever seen.doc',
  filesize: 84791746,
  truncate: 'all',
}

export const Src = Template.bind({})
Src.args = {
  filename: filesList[1],
  filesize: 84791746,
  src: './fred-brooks-zoom.webp',
}

export const Suffix = Template.bind({})
Suffix.args = {
  filename: filesList[1],
  filesize: 84791746,
  suffix: 'pdf',
  src: './fred-brooks-zoom.webp',
}

export const Variant = Template.bind({})
Variant.args = {
  filename: filesList[1],
  filesize: 84791746,
  suffix: 'pdf',
  icon: 'mdi/file-document-remove-outline',
  src: './fred-brooks-zoom.webp',
  message: 'Works only with message attribute',
  variant: 'success',
}
