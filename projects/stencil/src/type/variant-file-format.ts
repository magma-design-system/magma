import baselineFolderZip from '@icon/mi/baseline/folder-zip.svg'
import baselineAttachFile from '@icon/mi/baseline/attach-file.svg'
import baselineAudiotrack from '@icon/mi/baseline/audiotrack.svg'
import baselineTerminal from '@icon/mi/baseline/terminal.svg'
import baselineInsertDriveFile from '@icon/mi/baseline/insert-drive-file.svg'
import mdiHardDisk from '@icon/mdi/harddisk.svg'

const fileFormatsVariant = {
  archive: {
    color: 'fill-label-amaranth-04 text-label-amaranth-04',
    icon: baselineFolderZip,
    iconBackground: 'bg-label-amaranth-10',
    preview: false,
    variant: 'amaranth',
  },
  attachment: {
    color: 'fill-tone-neutral-04 text-tone-neutral-04',
    icon: baselineAttachFile,
    iconBackground: 'bg-tone-neutral-10',
    preview: false,
    variant: 'dark',
  },
  audio: {
    color: 'fill-label-violet-04 text-label-violet-04',
    icon: baselineAudiotrack,
    iconBackground: 'bg-label-violet-10',
    preview: false,
    variant: 'violet',
  },
  code: {
    color: 'fill-label-yellow-04 text-label-yellow-04',
    icon: baselineTerminal,
    iconBackground: 'bg-label-yellow-10',
    preview: false,
    variant: 'yellow',
  },
  data: {
    color: 'fill-label-yellow-04 text-label-yellow-04',
    icon: mdiHardDisk,
    iconBackground: 'bg-label-yellow-10',
    preview: false,
    variant: 'yellow',
  },
  document: {
    color: 'fill-label-orange-04 text-label-orange-04',
    icon: baselineInsertDriveFile,
    iconBackground: 'bg-label-orange-10',
    preview: false,
    variant: 'orange',
  },
  email: {
    color: 'fill-label-blue-04 text-label-blue-04',
    icon: 'mi/baseline/email',
    iconBackground: 'bg-label-blue-10',
    preview: false,
    variant: 'blue',
  },
  executable: {
    color: 'fill-label-amaranth-04 text-label-amaranth-04',
    icon: 'mi/baseline/wysiwyg',
    iconBackground: 'bg-label-amaranth-10',
    preview: false,
    variant: 'amaranth',
  },
  image: {
    color: 'fill-label-green-04 text-label-green-04',
    icon: 'mi/baseline/panorama',
    iconBackground: 'bg-label-green-10',
    preview: true,
    variant: 'green',
  },
  markup: {
    color: 'fill-label-yellow-04 text-label-yellow-04',
    icon: 'mi/baseline/web',
    iconBackground: 'bg-label-yellow-10',
    preview: false,
    variant: 'yellow',
  },
  slide: {
    color: 'fill-label-orchid-04 text-label-orchid-04',
    icon: 'mi/baseline/tv',
    iconBackground: 'bg-label-orchid-10',
    preview: false,
    variant: 'orchid',
  },
  spreadsheet: {
    color: 'fill-label-lime-04 text-label-lime-04',
    icon: 'mi/baseline/border-all',
    iconBackground: 'bg-label-lime-10',
    preview: false,
    variant: 'lime',
  },
  text: {
    color: 'fill-label-blue-04 text-label-blue-04',
    icon: 'mi/baseline/description',
    iconBackground: 'bg-label-blue-10',
    preview: false,
    variant: 'blue',
  },
  vector: {
    color: 'fill-label-aqua-04 text-label-aqua-04',
    icon: 'mdi/vector-curve',
    iconBackground: 'bg-label-aqua-10',
    preview: false,
    variant: 'aqua',
  },
  video: {
    color: 'fill-label-violet-04 text-label-violet-04',
    icon: 'mi/baseline/videocam',
    iconBackground: 'bg-label-violet-10',
    preview: false,
    variant: 'violet',
  },
}

export {
  fileFormatsVariant,
}
