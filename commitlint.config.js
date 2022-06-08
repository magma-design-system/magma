const { readdirSync } = require('fs')
const path = require('path')

const getDirs = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

const webComponents = getDirs(path.resolve(__dirname, 'projects/stencil/src/components'))

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build',
        'change',
        'chore',
        'ci',
        'doc',
        'feat',
        'fix',
        'merge',
        'perf',
        'refact',
        'revert',
        'style',
        'test',
      ],
    ],
    'custom-scope-enum': [2,
      'always',
      [
        'design-tokens',
        'docs',
        'icons',
        'identity',
        'magma',
        'react',
        'stencil',
        'styles',
        'svg-icons',
      ].concat(webComponents),
    ],
  },
  plugins: [
    {
      rules: {
        'custom-scope-enum': (parsed, when, value) => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const defaultScopeEnum = require('@commitlint/rules/lib/scope-enum')

          const r = defaultScopeEnum.scopeEnum(parsed, when, value)

          const { scope } = parsed
          const { type } = parsed

          if (type === 'revert' && scope !== null) {
            return [false, 'Your scope should be empty when type is revert']
          }

          if (type === 'style' && scope === 'styles') {
            return [false, 'Scope styles shouldn\'t use style type for CSS styles, it\'s better to use fix or change']
          }

          if (type === 'style' && (scope !== 'design-tokens' || scope !== 'docs' || scope !== 'react' || scope !== 'stencil')) {
            return [false, `Type style should be used in projects designed to support CSS, are you sure there is CSS inside scope ${scope}? Permitted scopes are design-tokens, docs, react, and stencil.`]
          }

          return r
        },
      },
    },
  ],
}
