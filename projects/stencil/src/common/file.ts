import { fileExtensionsDictionary, ExtensionInfo } from '@dictionary/file-extensions'
import { fileFormatsVariant } from '@type/variant-file-format'
import { ThemeFullVariantType } from '@type/variant'

interface FileFormatsVariants {
  icon: string
  variant: ThemeFullVariantType
}

const sanitizeFilename = (filename: string, error: string = 'Attribute "filename" is undefined.') => {
  if (filename === undefined ) {
    throw console.error(error)
  }
  if (filename.includes('/')) {
    return filename.split('/').pop() ?? ''
  }
  return filename
}

const sanitizeSuffix = (rawFilename: string) => {
  const filename = sanitizeFilename(rawFilename)
  if (filename.includes('.')) {
    return filename.split('.').pop() ?? ''
  }
  return filename
}

const getName = (rawFilename: string): string => {
  const filename = sanitizeFilename(rawFilename)
  if (filename.includes('.')) {
    return filename.split('.')[0] ?? ''
  }
  return filename
}

const getSuffix = (rawFilename: string, suffixOverride?: string): string => {
  const suffix = sanitizeSuffix(rawFilename)
  const filename = sanitizeFilename(rawFilename)
  if (suffixOverride !== null && suffixOverride !== undefined) {
    return suffixOverride.toLowerCase()
  }
  if (suffix !== filename) {
    return suffix
  }
  return 'default'
}

const getExtensionInfos = (rawFilename: string, suffixOverride?: string): ExtensionInfo => {
  const suffix = getSuffix(rawFilename, suffixOverride).toLocaleLowerCase()
  return fileExtensionsDictionary[suffix] ?? fileExtensionsDictionary.default
}

const getFormatsVariant = (rawFilename: string, suffixOverride?: string): FileFormatsVariants => {
  return fileFormatsVariant[getExtensionInfos(rawFilename, suffixOverride).format]
}

export {
  getExtensionInfos,
  getFormatsVariant,
  getSuffix,
  getName,
}
