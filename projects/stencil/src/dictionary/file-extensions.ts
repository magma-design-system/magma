interface FileExtenstion {
  [key: string]: ExtensionInfo
}

interface ExtensionInfo {
  preview?: boolean
  format: string
  description: string
}

const fileExtensionsDictionary: FileExtenstion = {
  '7z': { format: 'archive', description: 'Archivio compresso' },
  ace: { format: 'archive', description: 'Archivio compresso' },
  ai: { format: 'vector', description: 'Vettoriale Adobe Illustrator' },
  dart: { format: 'code', description: 'Dart' },
  db: { format: 'data', description: 'File di database' },
  default: { format: 'attachment', description: 'Formato sconosciuto' },
  dmg: { format: 'executable', description: 'Immagine disco Mac' },
  doc: { format: 'text', description: 'Documento Microsoft Word' },
  docm: { format: 'text', description: 'Documento Microsoft Word' },
  docx: { format: 'text', description: 'Documento Microsoft Word Compresso' },
  eml: { format: 'email', description: 'E-mail di posta elettronica' },
  eps: { format: 'vector', description: 'Vettoriale Corel Draw' },
  exe: { format: 'executable', description: 'File eseguibile Windows' },
  flac: { format: 'audio', description: 'Audio non compresso' },
  gif: { format: 'image', description: 'Immagine compressa', preview: true },
  htm: { format: 'markup', description: 'Pagina web' },
  heic: { format: 'image', description: 'High Efficiency Image File Format' },
  html: { format: 'markup', description: 'Pagina web' },
  jpe: { format: 'image', description: 'Immagine compressa', preview: true },
  jpeg: { format: 'image', description: 'Immagine compressa', preview: true },
  jpg: { format: 'image', description: 'Immagine compressa', preview: true },
  js: { format: 'code', description: 'JavaScript' },
  json: { format: 'data', description: 'JavaScript Object Notation' },
  jsx: { format: 'code', description: 'JavaScript' },
  m2v: { format: 'video', description: 'Filmato SD' },
  mp2: { format: 'audio', description: 'Audio compresso' },
  mp3: { format: 'audio', description: 'Audio compresso' },
  mp4: { format: 'video', description: 'Filmato HD' },
  mp4v: { format: 'video', description: 'Filmato HD' },
  mpeg: { format: 'video', description: 'Filmato SD' },
  mpg4: { format: 'video', description: 'Filmato SD' },
  mpg: { format: 'video', description: 'Filmato SD' },
  mpga: { format: 'audio', description: 'Audio compresso' },
  odp: { format: 'slide', description: 'Slide di presentazione LibreOffice' },
  ods: { format: 'spreadsheet', description: 'Foglio di calcolo LibreOffice' },
  odt: { format: 'text', description: 'File di testo LibreOffice' },
  pdf: { format: 'document', description: 'Documento Adobe' },
  php: { format: 'code', description: 'Hypertext Preprocessor' },
  png: { format: 'image', description: 'Immagine Portable Network Graphics', preview: true },
  ppt: { format: 'slide', description: 'Slide di presentazione PowerPoint' },
  rar: { format: 'archive', description: 'Archivio compresso' },
  rtf: { format: 'text', description: 'Documento di testo Rich Text Format' },
  sass: { format: 'code', description: 'Syntactically Awesome StyleSheets' },
  shtml: { format: 'markup', description: 'Pagina web' },
  svg: { format: 'vector', description: 'Scalable Vector Graphics', preview: true },
  tar: { format: 'archive', description: 'Archivio non compresso' },
  tiff: { format: 'image', description: 'Tag Image File Format' },
  ts: { format: 'code', description: 'TypeScript' },
  tsx: { format: 'code', description: 'TypeScript Extended Syntax' },
  txt: { format: 'text', description: 'Documento di testo non formattato' },
  wav: { format: 'audio', description: 'Audio non compresso' },
  webp: { format: 'image', description: 'Immagine compressa Google', preview: true },
  xar: { format: 'archive', description: 'Archivio compresso' },
  xls: { format: 'spreadsheet', description: 'Foglio di calcolo Office' },
  xlsx: { format: 'spreadsheet', description: 'Foglio di calcolo Office' },
  zip: { format: 'archive', description: 'Archivio compresso' },
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
