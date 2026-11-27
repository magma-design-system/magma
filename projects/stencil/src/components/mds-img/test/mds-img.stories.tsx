import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
import { argTypes, URLs } from '../meta/storybook';

export default {
  title: 'UI / Content / Image',
  id: 'ui-image',
  argTypes,
};

const Template = (args) => <mds-img {...args} />;

const TemplateConsumption = (args) => (
  <div class="grid gap-600 tablet:grid-cols-2 auto-rows-min">
    <div>
      <mds-img {...args} />
    </div>
    <div class="grid gap-600 max-mobile:grid-cols-1 tablet:grid-cols-1 grid-cols-3 auto-rows-min">
      <div class="grid gap-100 auto-rows-min">
        <mds-text typography="h6">Consumption Low</mds-text>
        <mds-text typography="detail">
          Image is not loaded by default, alt text attribute is displayed as content, if element is
          clicked the image is loaded.{' '}
        </mds-text>
        <mds-text typography="detail">
          It's recommended to load black and white image at 1X resolution to decrease CPU
          consumption and data bandwidth.
        </mds-text>
      </div>
      <div class="grid gap-100 auto-rows-min">
        <mds-text typography="h6">Consumption Medium</mds-text>
        <mds-text typography="detail">
          Image is loaded by default, loading attribute will be applied.
        </mds-text>
        <mds-text typography="detail">
          It's recommended to load an image at 1X resolution to decrease CPU consumption and data
          bandwidth.
        </mds-text>
      </div>
      <div class="grid gap-100 auto-rows-min">
        <mds-text typography="h6">Consumption High</mds-text>
        <mds-text typography="detail">
          Image is loaded by default, loading attribute will be applied.
        </mds-text>
      </div>
    </div>
  </div>
);

const TemplateBook = (args) => (
  <div class="grid gap-600">
    <div class="grid gap-600 max-mobile:grid-cols-1 tablet:grid-cols-1 grid-cols-3 auto-rows-min">
      <div class="grid gap-100 auto-rows-min">
        <mds-text typography="h6">Consumption Low</mds-text>
        <mds-text typography="detail">
          Set consumption to <b>low</b> in the <b>Magma accessibility</b> menu of the Storybook
          toolbar.
        </mds-text>
      </div>
    </div>
    <div class="grid gap-600 grid-cols-fit-sm">
      <mds-img {...args} />
      <mds-img
        class="aspect-book object-cover rounded-md shadow"
        src="./book-cover-11.webp"
        srcset-consumption="./book-cover-11.webp low"
        alt="Concorso regione Valle d'Aosta 86 assistenti amministrativo contabili"
      />
      <mds-img
        class="aspect-book object-cover rounded-md shadow"
        src="./book-cover-10.webp"
        srcset-consumption="./book-cover-10.webp low"
        alt="Il principio di rotazione e il regolamento degli appalti sotto soglia di lavori, forniture e servizi"
      />
    </div>
  </div>
);

export const Default = {
  render: Template,

  args: {
    src: URLs[0],
  },
};

export const AltText = {
  render: Template,

  args: {
    alt: 'This is an alternative text',
    src: URLs[0],
  },
};

export const AspectRatio = {
  render: Template,

  args: {
    class: 'aspect-square',
    src: URLs[2],
  },
};

export const SrcsetConsumption = {
  render: TemplateConsumption,

  args: {
    alt: 'This is the alt attribute text',
    'srcset-consumption':
      'https://placehold.co/600x400?text=Consumption+LOW low, https://placehold.co/300x200?text=Consumption+MEDIUM medium, https://placehold.co/1200x800/orange/green/?text=Consumption+HIGH high',
  },
};

export const SrcsetConsumptionAlternative = {
  render: TemplateConsumption,

  args: {
    alt: 'This is the alt attribute text',
    src: 'https://placehold.co/1200x800/orange/green/?text=Consumption+HIGH',
    'srcset-consumption':
      'https://placehold.co/600x400?text=Consumption+LOW low, https://placehold.co/300x200?text=Consumption+MEDIUM medium',
  },
};

export const SrcsetConsumptionBookExample = {
  render: TemplateBook,

  args: {
    class: 'aspect-book rounded-md shadow',
    alt: 'Il nuovo codice dei contratti pubblici e la disciplina vigente nel periodo transitorio',
    src: './book-cover-12.webp',
    'srcset-consumption': './book-cover-12.webp low',
  },
};

export const BrokenImage = {
  render: TemplateBook,

  args: {
    class: 'aspect-book rounded-md shadow',
    alt: 'Il nuovo codice dei contratti pubblici e la disciplina vigente nel periodo transitorio',
    src: './broken-image-path.jpg',
    'srcset-consumption': './broken-image-path.jpg low',
  },
};

/**
 * Every state of an image once the story has opened (#1440, @fixture/states), on the local
 * images of the other stories: named by its file when it has no `alt`, by its `alt`, decorative
 * with an empty `alt`, a portrait picture, a picture cropped by the box of the host, a source
 * that does not load (a file that is deliberately missing: its 404 is in the console), with and
 * without `alt`, and the sources by consumption (`srcset-consumption`). The consumption is a
 * preference of the page, not of one image: the story opens at `high`, and the placeholder that
 * `low` draws instead of the picture, with its "click to load", is seen by opening the story
 * with `&globals=consumption:low` (HOWTO.md, "A story in a preference, by link"). An image
 * has no interaction at `high`: no play function.
 */
interface ImgState {
  state: string;
  img: Record<string, string>;
}

const imgStates: ImgState[] = [
  { state: 'rest, named by its file', img: { src: './640x480.png' } },
  { state: 'alt', img: { src: './640x480.png', alt: 'Anteprima della pagina, 640 per 480 pixel' } },
  { state: 'decorative, empty alt', img: { src: './640x480.png', alt: '' } },
  {
    state: 'portrait',
    img: { src: './480x640.png', alt: 'Anteprima verticale, 480 per 640 pixel' },
  },
  {
    state: 'cropped by the host',
    img: {
      src: './1920x1024.png',
      alt: 'Anteprima panoramica, ritagliata in un quadrato',
      class: 'aspect-square object-cover',
    },
  },
  {
    state: 'source not found, alt',
    img: { src: './immagine-mancante.jpg', alt: 'Planimetria del piano terra' },
  },
  { state: 'source not found, no alt', img: { src: './immagine-mancante.jpg' } },
  {
    state: 'consumption sources, high',
    img: {
      alt: "L'appalto integrato",
      class: 'aspect-book object-cover',
      'srcset-consumption':
        './book-cover-10.webp low, ./book-cover-11.webp medium, ./book-cover-09.webp high',
    },
  },
  {
    state: 'consumption source for low only, src at high',
    img: {
      alt: 'Il nuovo Codice dei contratti pubblici e la disciplina vigente nel periodo transitorio',
      class: 'aspect-book object-cover',
      src: './book-cover-12.webp',
      'srcset-consumption': './book-cover-12.webp low',
    },
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {imgStates.map(({ state, img }) => (
      <StateCell key={state} state={state}>
        <mds-img {...img}></mds-img>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
