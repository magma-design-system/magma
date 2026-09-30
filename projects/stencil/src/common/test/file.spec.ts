import { fileExtensionsDictionary } from '@dictionary/file-extensions';
import { getExtensionInfos, getName, getSuffix } from '@common/file';

describe('getName', () => {
  it('returns the filename without its extension', () => {
    expect(getName('report.pdf')).toBe('report');
    expect(getName('relazione-annuale.docx')).toBe('relazione-annuale');
  });

  // #747: the name was cut at the first dot instead of the last one
  it('keeps the dots inside the name', () => {
    expect(getName('Delibera n. 12.2024 finale.pdf')).toBe('Delibera n. 12.2024 finale');
    expect(getName('report.v2.final.docx')).toBe('report.v2.final');
    expect(getName('archive.tar.gz')).toBe('archive.tar');
  });

  it('returns the whole filename when there is no extension', () => {
    expect(getName('this_is_an_extensionless_file')).toBe('this_is_an_extensionless_file');
  });

  it('does not treat a leading dot as an extension separator', () => {
    expect(getName('.env')).toBe('.env');
  });

  it('drops the path before the filename', () => {
    expect(getName('/atti/2024/Delibera n. 12.2024 finale.pdf')).toBe('Delibera n. 12.2024 finale');
    expect(getName('https://example.com/files.v2/report.v2.final.docx')).toBe('report.v2.final');
  });
});

describe('getSuffix', () => {
  it('returns the extension after the last dot', () => {
    expect(getSuffix('report.pdf')).toBe('pdf');
    expect(getSuffix('Delibera n. 12.2024 finale.pdf')).toBe('pdf');
    expect(getSuffix('report.v2.final.docx')).toBe('docx');
    expect(getSuffix('archive.tar.gz')).toBe('gz');
    expect(getSuffix('https://example.com/files.v2/report.v2.final.docx')).toBe('docx');
  });

  it('returns "default" when there is no extension', () => {
    expect(getSuffix('this_is_an_extensionless_file')).toBe('default');
    expect(getSuffix('.env')).toBe('default');
  });

  it('prefers the override, lowercased', () => {
    expect(getSuffix('archive.tar.gz', 'ZIP')).toBe('zip');
    expect(getSuffix('this_is_an_extensionless_file', 'pdf')).toBe('pdf');
  });
});

describe('getExtensionInfos', () => {
  it('detects the format from the last extension', () => {
    expect(getExtensionInfos('Delibera n. 12.2024 finale.pdf')).toEqual(
      fileExtensionsDictionary.pdf,
    );
    expect(getExtensionInfos('report.v2.final.docx')).toEqual(fileExtensionsDictionary.docx);
  });

  it('falls back to the default format for unknown or missing extensions', () => {
    expect(getExtensionInfos('this_is_an_extensionless_file')).toEqual(
      fileExtensionsDictionary.default,
    );
    expect(getExtensionInfos('.env')).toEqual(fileExtensionsDictionary.default);
  });
});
