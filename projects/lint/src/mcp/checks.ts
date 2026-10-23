/*
  The check tools. check_markup runs the lint shipped in magma on a snippet, before it is
  written, with the ESLint, Stylelint and parsers the project installed (agents/lint.md).
  check_setup looks at the project and says what its Magma integration misses: versions out of
  the range magma depends on, a style package or a font not installed, the lint or this server
  not configured. Neither changes a file.
*/
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import magma from '../eslint/index.js';
import { magmaRoot } from '../core/data.js';
import { packageDir, readJsonFile, type ToolContext } from './context.js';
import { tokensOf } from './tokens.js';
import { ToolError, type Tool } from './protocol.js';

/** A module of the project: resolved from it, so a strict package manager finds it too. */
const importFromProject = async (
  context: ToolContext,
  id: string,
): Promise<Record<string, unknown> | undefined> => {
  try {
    const file = createRequire(path.join(context.root, 'package.json')).resolve(id);
    return (await import(pathToFileURL(file).href)) as Record<string, unknown>;
  } catch {
    try {
      return (await import(id)) as Record<string, unknown>;
    } catch {
      return undefined;
    }
  }
};

const LANGUAGES = ['html', 'angular', 'jsx', 'tsx', 'css', 'scss'] as const;
type Language = (typeof LANGUAGES)[number];

/** The parser each template language needs, and the file name the snippet is linted as. */
const TEMPLATES: Record<Exclude<Language, 'css' | 'scss'>, { parser?: string; file: string }> = {
  html: { parser: '@html-eslint/parser', file: 'snippet.html' },
  angular: { parser: '@angular-eslint/template-parser', file: 'snippet.component.html' },
  jsx: { file: 'snippet.jsx' },
  tsx: { parser: '@typescript-eslint/parser', file: 'snippet.tsx' },
};

interface Finding {
  rule: string;
  severity: 'error' | 'warning';
  message: string;
  line: number;
  column: number;
}

export const checkMarkup = (context: ToolContext): Tool => ({
  name: 'check_markup',
  title: 'Check a snippet with the Magma lint',
  description:
    'Run the Magma lint on a snippet before writing it: prop values outside their union, "false" booleans, icon-only controls without a name, raw palette classes (templates), raw colours and prefers-color-scheme queries (CSS). Uses the ESLint, Stylelint and parsers the project installed; strict preset by default, so every finding is shown.',
  inputSchema: {
    type: 'object',
    properties: {
      code: { type: 'string', description: 'The snippet.' },
      language: {
        type: 'string',
        enum: [...LANGUAGES],
        description: 'html, angular (an Angular template), jsx, tsx, css or scss.',
      },
      preset: {
        type: 'string',
        enum: ['recommended', 'strict'],
        description: 'strict (default) or recommended, the severities of an existing product.',
      },
    },
    required: ['code', 'language'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      language: { type: 'string' },
      preset: { type: 'string' },
      findings: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            rule: { type: 'string' },
            severity: { type: 'string', enum: ['error', 'warning'] },
            message: { type: 'string' },
            line: { type: 'number' },
            column: { type: 'number' },
          },
          required: ['rule', 'severity', 'message', 'line', 'column'],
        },
      },
    },
    required: ['language', 'preset', 'findings'],
  },
  run: async ({ code, language, preset }) => {
    if (typeof code !== 'string') throw new ToolError('Give the snippet as code.');
    if (!LANGUAGES.includes(language as Language))
      throw new ToolError(`language is one of ${LANGUAGES.join(', ')}.`);
    const lang = language as Language;
    const severities = preset === 'recommended' ? 'recommended' : 'strict';

    if (lang === 'css' || lang === 'scss') {
      const stylelint = (await importFromProject(context, 'stylelint'))?.default as
        | {
            lint: (options: Record<string, unknown>) => Promise<{
              results: Array<{
                warnings: Array<{
                  rule: string;
                  severity: string;
                  text: string;
                  line: number;
                  column: number;
                }>;
              }>;
            }>;
          }
        | undefined;
      if (!stylelint)
        throw new ToolError(
          'check_markup needs Stylelint in the project for CSS: npm i -D stylelint (agents/lint.md).',
        );
      const syntax =
        lang === 'scss' ? (await importFromProject(context, 'postcss-scss'))?.default : undefined;
      if (lang === 'scss' && !syntax)
        throw new ToolError(
          'check_markup needs postcss-scss in the project for SCSS: npm i -D postcss-scss.',
        );
      // loaded only here: the server runs without Stylelint until CSS is asked for
      const config = (severities === 'strict'
        ? await import('../stylelint/strict.js')
        : await import('../stylelint/recommended.js')
      ).default as unknown as Record<string, unknown>;
      const { results } = await stylelint.lint({
        code,
        config,
        ...(syntax ? { customSyntax: syntax } : {}),
      });
      return {
        language: lang,
        preset: severities,
        findings: (results[0]?.warnings ?? [])
          .filter(({ rule }) => rule.startsWith('magma/'))
          .map(({ rule, severity, text, line, column }) => ({
            rule,
            severity: severity === 'error' ? 'error' : 'warning',
            message: text,
            line,
            column,
          })),
      };
    }

    const eslint = (await importFromProject(context, 'eslint')) as
      | {
          Linter?: new (options: { cwd: string }) => {
            verify: (
              code: string,
              config: unknown[],
              options: { filename: string },
            ) => Array<{
              ruleId: string | null;
              severity: number;
              message: string;
              line: number;
              column: number;
              fatal?: boolean;
            }>;
          };
        }
      | undefined;
    if (!eslint?.Linter)
      throw new ToolError(
        'check_markup needs ESLint in the project: npm i -D eslint (agents/lint.md).',
      );
    const { parser, file } = TEMPLATES[lang];
    const parserModule = parser ? await importFromProject(context, parser) : undefined;
    if (parser && !parserModule)
      throw new ToolError(
        `check_markup needs ${parser} in the project for ${lang}: npm i -D ${parser} (agents/lint.md).`,
      );
    const linter = new eslint.Linter({ cwd: context.root });
    const messages = linter.verify(
      code,
      [
        {
          files: [`**/${file.replace(/^snippet/, '*')}`],
          languageOptions: {
            ...(parserModule ? { parser: (parserModule.default ?? parserModule) as unknown } : {}),
            parserOptions: { ecmaFeatures: { jsx: true } },
          },
          ...magma.configs[severities],
          settings: { magma: { ...context.settings, root: context.root } },
        },
      ],
      { filename: path.join(context.root, file) },
    );
    const fatal = messages.find((one) => one.fatal);
    if (fatal)
      throw new ToolError(
        `The snippet does not parse as ${lang}: ${fatal.message} (line ${fatal.line}).`,
      );
    return {
      language: lang,
      preset: severities,
      findings: messages
        .filter((one) => one.ruleId?.startsWith('magma/'))
        .map(({ ruleId, severity, message, line, column }): Finding => ({
          rule: ruleId!,
          severity: severity === 2 ? 'error' : 'warning',
          message,
          line,
          column,
        })),
    };
  },
});

