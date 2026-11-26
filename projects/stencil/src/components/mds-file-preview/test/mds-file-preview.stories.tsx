import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
import { fileExtensionsDictionary } from '@type/file-types';
import { filesList } from '@fixture/filenames';
import { truncateDictionary } from '@type/text';
import { iconsDictionary, mggIconsDictionary, svgIconsDictionary } from '@type/icon';
import { themeFullVariantAvatarDictionary, themeStatusVariantDictionary } from '@type/variant';

const extensionsList = Object.keys(fileExtensionsDictionary).sort();

export default {
  title: 'UI / Content / File Preview',
  id: 'ui-file-preview',
  argTypes: {
    deletable: {
      type: 'boolean',
      description: 'Enables the cross icon to perform cancel/delete action on element',
    },
    description: {
      type: 'string',
      description: 'Overrides the default filetype description',
    },
    filename: {
      type: 'string',
      description:
        'The filename shown as component title, is used to auto assign one of the filetype known in the filetype dictionary',
      options: filesList,
      control: { type: 'select' },
    },
    filesize: {
      type: 'string',
      description:
        'The filesize shown, if you pass a string you can write whathever you want, if you pass a number it expect filesize in bytes, the component will format it automatically.',
    },
    icon: {
      type: 'string',
      description: 'The name of the icon or a base64 string to render it as an svg',
      options: mggIconsDictionary.concat(iconsDictionary).concat(svgIconsDictionary),
      control: { type: 'select' },
    },
    message: {
      type: 'string',
      description:
        'The filesize shown, if you pass a string you can write whathever you want, if you pass a number it expect filesize in bytes, the component will format it automatically.',
    },
    truncate: {
      control: { type: 'select' },
      description: 'Specifies if the text shoud be truncated or should behave as a normal text',
      options: truncateDictionary,
    },
    src: {
      type: 'string',
      description:
        'The image preview src if available of a file, useful if you have a logo to display, or a smaller version of a bigger image',
    },
    suffix: {
      type: 'string',
      description:
        'Overrides the automatic filetype recongition by forcing the suffix to one of the available formats choosen',
      options: extensionsList,
      control: { type: 'select' },
    },
    variant: {
      type: 'string',
      control: { type: 'select' },
      description: 'Sets the theme variant colors',
      options: themeFullVariantAvatarDictionary,
    },
  },
};

const Template = (args) => <mds-file-preview class="w-full max-w-5600" {...args} />;

export const Default = {
  render: Template,

  args: {
    filename: filesList[15],
    filesize: 10248594,
  },
};

export const Deletable = {
  render: Template,

  args: {
    filename: filesList[1],
    deletable: true,
    filesize: 10248594,
    src: './fred-brooks-zoom.webp',
  },
};

export const Description = {
  render: Template,

  args: {
    filename: filesList[1],
    description: 'Incredible format',
    src: './fred-brooks-zoom.webp',
  },
};

export const Filename = {
  render: Template,

  args: {
    filename: filesList[1],
  },
};

export const Filesize = {
  render: Template,

  args: {
    filename: filesList[20],
    filesize: '12 MB',
  },
};

export const Icon = {
  render: Template,

  args: {
    filename: filesList[20],
    filesize: '12 MB',
    icon: mggIconsDictionary[150],
  },
};

export const Message = {
  render: Template,

  args: {
    filename: filesList[20],
    filesize: '12 MB',
    message: 'File format non valido',
    variant: 'error',
    icon: 'mi/baseline/warning',
  },
};

export const Truncate = {
  render: Template,

  args: {
    filename: 'This is one of the most lenght filename humanity have ever seen.doc',
    filesize: 84791746,
    truncate: 'all',
  },
};

export const Src = {
  render: Template,

  args: {
    filename: filesList[1],
    filesize: 84791746,
    src: './fred-brooks-zoom.webp',
  },
};

export const Suffix = {
  render: Template,

  args: {
    filename: filesList[1],
    filesize: 84791746,
    suffix: 'pdf',
    src: './fred-brooks-zoom.webp',
  },
};

export const Variant = {
  render: Template,

  args: {
    filename: filesList[1],
    filesize: 84791746,
    suffix: 'pdf',
    icon: 'mdi/file-document-remove-outline',
    src: './fred-brooks-zoom.webp',
    message: 'Works only with message attribute',
    variant: 'success',
  },
};

/**
 * Every state of a file preview once the story has opened (#1440, @fixture/states): one file
 * of each kind the component draws apart (`format`, one extension each), the size in bytes and
 * as text, which take the place of the description, a description of its own, the image of a
 * file that has one (a local image, as the other stories use) and the same image on a kind that
 * shows none, an icon of its own, the message with and without a `variant` (which only a message
 * shows), deletable, downloadable, each `truncate` on a long name, and the kind forced by
 * `suffix`. Deleting and downloading emit an event and change nothing in the preview, so there
 * is no state to reach: no play function.
 */
