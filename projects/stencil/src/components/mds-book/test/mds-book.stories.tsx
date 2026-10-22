import { h } from '@stencil/core';
import { bindingDictionary, formatDictionary, poseDictionary } from '../meta/dictionary';
import { loadingDictionary } from '@type/loading';

export default {
  title: 'UI / Book',
  argTypes: {
    alt: {
      description:
        'The accessible name of the book; without it the name is built from name and author',
      type: { name: 'string', required: false },
    },
    author: {
      description: 'The author, printed on the spine and on the drawn cover',
      type: { name: 'string', required: false },
    },
    binding: {
      control: { type: 'select' },
      description: 'How the book is bound: a flexible cover, or rigid boards',
      options: bindingDictionary,
      type: { name: 'string', required: false },
    },
    format: {
      control: { type: 'select' },
      description:
        'The proportions of the book: auto takes them from the image; any other format is WxH in centimetres',
      options: [...formatDictionary, '17x24', '24x17', '21x21', '29.7x21'],
      type: { name: 'string', required: false },
    },
    loading: {
      control: { type: 'select' },
      description: 'Whether the cover loads immediately or near the viewport',
      options: loadingDictionary,
      type: { name: 'string', required: false },
    },
    name: {
      description: 'The title, printed on the spine and on the drawn cover',
      type: { name: 'string', required: false },
    },
    pages: {
      control: { type: 'number', min: 4, max: 3000, step: 4 },
      description: 'The number of pages, which sets how deep the book is',
      type: { name: 'number', required: false },
    },
    pose: {
      control: { type: 'select' },
      description: 'How the book is shown: standing, facing the reader, or lying',
      options: poseDictionary,
      type: { name: 'string', required: false },
    },
    publisher: {
      description: 'The publisher, printed at the foot of the spine and of the drawn cover',
      type: { name: 'string', required: false },
    },
    src: {
      control: { type: 'select' },
      description: 'Specifies the path to the image of the front cover',
      options: Array.from(
        { length: 12 },
        (_, i) => `./book-cover-${String(i + 1).padStart(2, '0')}.webp`,
      ),
      type: { name: 'string', required: false },
    },
  },
};