// --- check_setup -----------------------------------------------------------------------

/** `x.y.z` satisfies a range of the forms magma declares: `^x.y.z`, `~x.y.z`, `>=x.y.z`, `x.y.z`. */
export const satisfies = (version: string, range: string): boolean => {
  const parse = (text: string) =>
    text
      .replace(/^[^\d]*/, '')
      .split(/[.-]/)
      .slice(0, 3)
      .map(Number);
  const [major = 0, minor = 0, patch = 0] = parse(version);
  const [rMajor = 0, rMinor = 0, rPatch = 0] = parse(range);
  const atLeast =
    major > rMajor ||
    (major === rMajor && (minor > rMinor || (minor === rMinor && patch >= rPatch)));
  if (range.startsWith('^')) return atLeast && major === rMajor && (rMajor > 0 || minor === rMinor);
  if (range.startsWith('~')) return atLeast && major === rMajor && minor === rMinor;
  if (range.startsWith('>=')) return atLeast;
  return major === rMajor && minor === rMinor && patch === rPatch;
};

interface Check {
  id: string;
  ok: boolean;
  detail: string;
  guide: string;
}

/** The files of the project that may name a configuration or a setting: its sources, a few thousand at most. */
const sourceFiles = (root: string, limit = 3000): string[] => {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (found.length >= limit) return;
      if (/^(node_modules|dist|build|www|coverage|\.git|\.next|\.angular)$/.test(name)) continue;
      const full = path.join(dir, name);
      const stat = statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (/\.(m?[jt]sx?|html|vue|svelte|astro)$/.test(name)) found.push(full);
    }
  };
  for (const dir of ['src', 'app', 'pages', 'components'])
    if (existsSync(path.join(root, dir))) walk(path.join(root, dir));
  return found;
};

const firstExisting = (root: string, names: string[]) =>
  names.map((name) => path.join(root, name)).find((file) => existsSync(file));

