// this script generate a json file that can be imported to figma through 'Import/Export Variables' plugin only.
// https://www.figma.com/plugin-docs/working-with-variables/#createvariable
import chalk from 'chalk'
import defaultTokens from '../tokens/color/generated/default.json'
import spacing from '../tokens/sizing/default.json'
import gap from '../tokens/sizing/gap.json'
import screen from '../tokens/screen/default.json'
import borderRadius from '../tokens/cosmetic/border-radius.json'
import { writeFile } from 'fs-extra'
import { mkdir } from 'fs/promises'
import { resolve } from 'path'
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
  valuesByMode: { [key: string]: Color | number | string | boolean };
  resolvedValuesByMode: {
    [key: string]: {
      resolvedValue: Color | number | string | boolean;
      alias?: string;
    };
  };
  scopes: Scope[];
  hiddenFromPublishing: boolean;
  codeSyntax?: CodeSyntax;
}

const capitalizeFirstLetter = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1)


const generateFigmaTokens = (nameCollection: string) => {
  const collection: Collection = {
    id: 'VariableCollectionId:1',
    name: nameCollection,
    modes: { value: 'Value' },
    variableIds: [],
    variables: [],
  }

  const variables = new Map([
    ...buildTokenVariables('Spacing', spacing),
    ...buildTokenVariables('Gap', gap),
    ...buildTokenVariables('BorderRadius', borderRadius),
    ...buildScreenToken('Screen', screen),
  ])

  // console.log(variables)
  collection.variableIds = Array.from(variables.keys())
  collection.variables = Array.from(variables.values())

  // collection.variables.forEach(console.log)
  writeFigmaVariables(collection)
}

const generateFigmaColors = (nameCollection: string, tokens) => {
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

  const variables = buildColorVariables(tokens)

  collection.variableIds = Array.from(variables.keys())
  collection.variables = Array.from(variables.values())

  writeFigmaVariables(collection)
}

const buildScreenToken = (name: string, tokens): Map<string, Variable> => {
  const variables: Map<string, Variable> = new Map()
  Object.entries(tokens).forEach(type => {
    Object.entries(type[1]).forEach(subtype => {
      Object.entries(subtype[1]).forEach(token => {
        if (token[0] === 'min') {
          const UID = `${name}:${subtype[0]}`
          // eslint-disable-next-line dot-notation
          const value = getValue(token[1]['value'])
          variables.set(UID, {
            id: UID,
            name: UID.replace(/:/g, '/'),
            description: '',
            type: VariableType.Number,
            valuesByMode: {
              value,
            },
            resolvedValuesByMode: {
              value: {
                resolvedValue: value,
                alias: null,
              },
            },
            scopes: [Scope.All],
            hiddenFromPublishing: false,
          })
        }
      })
    })
  })
  return variables

}
const buildTokenVariables = (name: string, tokens): Map<string, Variable> => {
  const variables: Map<string, Variable> = new Map()
  Object.entries(tokens).forEach(type => {
    Object.entries(type[1]).forEach(subtype => {
      Object.entries(subtype[1]).forEach(token => {
        const UID = `${name}:${token[0]}`
        // eslint-disable-next-line dot-notation
        const value = getValue(token[1]['value'] as string)

        variables.set(UID, {
          id: UID,
          name: UID.replace(/:/g, '/'),
          description: '',
          type: VariableType.Number,
          valuesByMode: {
            value,
          },
          resolvedValuesByMode: {
            value: {
              resolvedValue: value,
              alias: null,
            },
          },
          scopes: [Scope.All],
          hiddenFromPublishing: false,
        })
      })
    })
  })
  return variables
}

/**
 * Get a number value resolving also reference value between spacing and gap
 * @param value a string rappresenting value "1px" or "{spacing.sizing.1000}"
 * @returns value as number
 */
const getValue = (value: string): number => {
  if (value.startsWith('{')) {
    const ref = value.slice(1, -1).split('.')
    if (ref[1] === 'gap') {
      return getValue(gap[ref[0]][ref[1]][ref[2]].value)
    }
    return getValue(spacing[ref[0]][ref[1]][ref[2]].value)
  }
  return Number(value.match(/\d+/)[0])
}
const buildColorVariables = (tokens): Map<string, Variable> => {
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

const writeFigmaVariables = (collection: Collection) => {
  mkdir( resolve(`${DIST_DIR}/json`), { recursive: true })
    .then(() => {
      writeFile(`${DIST_DIR}/json/figma-${collection.name.toLocaleLowerCase().replace(/\s/g, '-')}.json`, JSON.stringify(collection))
    })
    .catch(error => {
      throw Error(chalk.red(error))
    })
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

generateFigmaColors('Magma Colors', defaultTokens)

generateFigmaTokens('Magma Tokens')
