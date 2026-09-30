// Generates token files importable into Figma. Colors are emitted in the W3C
// DTCG standard format (`$type`/`$value`), one file per theme mode, importable
// as Figma Variables. The sizing/number tokens still use the legacy
// 'Import/Export Variables' plugin collection format for now.
// https://tr.designtokens.org/format/
import chalk from 'chalk';
import { colorsToDtcg, type ColorMode } from '../src/lib/dtcg.mjs';
import defaultTokens from '../tokens/color/generated/default.json';
import primitive from '../tokens/sizing/primitive.json';
import spacing from '../tokens/sizing/spacing.json';
import gap from '../tokens/sizing/gap.json';
import screen from '../tokens/screen/default.json';
import radius from '../tokens/sizing/radius.json';
import { readJSON, readdir, writeFile } from 'fs-extra';
import { mkdir } from 'fs/promises';
import { resolve } from 'path';
import { DIST_DIR, TOKENS_DIR } from './meta';

const COLOR_DIR = `${TOKENS_DIR}/color/generated`;

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
  WidthHeight = 'WIDTH_HEIGHT',
  Gap = 'GAP',
  CornerRadius = 'CORNER_RADIUS',
  ParagraphSpacing = 'PARAGRAPH_SPACING',
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
      alias?: string | null;
    };
  };
  scopes: Scope[];
  hiddenFromPublishing: boolean;
  codeSyntax?: CodeSyntax;
}

type TokenValue = { value: string };
type TokenTree = Record<string, Record<string, Record<string, TokenValue>>>;
interface FigmaColorTokens {
  color: Record<
    string,
    Record<
      string,
      {
        light: Record<string, TokenValue>;
        dark: Record<string, TokenValue>;
      }
    >
  >;
}

const generateFigmaTokens = (nameCollection: string) => {
  const collection: Collection = {
    id: 'VariableCollectionId:1',
    name: nameCollection,
    modes: { value: 'Value' },
    variableIds: [],
    variables: [],
  };

  const variables = new Map([
    ...buildTokenVariables('Spacing', { sizing: { spacing: spacing.spacing } }, [
      Scope.WidthHeight,
    ]),
    ...buildTokenVariables('Container', { sizing: { container: spacing.container } }, [
      Scope.WidthHeight,
    ]),
    ...buildTokenVariables('Gap', gap, [Scope.Gap, Scope.ParagraphSpacing]),
    ...buildTokenVariables('BorderRadius', { borderRadius: radius }, [Scope.CornerRadius]),
    ...buildScreenToken('Screen', screen, [Scope.WidthHeight]),
    ...buildTokenVariables('Primitive', primitive),
  ]);

  // console.log(variables)
  collection.variableIds = Array.from(variables.keys());
  collection.variables = Array.from(variables.values());

  // collection.variables.forEach(console.log)
  writeFigmaVariables(collection);
};

const buildScreenToken = (
  name: string,
  tokens: TokenTree,
  scopes?: Scope[],
): Map<string, Variable> => {
  const variables: Map<string, Variable> = new Map();
  Object.entries(tokens).forEach((type) => {
    Object.entries(type[1]).forEach((subtype) => {
      Object.entries(subtype[1]).forEach((token) => {
        if (token[0] === 'min') {
          const UID = `${name}:${subtype[0]}`;

          const value = getValue(token[1]['value']);
          if (value) {
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
              scopes: scopes ?? [Scope.All],
              hiddenFromPublishing: false,
            });
          }
        }
      });
    });
  });
  return variables;
};

const buildTokenVariables = (
  name: string,
  tokens: TokenTree,
  scopes?: Scope[],
): Map<string, Variable> => {
  const variables: Map<string, Variable> = new Map();
  Object.entries(tokens).forEach((type) => {
    Object.entries(type[1]).forEach((subtype) => {
      Object.entries(subtype[1]).forEach((token) => {
        const UID = `${name}:${token[0]}`;
        const value = getValue(token[1]['value'] as string);
        if (value && !isNaN(Number(value))) {
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
            scopes: scopes ?? [Scope.All],
            hiddenFromPublishing: false,
          });
        }
      });
    });
  });
  return variables;
};

/**
 * Get a number value resolving also reference value between spacing and gap
 * @param value a string rappresenting value "1px" or "{spacing.sizing.1000}"
 * @returns value as number
 */
const getValue = (value: string): number | undefined => {
  if (!value) return;
  // tokens reference "{spacing.sizing.1000}"
  if (value.startsWith('{')) {
    const ref = value.slice(1, -1).split('.');
    if (ref[1] === 'gap') {
      return getValue((gap as TokenTree)[ref[0]][ref[1]][ref[2]].value);
    }
    return getValue((primitive as TokenTree)[ref[0]][ref[1]][ref[2]].value);
  }
  // tokens where unit isn't px are ignored
  if (!value.endsWith('px')) return;
  const digits = value.match(/\d+/);
  return digits ? Number(digits[0]) : undefined;
};
const writeFigmaVariables = (collection: Collection) => {
  mkdir(resolve(`${DIST_DIR}/json`), { recursive: true })
    .then(() => {
      writeFile(
        `${DIST_DIR}/json/figma-${collection.name.toLocaleLowerCase().replace(/\s/g, '-')}.json`,
        JSON.stringify(collection),
      );
    })
    .catch((error) => {
      throw Error(chalk.red(error));
    });
};

const mergeTokens = async () => {
  const brandColors = await readdir(COLOR_DIR).then((files) => {
    // read all brand json file and merge them
    return Promise.all(
      files
        .filter((name) => name.startsWith('brand'))
        .map((brand) => readJSON(`${COLOR_DIR}/${brand}`)),
    ).then((brands) =>
      brands
        .map((json) => json.color.brand)
        .reduce((prev, current) => Object.assign(prev, { ...current })),
    );
  });
  const tokens = defaultTokens as FigmaColorTokens;
  tokens.color.brand = sortJsonByKeys(brandColors, (a, b) =>
    b.localeCompare(a),
  ) as unknown as FigmaColorTokens['color'][string];
  return tokens;
};

function sortJsonByKeys(
  json: Record<string, unknown>,
  compareFn: (a: string, b: string) => number,
): Record<string, unknown> {
  return Object.keys(json)
    .sort(compareFn)
    .reduce<Record<string, unknown>>((obj, key) => {
      obj[key] = json[key];
      return obj;
    }, {});
}

// deterministic, pretty, newline-terminated DTCG file (one per theme mode)
const writeDtcgColors = async (name: string, tokens: FigmaColorTokens) => {
  await mkdir(resolve(`${DIST_DIR}/json`), { recursive: true });
  await Promise.all(
    (['light', 'dark'] as ColorMode[]).map((mode) =>
      writeFile(
        `${DIST_DIR}/json/${name}-${mode}.tokens.json`,
        JSON.stringify(colorsToDtcg(tokens.color, mode), null, 2) + '\n',
      ),
    ),
  );
};

(async () => {
  try {
    await writeDtcgColors('figma-magma-colors', await mergeTokens());
  } catch (error) {
    throw Error(chalk.red(error as string));
  }
})();

generateFigmaTokens('Magma Tokens');