/** The Magma plugin is enabled in these Claude Code settings (`enabledPlugins`, `magma@magma`). */
export const pluginEnabled = (file: string): boolean =>
  readJsonFile<{ enabledPlugins?: Record<string, boolean> }>(file)?.enabledPlugins?.[
    'magma@magma'
  ] === true;

/**
 * The entries of a client configuration that start magma-mcp (`mcpServers` of Claude Code
 * and Cursor, `servers` of VS Code), each safe unless it runs npx without `--no`.
 */
export const mcpEntries = (file: string): Array<{ safe: boolean }> => {
  const config = readJsonFile<{
    mcpServers?: Record<string, { command?: string; args?: string[] }>;
    servers?: Record<string, { command?: string; args?: string[] }>;
  }>(file);
  if (!config) return [];
  return Object.values({ ...config.mcpServers, ...config.servers })
    .filter((entry) =>
      [entry.command, ...(entry.args ?? [])].some((part) => part?.includes('magma-mcp')),
    )
    .map((entry) => ({
      safe: !/(^|\/)npx$/.test(entry.command ?? '') || (entry.args ?? []).includes('--no'),
    }));
};

export const checkSetup = (context: ToolContext): Tool => ({
  name: 'check_setup',
  title: 'Check the Magma integration of the project',
  description:
    "Look at the project and list what its Magma integration misses, each with the guide that fixes it: design-tokens and styles installed in the range magma depends on, the React or Angular wrapper at magma's version, the fonts of the typography, an icon set, the icon path, the lint in ESLint and Stylelint, this server in the client configuration. Read-only.",
  inputSchema: { type: 'object', properties: {} },
  outputSchema: {
    type: 'object',
    properties: {
      root: { type: 'string' },
      magma: { type: 'string' },
      ok: { type: 'boolean' },
      checks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            ok: { type: 'boolean' },
            detail: { type: 'string' },
            guide: { type: 'string' },
          },
          required: ['id', 'ok', 'detail', 'guide'],
        },
      },
    },
    required: ['root', 'magma', 'ok', 'checks'],
  },
  run: () => {
    const { root } = context;
    const project = readJsonFile<{
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    }>(path.join(root, 'package.json'));
    if (!project)
      throw new ToolError(
        `No package.json in ${root}: start the server in the project, or pass --root.`,
      );
    const declared = { ...project.devDependencies, ...project.dependencies };
    const magmaManifest = readJsonFile<{ version: string; dependencies?: Record<string, string> }>(
      path.join(magmaRoot(context.settings), 'package.json'),
    );
    const version = magmaManifest?.version ?? 'unknown';
    const installed = (name: string) => {
      const dir = packageDir(context, name);
      return dir
        ? readJsonFile<{ version: string }>(path.join(dir, 'package.json'))?.version
        : undefined;
    };
    const checks: Check[] = [];

    // the packages magma is built against, in the range it declares
    for (const name of [
      '@maggioli-design-system/design-tokens',
      '@maggioli-design-system/styles',
    ]) {
      const range = magmaManifest?.dependencies?.[name];
      const have = installed(name);
      checks.push({
        id: name.split('/')[1]!,
        ok: Boolean(declared[name] && have && (!range || satisfies(have, range))),
        detail: !declared[name]
          ? `${name} is not a dependency of the project: install it (its stylesheets are imported by the app).`
          : !have
            ? `${name} is declared but not installed.`
            : range && !satisfies(have, range)
              ? `${name} ${have} is outside ${range}, the range magma ${version} is built against.`
              : `${name} ${have}${range ? `, in ${range}` : ''}.`,
        guide: 'agents/install.md (version matrix), agents/assets.md (styles)',
      });
    }

    // a wrapper releases in lockstep with magma
    for (const name of [
      '@maggioli-design-system/magma-react',
      '@maggioli-design-system/magma-angular',
    ])
      if (declared[name]) {
        const have = installed(name);
        checks.push({
          id: name.split('/')[1]!,
          ok: have === version,
          detail:
            have === version
              ? `${name} ${have}, the version of magma.`
              : `${name} ${have ?? 'not installed'}, magma ${version}: install the same version of both.`,
          guide: 'agents/install.md',
        });
      }

    // the fonts of the typography, from the font families of the tokens
    const families = tokensOf(context)
      .filter((entry) => entry.type === 'fontFamily' && entry.value)
      .map((entry) =>
        entry
          .value!.split(',')[0]!
          .trim()
          .replace(/^['"]|['"]$/g, ''),
      );
    const fonts = [...new Set(families)].map(
      (family) => `@fontsource/${family.toLowerCase().replace(/\s+/g, '-')}`,
    );
    const missingFonts = fonts.filter((font) => !declared[font]);
    checks.push({
      id: 'fonts',
      ok: !missingFonts.length,
      detail: missingFonts.length
        ? `Not installed: ${missingFonts.join(', ')}.`
        : `${fonts.join(', ')}.`,
      guide: 'agents/assets.md (Fonts)',
    });

    // an icon set, and the path mds-icon fetches it from
    const sets = ['@material-icons/svg', '@mdi/svg', '@maggioli-design-system/svg-icons'].filter(
      (name) => declared[name],
    );
    const iconsauce = firstExisting(root, [
      'iconsauce.json',
      'iconsauce.config.js',
      'iconsauce.config.mjs',
      'iconsauce.config.cjs',
    ]);
    checks.push({
      id: 'icons',
      ok: Boolean(sets.length || iconsauce),
      detail:
        sets.length || iconsauce
          ? `Icons from ${[...sets, ...(iconsauce ? [path.basename(iconsauce)] : [])].join(', ')}.`
          : 'No icon set and no iconsauce configuration: mds-icon renders nothing.',
      guide: 'agents/assets.md (Icons)',
    });
    const sources = sourceFiles(root);
    const pathSet = sources.some((file) => readFileSync(file, 'utf8').includes('mdsIconSvgPath'));
    checks.push({
      id: 'icon-path',
      ok: pathSet,
      detail: pathSet
        ? 'mdsIconSvgPath is set in the sources.'
        : 'mdsIconSvgPath is not set in src/ or app/: mds-icon does not know where the icons are.',
      guide: 'agents/assets.md (Tell mds-icon where the icons are)',
    });

    // the lint, and this server
    const mentions = (names: string[], text: string) => {
      const file = firstExisting(root, names);
      return Boolean(file && readFileSync(file, 'utf8').includes(text));
    };
    const eslintOk = mentions(
      ['eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs', 'eslint.config.ts'],
      '@maggioli-design-system/magma/eslint',
    );
    checks.push({
      id: 'lint-eslint',
      ok: eslintOk,
      detail: eslintOk
        ? 'The ESLint configuration loads the Magma preset.'
        : 'The ESLint configuration does not load @maggioli-design-system/magma/eslint.',
      guide: 'agents/lint.md',
    });
    const stylelintOk = mentions(
      [
        'stylelint.config.mjs',
        'stylelint.config.js',
        'stylelint.config.cjs',
        '.stylelintrc.json',
        '.stylelintrc',
      ],
      '@maggioli-design-system/magma/stylelint',
    );
    checks.push({
      id: 'lint-stylelint',
      ok: stylelintOk,
      detail: stylelintOk
        ? 'The Stylelint configuration extends the Magma preset.'
        : 'The Stylelint configuration does not extend @maggioli-design-system/magma/stylelint.',
      guide: 'agents/lint.md',
    });
    const entries = ['.mcp.json', '.vscode/mcp.json', '.cursor/mcp.json'].flatMap((name) =>
      mcpEntries(path.join(root, name)).map((entry) => ({ name, ...entry })),
    );
    // npx without --no installs and runs whatever the registry has under the name (#1112)
    const unsafe = entries.filter((entry) => !entry.safe);
    // in Claude Code the Magma plugin starts the server: with an .mcp.json entry too it runs twice
    const plugin = pluginEnabled(path.join(root, '.claude/settings.json'));
    const twice = plugin && entries.some((entry) => entry.name === '.mcp.json');
    checks.push({
      id: 'mcp',
      ok: (plugin || entries.length > 0) && !unsafe.length && !twice,
      detail: unsafe.length
        ? `${unsafe.map((entry) => entry.name).join(', ')} starts magma-mcp with npx without --no: when magma is not installed, npx downloads and runs a package of that name from the registry. Write "args": ["--no", "magma-mcp"].`
        : twice
          ? 'Both the Magma plugin (.claude/settings.json) and .mcp.json start magma-mcp: Claude Code runs the server twice. Keep the plugin and drop the .mcp.json entry.'
          : plugin || entries.length
            ? [
                ...(plugin ? ['the Magma plugin of .claude/settings.json'] : []),
                ...entries.map((entry) => entry.name),
              ].join(', ') + ' starts magma-mcp.'
            : 'No client configuration starts magma-mcp: the Magma plugin in .claude/settings.json for Claude Code, .vscode/mcp.json or .cursor/mcp.json for the others.',
      guide: 'agents/mcp.md',
    });

    return { root, magma: version, ok: checks.every((check) => check.ok), checks };
  },
});
