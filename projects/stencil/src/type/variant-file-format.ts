import baselineFolderZip from '@icon/mi/baseline/folder-zip.svg'
import baselineAttachFile from '@icon/mi/baseline/attach-file.svg'
import baselineAudiotrack from '@icon/mi/baseline/audiotrack.svg'
import baselineTerminal from '@icon/mi/baseline/terminal.svg'
import baselineInsertDriveFile from '@icon/mi/baseline/insert-drive-file.svg'
import mdiHardDisk from '@icon/mdi/harddisk.svg'

interface FileFormatVariant {
  color: string
  icon: string
  iconBackground: string
  variant: string
}

interface FileFormatVariants {
  [key: string]: FileFormatVariant
}

const fileFormatsVariant: FileFormatVariants = {
  archive: {
    color: 'fill-label-amaranth-04 text-label-amaranth-04',
    icon: baselineFolderZip,
    iconBackground: 'bg-label-amaranth-10',
    variant: 'amaranth',
  },
  attachment: {
    color: 'fill-tone-neutral-04 text-tone-neutral-04',
    icon: baselineAttachFile,
    iconBackground: 'bg-tone-neutral-10',
    variant: 'dark',
  },
  audio: {
    color: 'fill-label-violet-04 text-label-violet-04',
    icon: baselineAudiotrack,
    iconBackground: 'bg-label-violet-10',
    variant: 'violet',
  },
  code: {
    color: 'fill-label-yellow-04 text-label-yellow-04',
    icon: baselineTerminal,
    iconBackground: 'bg-label-yellow-10',
    variant: 'yellow',
  },
  data: {
    color: 'fill-label-yellow-04 text-label-yellow-04',
    icon: mdiHardDisk,
    iconBackground: 'bg-label-yellow-10',
    variant: 'yellow',
  },
  document: {
    color: 'fill-label-orange-04 text-label-orange-04',
    icon: baselineInsertDriveFile,
    iconBackground: 'bg-label-orange-10',
    variant: 'orange',
  },
  email: {
    color: 'fill-label-blue-04 text-label-blue-04',
    icon: 'mi/baseline/email',
    iconBackground: 'bg-label-blue-10',
    variant: 'blue',
  },
  executable: {
    color: 'fill-label-amaranth-04 text-label-amaranth-04',
    icon: 'mi/baseline/wysiwyg',
    iconBackground: 'bg-label-amaranth-10',
    variant: 'amaranth',
  },
  image: {
    color: 'fill-label-green-04 text-label-green-04',
    icon: 'mi/baseline/panorama',
    iconBackground: 'bg-label-green-10',
    variant: 'green',
  },
  imageRaster: {
    color: 'fill-label-green-04 text-label-green-04',
    icon: 'mi/baseline/panorama',
    iconBackground: 'bg-label-green-10',
    variant: 'green',
  },
  markup: {
    color: 'fill-label-yellow-04 text-label-yellow-04',
    icon: 'mi/baseline/web',
    iconBackground: 'bg-label-yellow-10',
    variant: 'yellow',
  },
  slide: {
    color: 'fill-label-orchid-04 text-label-orchid-04',
    icon: 'mi/baseline/tv',
    iconBackground: 'bg-label-orchid-10',
    variant: 'orchid',
  },
  spreadsheet: {
    color: 'fill-label-lime-04 text-label-lime-04',
    icon: 'mi/baseline/border-all',
    iconBackground: 'bg-label-lime-10',
    variant: 'lime',
  },
  text: {
    color: 'fill-label-blue-04 text-label-blue-04',
    icon: 'mi/baseline/description',
    iconBackground: 'bg-label-blue-10',
    variant: 'blue',
  },
  vectorImage: {
    color: 'fill-label-aqua-04 text-label-aqua-04',
    icon: 'mdi/vector-curve',
    iconBackground: 'bg-label-aqua-10',
    variant: 'aqua',
  },
  vector: {
    color: 'fill-label-aqua-04 text-label-aqua-04',
    icon: 'mdi/vector-curve',
    iconBackground: 'bg-label-aqua-10',
    variant: 'aqua',
  },
  video: {
    color: 'fill-label-violet-04 text-label-violet-04',
    icon: 'mi/baseline/videocam',
    iconBackground: 'bg-label-violet-10',
    variant: 'violet',
  },
}

export {
  fileFormatsVariant,
  FileFormatVariant,
  FileFormatVariants,
}
