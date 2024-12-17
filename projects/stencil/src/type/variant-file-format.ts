import baselineFolderZip from '@icon/mi/baseline/folder-zip.svg'
import baselineAttachFile from '@icon/mi/baseline/attach-file.svg'
import baselineAudiotrack from '@icon/mi/baseline/audiotrack.svg'
import baselineTerminal from '@icon/mi/baseline/terminal.svg'
import baselineInsertDriveFile from '@icon/mi/baseline/insert-drive-file.svg'
import mdiLicense from '@icon/mdi/license.svg'
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
import { ThemeFullVariantType } from '@type/variant'

type FileFormat =
  | 'archive'
  | 'attachment'
  | 'audio'
  | 'certificate'
  | 'code'
  | 'data'
  | 'document'
  | 'email'
  | 'executable'
  | 'image'
  | 'markup'
  | 'slide'
  | 'spreadsheet'
  | 'text'
  | 'vector'
  | 'video'

interface FileFormatVariant {
  icon: string
  variant: ThemeFullVariantType
}

interface FileFormatVariants {
  [key: string]: FileFormatVariant
}

const fileFormatsVariant: FileFormatVariants = {
  archive: {
    icon: baselineFolderZip,
    variant: 'amaranth',
  },
  attachment: {
    icon: baselineAttachFile,
    variant: 'dark',
  },
  audio: {
    icon: baselineAudiotrack,
    variant: 'violet',
  },
  certificate: {
    icon: mdiLicense,
    variant: 'orange',
  },
  code: {
    icon: baselineTerminal,
    variant: 'yellow',
  },
  data: {
    icon: mdiHardDisk,
    variant: 'yellow',
  },
  document: {
    icon: baselineInsertDriveFile,
    variant: 'orange',
  },
  email: {
    icon: baselineEmail,
    variant: 'blue',
  },
  executable: {
    icon: baselineWysiwyg,
    variant: 'amaranth',
  },
  image: {
    icon: baselinePanorama,
    variant: 'green',
  },
  imageRaster: {
    icon: baselinePanorama,
    variant: 'green',
  },
  markup: {
    icon: baselineWeb,
    variant: 'yellow',
  },
  slide: {
    icon: baselineTV,
    variant: 'orchid',
  },
  spreadsheet: {
    icon: baselineBorderAll,
    variant: 'lime',
  },
  text: {
    icon: baselineDescription,
    variant: 'blue',
  },
  vectorImage: {
    icon: mdiVectorCurve,
    variant: 'aqua',
  },
  vector: {
    icon: mdiVectorCurve,
    variant: 'aqua',
  },
  video: {
    icon: baselineVideocam,
    variant: 'violet',
  },
}

export {
  fileFormatsVariant,
  FileFormat,
  FileFormatVariant,
  FileFormatVariants,
}
