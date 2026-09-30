import { fileExtensionsDictionary, ExtensionInfo } from '@dictionary/file-extensions';
import { fileFormatsVariant } from '@type/variant-file-format';
import { ThemeFullVariantType } from '@type/variant';

interface FileFormatsVariants {
  icon: string;
  variant: ThemeFullVariantType;
}

const sanitizeFilename = (
  filename: string,
  error: string = 'Attribute "filename" is undefined.',
) => {
  if (filename === undefined) {
    throw console.error(error);
  }
  if (filename.includes('/')) {
    return filename.split('/').pop() ?? '';
  }
  return filename;
};

/**
 * Index of the dot that separates the name from the extension: the last one, so that the dots
 * inside the name are kept (`report.v2.final.docx`). A leading dot is part of the name
 * (`.env` has no extension). Returns -1 when the filename has no extension.
 */
const getExtensionSeparator = (filename: string): number => {
  const dot = filename.lastIndexOf('.');
  return dot > 0 ? dot : -1;
};

const sanitizeSuffix = (rawFilename: string) => {
  const filename = sanitizeFilename(rawFilename);
  const dot = getExtensionSeparator(filename);
  return dot === -1 ? filename : filename.slice(dot + 1);
};

const getName = (rawFilename: string): string => {
  const filename = sanitizeFilename(rawFilename);
  const dot = getExtensionSeparator(filename);
  return dot === -1 ? filename : filename.slice(0, dot);
};

const getSuffix = (rawFilename: string, suffixOverride?: string): string => {
  const suffix = sanitizeSuffix(rawFilename);
  const filename = sanitizeFilename(rawFilename);
  if (suffixOverride !== null && suffixOverride !== undefined) {
    return suffixOverride.toLowerCase();
  }
  if (suffix !== filename) {
    return suffix;
  }
  return 'default';
};

const getExtensionInfos = (rawFilename: string, suffixOverride?: string): ExtensionInfo => {
  const suffix = getSuffix(rawFilename, suffixOverride).toLocaleLowerCase();
  return fileExtensionsDictionary[suffix] ?? fileExtensionsDictionary.default;
};

const getFormatsVariant = (rawFilename: string, suffixOverride?: string): FileFormatsVariants => {
  return fileFormatsVariant[getExtensionInfos(rawFilename, suffixOverride).format];
};

export { getExtensionInfos, getFormatsVariant, getSuffix, getName };