// a square cover drawn inline, so the story needs no network
const squareCover = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="#0b6e4f"/><rect x="60" y="60" width="480" height="480" fill="none" stroke="#f4d35e" stroke-width="6"/><text x="300" y="290" fill="#f4d35e" font-family="sans-serif" font-size="64" font-weight="700" text-anchor="middle">Codici</text><text x="300" y="360" fill="#ffffff" font-family="sans-serif" font-size="32" text-anchor="middle">edizione tascabile</text></svg>',
)}`;

const cover = (n: number) => `./book-cover-${String(n).padStart(2, '0')}.webp`;

// the titles of the twelve covers in assets/, in order
const titles = [
  'Espropriazione per pubblica utilità',
  'Concorso DSGA, teoria e test',
  'Casi e questioni di contenzioso societario',
  'Gli appalti pubblici dopo il nuovo Codice',
  'Il nuovo Codice dei contratti pubblici',
  'Le principali novità del nuovo Codice dei contratti pubblici',
  'Concorso istruttore e istruttore direttivo',
  'La ricerca telematica dei beni da pignorare',
  "L'appalto integrato",
  'Il principio di rotazione e il regolamento degli appalti sotto soglia',
  "Concorso regione Valle d'Aosta, 86 assistenti amministrativo contabili",
  'Il nuovo Codice dei contratti pubblici e la disciplina vigente nel periodo transitorio',
];

// The layouts follow the width of the canvas, not of the viewport: a container query sets
// how many books a row holds, so a book never shrinks to a thumbnail, and a cell keeps it to
// 320 px, so it never grows into a poster either.
const Stage = ({ children }: { children?: unknown }) => (
  <div class="@container p-1200">{children}</div>
);

const Template = (args) => (
  <Stage>
    <div class="mx-auto w-full max-w-[320px]">
      <mds-book {...args} />
    </div>
  </Stage>
);

const Row = ({ label, children }: { label: string; children?: unknown }) => (
  <div class="grid w-full max-w-[320px] gap-400 auto-rows-min justify-self-center">
    {children}
    <mds-text typography="caption" class="text-center">
      {label}
    </mds-text>
  </div>
);

// how many books a row holds, by the width of the canvas
const twoBooks = 'grid gap-1200 items-end grid-cols-1 @md:grid-cols-2';
const fourBooks = 'grid gap-1200 items-end grid-cols-1 @md:grid-cols-2 @5xl:grid-cols-4';
const fiveBooks =
  'grid gap-1200 items-end grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-3 @6xl:grid-cols-5';

export const Default = {
  render: Template,
  args: {
    author: 'Damiano Marinelli e Saverio Sabatini',
    name: 'Casi e questioni di contenzioso societario',
    publisher: 'Maggioli Editore',
    src: cover(3),
  },
};

export const Pages = {
  render: (args) => (
    <Stage>
      <div class={fiveBooks}>
        {[64, 150, 300, 600, 1000].map((pages) => (
          <Row key={pages} label={`${pages} pages`}>
            <mds-book {...args} pages={pages} />
          </Row>
        ))}
      </div>
    </Stage>
  ),
  args: {
    name: 'Gli appalti pubblici dopo il nuovo Codice',
    publisher: 'Maggioli Editore',
    src: cover(4),
  },
};

export const Binding = {
  render: (args) => (
    <Stage>
      <div class={twoBooks}>
        <Row label="paperback">
          <mds-book {...args} binding="paperback" />
        </Row>
        <Row label="hardcover">
          <mds-book {...args} binding="hardcover" />
        </Row>
      </div>
    </Stage>
  ),
  args: {
    name: 'Espropriazione per pubblica utilità',
    publisher: 'Maggioli Editore',
    src: cover(1),
    pages: 640,
  },
};

export const Pose = {
  render: (args) => (
    <Stage>
      <div class={`${fiveBooks} gap-y-1600`}>
        {poseDictionary.map((pose) => (
          <Row key={pose} label={pose}>
            <mds-book {...args} pose={pose as 'spine'} />
          </Row>
        ))}
      </div>
    </Stage>
  ),
  args: {
    binding: 'hardcover',
    name: 'Il nuovo Codice dei contratti pubblici e la disciplina vigente nel periodo transitorio',
    publisher: 'Maggioli Editore',
    src: cover(12),
    pages: 640,
  },
};

export const Format = {
  render: () => (
    <Stage>
      <div class={fourBooks}>
        <Row label="auto, from a 17x24 cover">
          <mds-book src={cover(9)} name="L'appalto integrato" />
        </Row>
        <Row label="auto, from a square cover">
          <mds-book src={squareCover} name="Codici" author="Redazione" />
        </Row>
        <Row label="a4, no image">
          <mds-book
            format="a4"
            name="Modulistica per gli uffici"
            author="Mario Rossi"
            publisher="Maggioli Editore"
          />
        </Row>
        <Row label="29.7x21, landscape">
          <mds-book format="29.7x21" name="Atlante dei comuni" publisher="Maggioli Editore" />
        </Row>
      </div>
    </Stage>
  ),
};

export const DrawnCover = {
  render: Template,
  args: {
    author: 'Michele Iaselli',
    name: 'Chief AI Officer',
    publisher: 'Maggioli Editore',
    pages: 640,
  },
};

export const CustomColors = {
  render: () => (
    <Stage>
      <div class={twoBooks}>
        <Row label="--mds-book-color">
          <mds-book
            name="Agenda dei servizi demografici 2027"
            publisher="Maggioli Editore"
            pages={640}
            style={{ '--mds-book-color': '#f2a93b', '--mds-book-text-color': '#ffffff' }}
          />
        </Row>
        <Row label="--mds-book-spine-color">
          <mds-book
            src={cover(5)}
            name="Il nuovo Codice dei contratti pubblici"
            pages={640}
            binding="hardcover"
            style={{ '--mds-book-spine-color': '#123a6b' }}
          />
        </Row>
      </div>
    </Stage>
  ),
};

export const Catalogue = {
  render: () => (
    <Stage>
      <div class="grid gap-1200 grid-cols-1 @sm:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-6">
        {Array.from({ length: 12 }, (_, i) => (
          <mds-book
            key={i}
            class="w-full max-w-[320px] justify-self-center"
            src={cover(i + 1)}
            binding={i % 3 === 0 ? 'hardcover' : 'paperback'}
            pages={[320, 640, 96, 1000][i % 4]}
            name={titles[i]}
            publisher="Maggioli Editore"
          />
        ))}
      </div>
    </Stage>
  ),
};
