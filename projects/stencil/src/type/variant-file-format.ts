import baselineFolderZip from '@icon/mi/baseline/folder-zip.svg'
import baselineAttachFile from '@icon/mi/baseline/attach-file.svg'
import baselineAudiotrack from '@icon/mi/baseline/audiotrack.svg'
import baselineTerminal from '@icon/mi/baseline/terminal.svg'
import baselineInsertDriveFile from '@icon/mi/baseline/insert-drive-file.svg'
import mdiHardDisk from '@icon/mdi/harddisk.svg'
import baselineEmail from '@icon/mi/baseline/email.svg'
import baselineWysiwyg from '@icon/mi/baseline/wysiwyg.svg'
import baselinePanorama from '@icon/mi/baseline/panorama.svg'
import baselineWeb from '@icon/mi/baseline/web.svg'
import baselineTV from '@icon/mi/baseline/tv.svg'
import baselineBorderAll from '@icon/mi/baseline/border-all.svg'
import baselineDescription from '@icon/mi/baseline/description.svg'
import mdiVectorCurve from '@icon/mdi/vector-curve.svg'
import baselineVideocam from '@icon/mi/baseline/videocam.svg'

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
    icon: baselineEmail,
    iconBackground: 'bg-label-blue-10',
    variant: 'blue',
  },
  executable: {
    color: 'fill-label-amaranth-04 text-label-amaranth-04',
    icon: baselineWysiwyg,
    iconBackground: 'bg-label-amaranth-10',
    variant: 'amaranth',
  },
  image: {
    color: 'fill-label-green-04 text-label-green-04',
    icon: baselinePanorama,
    iconBackground: 'bg-label-green-10',
    variant: 'green',
  },
  imageRaster: {
    color: 'fill-label-green-04 text-label-green-04',
    icon: baselinePanorama,
    iconBackground: 'bg-label-green-10',
    variant: 'green',
  },
  markup: {
    color: 'fill-label-yellow-04 text-label-yellow-04',
    icon: baselineWeb,
    iconBackground: 'bg-label-yellow-10',
    variant: 'yellow',
  },
  slide: {
    color: 'fill-label-orchid-04 text-label-orchid-04',
    icon: baselineTV,
    iconBackground: 'bg-label-orchid-10',
    variant: 'orchid',
  },
  spreadsheet: {
    color: 'fill-label-lime-04 text-label-lime-04',
    icon: baselineBorderAll,
    iconBackground: 'bg-label-lime-10',
    variant: 'lime',
  },
  text: {
    color: 'fill-label-blue-04 text-label-blue-04',
    icon: baselineDescription,
    iconBackground: 'bg-label-blue-10',
    variant: 'blue',
  },
  vectorImage: {
    color: 'fill-label-aqua-04 text-label-aqua-04',
    icon: mdiVectorCurve,
    iconBackground: 'bg-label-aqua-10',
    variant: 'aqua',
  },
  vector: {
    color: 'fill-label-aqua-04 text-label-aqua-04',
    icon: mdiVectorCurve,
    iconBackground: 'bg-label-aqua-10',
    variant: 'aqua',
  },
  video: {
    color: 'fill-label-violet-04 text-label-violet-04',
    icon: baselineVideocam,
    iconBackground: 'bg-label-violet-10',
    variant: 'violet',
  },
}

export {
  fileFormatsVariant,
  FileFormatVariant,
  FileFormatVariants,
}