interface PreviewState {
  state: string;
  preview: { filename: string } & Record<string, string | boolean>;
}

const longName =
  'Determinazione dirigenziale di approvazione della graduatoria definitiva del concorso.pdf';

const previewStates: PreviewState[] = [
  { state: 'rest, document', preview: { filename: 'Delibera di giunta n. 12.2024.pdf' } },
  { state: 'archive', preview: { filename: 'Allegati della pratica.zip' } },
  { state: 'audio', preview: { filename: 'Registrazione della seduta.mp3' } },
  { state: 'certificate', preview: { filename: 'Contratto firmato.p7m' } },
  { state: 'code', preview: { filename: 'calcolo-tributi.ts' } },
  { state: 'data', preview: { filename: 'anagrafe-2027.json' } },
  { state: 'email', preview: { filename: 'Comunicazione al cittadino.eml' } },
  { state: 'executable', preview: { filename: 'Installazione firma digitale.exe' } },
  { state: 'image, no source', preview: { filename: 'Planimetria piano terra.png' } },
  { state: 'markup', preview: { filename: 'Pagina del bando.html' } },
  { state: 'slide', preview: { filename: 'Presentazione del bilancio.odp' } },
  { state: 'spreadsheet', preview: { filename: 'Bilancio di previsione 2027.xlsx' } },
  { state: 'text', preview: { filename: 'Verbale della seduta.docx' } },
  { state: 'vector', preview: { filename: 'Stemma del comune.svg' } },
  { state: 'video', preview: { filename: 'Guida al portale dei servizi.mp4' } },
  { state: 'attachment, no extension', preview: { filename: 'LEGGIMI' } },
  {
    state: 'size in bytes',
    preview: { filename: 'Delibera di giunta n. 12.2024.pdf', filesize: '2516582' },
  },
  {
    state: 'size as text',
    preview: { filename: 'Delibera di giunta n. 12.2024.pdf', filesize: 'circa 2 MB' },
  },
  {
    state: 'description of its own',
    preview: { filename: 'Modulo di richiesta.pdf', description: 'Da firmare e restituire' },
  },
  {
    state: 'image',
    preview: {
      filename: 'Ritratto del relatore.webp',
      filesize: '84213',
      src: './fred-brooks-zoom.webp',
    },
  },
  {
    state: 'image on a kind without one',
    preview: { filename: 'Curriculum del relatore.pdf', src: './fred-brooks-zoom.webp' },
  },
  {
    state: 'icon of its own',
    preview: { filename: 'Atto notarile.pdf', icon: 'mdi/file-document-remove-outline' },
  },
  {
    state: 'message',
    preview: { filename: 'Planimetria.dwg', message: 'Formato non supportato' },
  },
  ...themeStatusVariantDictionary.map((variant) => ({
    state: `message, variant ${variant}`,
    preview: {
      filename: 'Planimetria piano terra.png',
      message: {
        error: 'File troppo grande',
        info: 'In attesa di verifica',
        success: 'Caricato',
        warning: 'Firma da verificare',
      }[variant],
      variant,
    },
  })),
  {
    state: 'message, variant primary',
    preview: { filename: 'Planimetria piano terra.png', message: 'In coda', variant: 'primary' },
  },
  {
    state: 'message, variant orchid',
    preview: { filename: 'Planimetria piano terra.png', message: 'Bozza', variant: 'orchid' },
  },
  {
    state: 'variant without a message',
    preview: { filename: 'Planimetria piano terra.png', variant: 'error' },
  },
  {
    state: 'deletable',
    preview: { filename: 'Delibera di giunta n. 12.2024.pdf', deletable: true },
  },
  {
    state: 'downloadable',
    preview: { filename: 'Delibera di giunta n. 12.2024.pdf', downloadable: true },
  },
  { state: 'long name, truncate word', preview: { filename: longName } },
  { state: 'long name, truncate all', preview: { filename: longName, truncate: 'all' } },
  { state: 'long name, truncate none', preview: { filename: longName, truncate: 'none' } },
  { state: 'suffix forced', preview: { filename: 'Regolamento comunale', suffix: 'pdf' } },
];

const TemplateStates = () => (
  <StatesGrid>
    {previewStates.map(({ state, preview }) => (
      <StateCell key={state} state={state}>
        <mds-file-preview class="w-full max-w-5600" {...preview}></mds-file-preview>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
