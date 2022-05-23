module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build',
        'change',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
    'custom-scope-enum': [2,
      'always',
      [
        'angular',
        'docs',
        'font-icons-cli',
        'mgg-icons',
        'react',
        'styles',
        'tokens',
        'web-component',
        'magma',
      ],
    ],
  },
  plugins: [
    {
      rules: {
        'custom-scope-enum': (parsed, when, value ) => {
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
