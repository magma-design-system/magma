import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
import { fnv1a } from '@common/hash';
import { fileExtensionsDictionary } from '@type/file-types';
import { filesList, namedFilesList } from '@fixture/filenames';

const extensionsList = Object.keys(fileExtensionsDictionary).sort();

export default {
  title: 'UI / Content / File',
  id: 'ui-file',
  argTypes: {
    description: {
      type: { name: 'string' },
      description: 'Overrides the default filetype description',
    },
    'downloaded-label': {
      type: { name: 'string' },
      description: 'Sets a label which is shown when the file is downloaded',
    },
    'hide-downloaded-icon': {
      type: { name: 'boolean' },
      description: 'Hides the icon shown when the file is downloaded',
    },
    filename: {
      type: { name: 'string' },
      description:
        'The filename shown as component title, is used to auto assign one of the filetype known in the filetype dictionary',
      options: namedFilesList,
      control: { type: 'select' },
    },
    preview: {
      type: { name: 'string' },
      description:
        'The image preview src if available of a file, useful if you have a logo to display, or a smaller version of a bigger image',
    },
    suffix: {
      type: { name: 'string' },
      description:
        'Overrides the automatic filetype recongition by forcing the suffix to one of the available formats choosen',
      options: extensionsList,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => <mds-file {...args} />;

export const Default = {
  render: Template,

  args: {
    filename: filesList[1],
  },
};

export const Description = {
  render: Template,

  args: {
    description: 'This is a custom description',
    filename: filesList[2],
  },
};

// real document names often contain dots (#747): only the last one separates the extension
export const FilenameWithDots = {
  render: Template,

  args: {
    filename: 'Delibera n. 12.2024 finale.pdf',
  },
};

export const FilesWithoutExtension = {
  render: Template,

  args: {
    filename: filesList[0],
    suffix: 'pdf',
  },
};

export const Preview = {
  render: Template,

  args: {
    filename: filesList[5],
    preview: './icon-newspaper-02.png',
  },
};

export const DownlaodedLabel = {
  render: Template,

  args: {
    'downloaded-label': 'You already downloaded this file',
    filename: filesList[5],
    preview: './icon-newspaper-02.png',
  },
};

/**
 * Every state of a file once the story has opened (#1440, @fixture/states): one file of each
 * kind the component draws apart (`format`, from the dictionary of extensions: one extension
 * each, not every extension), a name without an extension and one with an extension the
 * dictionary does not know (both an attachment), the kind forced by `suffix`, a description of
 * its own, an image preview, a name too long for the card, and a file already downloaded, with
 * and without its indicator. The component keeps the downloads in `localStorage`, under a key
 * of its own for each name: the story writes it for the two downloaded files, as a person who
 * downloaded them before, so they show the state as soon as the story opens. A click on any
 * other cell downloads that file too, and the browser keeps it. A download is an event and a
 * private state, with no property to check: no play function.
 */
interface FileState {
  state: string;
  file: Record<string, string | boolean>;
}

const fileStates: FileState[] = [
  { state: 'rest, document', file: { filename: 'Delibera di giunta n. 12.2024.pdf' } },
  { state: 'archive', file: { filename: 'Allegati della pratica.zip' } },
  { state: 'audio', file: { filename: 'Registrazione della seduta.mp3' } },
  { state: 'certificate', file: { filename: 'Contratto firmato.p7m' } },
  { state: 'code', file: { filename: 'calcolo-tributi.ts' } },
  { state: 'data', file: { filename: 'anagrafe-2027.json' } },
  { state: 'email', file: { filename: 'Comunicazione al cittadino.eml' } },
  { state: 'executable', file: { filename: 'Installazione firma digitale.exe' } },
  { state: 'image', file: { filename: 'Planimetria piano terra.png' } },
  { state: 'markup', file: { filename: 'Pagina del bando.html' } },
  { state: 'slide', file: { filename: 'Presentazione del bilancio.odp' } },
  { state: 'spreadsheet', file: { filename: 'Bilancio di previsione 2027.xlsx' } },
  { state: 'text', file: { filename: 'Verbale della seduta.docx' } },
  { state: 'vector', file: { filename: 'Stemma del comune.svg' } },
  { state: 'video', file: { filename: 'Guida al portale dei servizi.mp4' } },
  { state: 'attachment, no extension', file: { filename: 'LEGGIMI' } },
  { state: 'attachment, unknown extension', file: { filename: 'Pratica edilizia.dwg' } },
  { state: 'suffix forced', file: { filename: 'Regolamento comunale', suffix: 'pdf' } },
  {
    state: 'description of its own',
    file: { filename: 'Modulo di richiesta.pdf', description: 'Da firmare e restituire' },
  },
  {
    state: 'image preview',
    file: { filename: 'Rassegna stampa.png', preview: './icon-newspaper-02.png' },
  },
  {
    state: 'long name',
    file: {
      filename:
        'Determinazione dirigenziale di approvazione della graduatoria definitiva del concorso pubblico.pdf',
    },
  },
  { state: 'downloaded', file: { filename: 'Avviso di gara, scaricato.pdf' } },
  {
    state: 'downloaded, indicator hidden',
    file: { filename: 'Avviso di gara, aperto.pdf', 'hide-downloaded-icon': true },
  },
];

// the downloads of the two files, as the component records them (`mdsFile/` and a hash of the
// name, see downloadedStorageKey): written before the files load, which read them on load
const downloaded = ['Avviso di gara, scaricato.pdf', 'Avviso di gara, aperto.pdf'];

const TemplateStates = () => {
  try {
    downloaded.forEach((filename) =>
      localStorage.setItem(`mdsFile/${fnv1a(filename)}`, 'downloaded'),
    );
  } catch {
    // a storage the browser blocks leaves the two files not downloaded
  }
  return (
    <StatesGrid>
      {fileStates.map(({ state, file }) => (
        <StateCell key={state} state={state}>
          <mds-file {...file}></mds-file>
        </StateCell>
      ))}
    </StatesGrid>
  );
};

export const States = {
  render: TemplateStates,
};
