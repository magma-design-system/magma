import { FileFormat } from '@type/variant-file-format'

interface FileExtenstion {
  [key: string]: ExtensionInfo
}

interface ExtensionInfo {
  preview?: boolean
  format: FileFormat
  description: string
}

const fileExtensionsDictionary: FileExtenstion = {
  '7z': { format: 'archive', description: 'compressedArchive' },
  ace: { format: 'archive', description: 'compressedArchive' },
  ai: { format: 'vector', description: 'fileAI' },
  dart: { format: 'code', description: 'dart' },
  db: { format: 'data', description: 'fileDB' },
  default: { format: 'attachment', description: 'unknown' },
  dmg: { format: 'executable', description: 'appleDiskImage' },
  doc: { format: 'text', description: 'documentMS' },
  docm: { format: 'text', description: 'documentMS' },
  docx: { format: 'text', description: 'compressedDocumentMS' },
  eml: { format: 'email', description: 'email' },
  eps: { format: 'vector', description: 'fileEPS' },
  exe: { format: 'executable', description: 'fileEXE' },
  flac: { format: 'audio', description: 'uncompressedAudio' },
  gif: { format: 'image', description: 'compressedImage', preview: true },
  heic: { format: 'image', description: 'imageHEFF' },
  htm: { format: 'markup', description: 'documentWeb' },
  html: { format: 'markup', description: 'documentWeb' },
  jpe: { format: 'image', description: 'compressedImage', preview: true },
  jpeg: { format: 'image', description: 'compressedImage', preview: true },
  jpg: { format: 'image', description: 'compressedImage', preview: true },
  js: { format: 'code', description: 'fileJS' },
  json: { format: 'data', description: 'fileJSON' },
  jsx: { format: 'code', description: 'fileJS' },
  m2v: { format: 'video', description: 'videoSD' },
  mp2: { format: 'audio', description: 'compressedAudio' },
  mp3: { format: 'audio', description: 'compressedAudio' },
  mp4: { format: 'video', description: 'videoHD' },
  mp4v: { format: 'video', description: 'videoHD' },
  mpeg: { format: 'video', description: 'videoSD' },
  mpg4: { format: 'video', description: 'videoSD' },
  mpg: { format: 'video', description: 'videoSD' },
  mpga: { format: 'audio', description: 'compressedAudio' },
  odf: { format: 'document', description: 'openDocumentFormat' },
  odp: { format: 'slide', description: 'slideLO' },
  ods: { format: 'spreadsheet', description: 'spreadsheetLO' },
  odt: { format: 'text', description: 'documentLO' },
  ole: { format: 'document', description: 'objectLinkingAndEmbedding' },
  p7m: { format: 'certificate', description: 'documentDigitalSingnature' },
  pdf: { format: 'document', description: 'documentAdobe' },
  php: { format: 'code', description: 'filePHP' },
  png: { format: 'image', description: 'imagePNG', preview: true },
  ppt: { format: 'slide', description: 'slidePowerPoint' },
  rar: { format: 'archive', description: 'compressedArchive' },
  rtf: { format: 'text', description: 'documentRTF' },
  sass: { format: 'code', description: 'fileSASS' },
  shtml: { format: 'markup', description: 'documentWeb' },
  svg: { format: 'vector', description: 'imageSVG', preview: true },
  tar: { format: 'archive', description: 'uncompressedArchive' },
  tiff: { format: 'image', description: 'imageTIFF' },
  ts: { format: 'code', description: 'fileTS' },
  tsd: { format: 'certificate', description: 'certificateTSD' },
  tsx: { format: 'code', description: 'fileTSX' },
  txt: { format: 'text', description: 'documentTXT' },
  wav: { format: 'audio', description: 'uncompressedAudio' },
  webp: { format: 'image', description: 'imageWEBP', preview: true },
  xar: { format: 'archive', description: 'compressedArchive' },
  xls: { format: 'spreadsheet', description: 'spreadsheetMS' },
  xlsx: { format: 'spreadsheet', description: 'spreadsheetMS' },
  xml: { format: 'markup', description: 'extensibleMarkupLanguage' },
  zip: { format: 'archive', description: 'compressedArchive' },
}

const genericMimeToExt: Map<string, string[]> = new Map([
  ['image', ['.png', '.jpg', '.jpeg', '.tiff', '.webp', '.jpe', '.gif', '.heic']],
  ['audio', ['.mp2', '.mp3', '.mpga', '.wav', '.flac']],
  ['video', ['.mv2', '.mp4', '.mp4v', '.mpeg', '.mpg4', '.mpg']],
])

export {
  FileExtenstion,
  ExtensionInfo,
  fileExtensionsDictionary,
  genericMimeToExt,
}
