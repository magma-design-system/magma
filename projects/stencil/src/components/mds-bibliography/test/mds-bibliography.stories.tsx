import { h } from '@stencil/core'
import {
  bibliographyFormatDictionary,
  bibliographyRelationshipDictionary,
} from '../meta/dictionary'
import {
  typographyInfoDictionary,
  typographyVariationsDictionary,
} from '@type/typography'

export default {
  title: 'UI / Bibliography',
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
      description:
        'Specifies the bibliography format to rapresent the bibliography content',
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
      description:
        'Specifies relationship between the current document and the URL',
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
}

const Template = args => <mds-bibliography {...args} />

export const Default = {
  render: Template,
}

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
}

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
}

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
}

export const AuthorExample4 = {
  render: Template,

  args: {
    author:
      '"Mark Jacob" Jhonson, Evelyn \'Ross Bianchetti\', "Jhon Antuan" "Parisi Marchi"',
    date: '2012-08-03',
    location: 'Milano',
    name: 'Grosso guaio a Chinatown',
    publisher: 'Decca Libri',
    url: 'https://www.maggioli.com',
  },
}
