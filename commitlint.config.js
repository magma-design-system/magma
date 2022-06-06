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
      ],
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

          if ((type === 'revert' || type === 'style') && scope !== null)
          {
            return [false, 'Your scope should be empty when type is style or revert']
          }
          if (type !== 'style' && type !== 'revert' && !scope) {
            return [false, 'Your scope should not be empty unless the type is style or revert']
          }

          return r
        },
      },
    },
  ],
}
