/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

/* stencil non utilizza jsdom come enviroment per i test che vengono eseguiti su node.js,
 *  per la creazione di File si utilizza il seguente workaround
 *  https://github.com/ionic-team/stencil/issues/3539
 */
class MockFileImpl {
  name: any
  lastModified: any
  webkitRelativePath: any
  size: any
  type: any
  arrayBuffer: any
  slice: any
  stream: any
  text: any
  constructor (
    _globalObject: any,
    [_fileBits, fileName, options]: any,
    _privateData?: any,
  ) {
    this.name = fileName
    this.lastModified = options.lastModified ?? Date.now()
  }
}

class MockDataTransfer {
  data: { dragX: string; dragY: string }
  dropEffect: 'link' | 'none' | 'copy' | 'move'
  effectAllowed: 'link' | 'none' | 'copy' | 'move' | 'all' | 'copyLink' | 'copyMove' | 'linkMove' | 'uninitialized'
  files: FileList
  img: string
  items: never[]
  types: never[]
  xOffset: number
  yOffset: number
  constructor () {
    this.data = { dragX: '', dragY: '' }
    this.dropEffect = 'none'
    this.effectAllowed = 'all'
    this.img = ''
    this.items = []
    this.types = []
    this.xOffset = 0
    this.yOffset = 0
  }
  clearData () {
    this.data = { dragX: '', dragY: '' }
  }
  getData (format: string | number) {
    return this.data[format]
  }
  setData (format: string | number, data: any) {
    this.data[format] = data
  }
  setDragImage (img: string, xOffset: number, yOffset: number) {
    this.img = img
    this.xOffset = xOffset
    this.yOffset = yOffset
  }
}

function mockFile (name: string, size: number): File {
  const file = new MockFileImpl([''], name)
  Object.defineProperty(file, 'size', { value: size })
  return file
}

function mockFileList (files: File[]): FileList {
  const fileList: FileList = Object.create({})
  for (let i = 0; i < files.length; i++) {
    fileList[i] = files[i]
  }
  Object.defineProperty(fileList, 'length', { value: files.length })
  return fileList
}

export { MockFileImpl as FileImpl, MockDataTransfer, mockFile, mockFileList }
