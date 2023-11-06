module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:lit/recommended',
    'plugin:wc/recommended',
  ],
  settings: {
    wc: {
      elementBaseClasses: ['LitElement'], // Recognize `LitElement` as a Custom Element base class
    },
  },
  ignorePatterns: [
    './**/*.stories.ts',
    './**/dist',
    './src/componnts.d.ts',
    './template',
  ],
  overrides: [
    {
      files: [
        './**/*.tsx',
        './**/*.ts',
        './*.config.ts',
      ],
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      rules: {
        'lit/no-invalid-html': 'warn',
      },
    },
  ],
}
