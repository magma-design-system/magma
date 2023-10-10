// this script generate a json file that can be imported to figma through 'Import/Export Variables' plugin only.
// https://www.figma.com/plugin-docs/working-with-variables/#createvariable

import defaultTokens from '../properties/color/generated/default.json'
import { writeFile } from 'fs-extra'
import { DIST_DIR } from './meta'

enum VariableType {
  Color = 'COLOR',
  Number = 'FLOAT',
  Text = 'STRING',
  Boolean = 'BOOLEAN',
}

enum Scope {
  All = 'ALL_SCOPES',
  AllFills = 'ALL_FILLS',
  Frame = 'FRAME_FILL',
  Shape = 'SHAPE_FILL',
  Text = 'TEXT_FILL',
  Stroke = 'STROKE_COLOR',
}

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface CodeSyntax {
  WEB?: string;
  ANDROID?: string;
  iOS?: string;
}

interface Collection {
  id: string;
  name: string;
  modes: { [key: string]: string };
  variableIds: string[];
  variables: Variable[];
}

interface Variable {
  id: string;
  name: string;
  description: string;
  type: VariableType;
  valuesByMode: { [key: string]: Color };
  resolvedValuesByMode: {
    [key: string]: {
      resolvedValue: Color;
      alias?: string;
    };
  };
  scopes: Scope[];
  hiddenFromPublishing: boolean;
  codeSyntax?: CodeSyntax;
}

const capitalizeFirstLetter = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1)


const generateFigmaTokens = (nameCollection: string, tokens) => {
  const lightMode = 'light'
  const darkMode = 'dark'

  const collection: Collection = {
    id: 'VariableCollectionId:1',
    name: nameCollection,
    modes: {},
    variableIds: [],
    variables: [],
  }
  collection.modes[lightMode] = 'Light'
  collection.modes[darkMode] = 'Dark'

  const variables = buildVariables(tokens)

  collection.variableIds = Array.from(variables.keys())
  collection.variables = Array.from(variables.values())

  writeFile(`${DIST_DIR}/json/figma-${nameCollection.toLocaleLowerCase().replace(/\s/g, '-')}.json`, JSON.stringify(collection))
}

const buildVariables = (tokens): Map<string, Variable> => {
  const variables: Map<string, Variable> = new Map()

  /**
   * change structure from
   * {
   *  "light": {
   *      "1": { "value": #000000 },
   *      ...
   *    },
   *  "dark": {
   *      "1": { "value": #ffffff },
   *      ...
   *    },
   * }
   * to
   * {
   *  "1": {
   *       "light": #fffff,
   *       "dark": #00000,
   *  },
   *  ...
   * }
   */
  Object.entries(tokens.color).forEach(group => {
    Object.entries(group[1]).forEach(name => {
      Object.entries(name[1]).forEach(lightMode => {
        Object.entries(lightMode[1]).forEach(palette => {
          let paletteId: string|number = palette[0]
          if (!isNaN(parseInt(paletteId)) && parseInt(paletteId) < 10) {
            paletteId = `0${paletteId}`
          }
          const paletteUID = `${capitalizeFirstLetter(group[0])}:${capitalizeFirstLetter(name[0])}:${paletteId}`

          const colorRGB = hexToRgbA(palette[1].value)
          if (!variables.get(paletteUID)) {
            variables.set(paletteUID, {
              id: paletteUID,
              name: paletteUID.replace(/:/g, '/').replace('color', 'seed'),
              description: '',
              type: VariableType.Color,
              valuesByMode: {},
              resolvedValuesByMode: {},
              scopes: [Scope.All],
              hiddenFromPublishing: false,
            })
          }

          /**
           * the value of lightMode[0] is equals to lighMode or darkMode variable,
           * this permits to use as key of mode in valuesByMode and resolvedValuesByMode object
           * so it can be set the right light mode of that variable
           */
          const variable = variables.get(paletteUID)
          variable.valuesByMode[lightMode[0]] = colorRGB
          variable.resolvedValuesByMode[lightMode[0]] = {
            resolvedValue: colorRGB,
            alias: null,
          }
        })
      })
    })
  })
  return variables
}

const hexToRgbA = (hex: string): Color => {
  let c
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('')
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]]
    }
    c = '0x' + c.join('')
    return {
      r: ((c >> 16) & 255) / 255,
      g: ((c >> 8) & 255) / 255,
      b: (c & 255) / 255,
      a: 1,
    }
  }
  throw new Error('Bad Hex')
}

generateFigmaTokens('Magma Colors', defaultTokens)
