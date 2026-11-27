import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
import {
  bibliographyFormatDictionary,
  bibliographyRelationshipDictionary,
} from '../meta/dictionary';
import { typographyInfoDictionary, typographyVariationsDictionary } from '@type/typography';

export default {
  title: 'UI / Content / Bibliography',
  id: 'ui-bibliography',
  argTypes: {
    author: {
      type: { name: 'string' },
      description:
        'Specifies a single or mupltiple authors, this field expect a string or an array of strings. First name and Last name: "Jhon Doe", you can wrap first name or last name to crop them correctly: "\'Jhon Arthur\' Doe", "\'Jhon Arthur\' \'Doe Jhonson\'", and for multiple authors ["\'Jhon Arthur\' \'Doe Jhonson\'", "Mike Collins", "Erik \'Ross Anderson\'"], you can use single or double quotation marks for composite names',
    },
    date: {
      type: { name: 'string' },
      description: 'Specifies the date of the bibliography',
      control: { type: 'date' },
    },
    format: {
      type: { name: 'string' },
      description: 'Specifies the bibliography format to rapresent the bibliography content',
      options: bibliographyFormatDictionary,
      control: { type: 'select' },
    },
    location: {
      type: { name: 'string' },
      description: 'Specifies the location of the bibliography',
    },
    name: {
      type: { name: 'string' },
      description: 'Specifies the name of the bibliography',
    },
    publisher: {
      type: { name: 'string' },
      description: 'Specifies the publisher of the bibliography',
    },
    rel: {
      type: { name: 'string' },
      description: 'Specifies relationship between the current document and the URL',
      options: bibliographyRelationshipDictionary,
      control: { type: 'select' },
    },
    typography: {
      type: { name: 'string' },
      description: 'Specifies the font typography of the element',
      options: typographyInfoDictionary,
      control: { type: 'select' },
    },
    variant: {
      description: 'Specifies the variant for `typography`',
      options: typographyVariationsDictionary,
      control: { type: 'select' },
    },
    url: {
      type: { name: 'string' },
      description: 'Specifies the URL of the bibliography',
    },
  },
};

const Template = (args) => <mds-bibliography {...args} />;

export const Default = {
  render: Template,
};

export const AuthorExample1 = {
  render: Template,

  args: {
    author: 'Mario Rossi',
    date: '2012-08-03',
    location: 'Milano',
    name: 'Grosso guaio a Chinatown',
    publisher: 'Decca Libri',
    url: 'https://www.maggioli.com',
  },
};

export const AuthorExample2 = {
  render: Template,

  args: {
    author: '"Mark Jacob" Jhonson',
    date: '2012-08-03',
    location: 'Milano',
    name: 'Grosso guaio a Chinatown',
    publisher: 'Decca Libri',
    url: 'https://www.maggioli.com',
  },
};

export const AuthorExample3 = {
  render: Template,

  args: {
    author: '"Mario Rossi", "Luigi Verdi"',
    date: '2012-08-03',
    location: 'Milano',
    name: 'Grosso guaio a Chinatown',
    publisher: 'Decca Libri',
    url: 'https://www.maggioli.com',
  },
};

export const AuthorExample4 = {
  render: Template,

  args: {
    author: '"Mark Jacob" Jhonson, Evelyn \'Ross Bianchetti\', "Jhon Antuan" "Parisi Marchi"',
    date: '2012-08-03',
    location: 'Milano',
    name: 'Grosso guaio a Chinatown',
    publisher: 'Decca Libri',
    url: 'https://www.maggioli.com',
  },
};

/**
 * Every state of a bibliographic reference once the story has opened (#1440, @fixture/states):
 * each `format` with every part given, the title as a link with a `url` and as plain text
 * without, one author, several authors and composite names, the references that miss a part
 * (no title, no date, no place and publisher), the typographies it takes and the reading
 * variant, and a title long enough to wrap. A reference has no interaction of its own (the link
 * is a native one): no play function.
 */
interface ReferenceState {
  state: string;
  reference: Record<string, string>;
}

const book = {
  author: 'Mario Rossi',
  date: '2023-03-15',
  location: 'Santarcangelo di Romagna',
  name: 'Il nuovo Codice dei contratti pubblici',
  publisher: 'Maggioli Editore',
  url: 'https://www.maggiolieditore.it',
};

// the reference without one of its parts, as a product leaves it out (not an empty value)
const without = (part: keyof typeof book): Record<string, string> =>
  Object.fromEntries(Object.entries(book).filter(([key]) => key !== part));

const referenceStates: ReferenceState[] = [
  { state: 'rest, apa', reference: book },
  { state: 'format mla', reference: { ...book, format: 'mla' } },
  { state: 'format turabian', reference: { ...book, format: 'turabian' } },
  { state: 'without a url, title as text', reference: without('url') },
  { state: 'two authors, apa', reference: { ...book, author: 'Mario Rossi, Luigi Verdi' } },
  {
    state: 'two authors, mla',
    reference: { ...book, author: 'Mario Rossi, Luigi Verdi', format: 'mla' },
  },
  {
    state: 'composite names',
    reference: { ...book, author: "'Anna Maria' Bianchi, Paolo 'De Santis Neri'" },
  },
  { state: 'without a title', reference: without('name') },
  { state: 'without a date', reference: without('date') },
  { state: 'without a date, mla', reference: { ...without('date'), format: 'mla' } },
  {
    state: 'author and title only',
    reference: { author: book.author, name: book.name },
  },
  { state: 'typography caption', reference: { ...book, typography: 'caption' } },
  { state: 'typography paragraph', reference: { ...book, typography: 'paragraph' } },
  {
    state: 'paragraph, variant read',
    reference: { ...book, typography: 'paragraph', variant: 'read' },
  },
  {
    state: 'long title',
    reference: {
      ...book,
      author: 'Mario Rossi, Luigi Verdi, Anna Bianchi',
      name: 'Il principio di rotazione e il regolamento degli appalti sotto soglia di lavori, forniture e servizi dopo il correttivo',
    },
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {referenceStates.map(({ state, reference }) => (
      <StateCell key={state} state={state}>
        <div>
          <mds-bibliography {...reference}></mds-bibliography>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
