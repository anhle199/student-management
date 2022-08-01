module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
    '@loopback/eslint-config',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.d.ts', '*.js'],
      rules: {
        '@typescript-eslint/no-shadow': 'warn',
        'no-shadow': 'off',
        'no-undef': 'off',
        semi: 'off',
        eqeqeq: 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-unused-vars': 'warn',
        'no-debugger': 'off',
      },
    },
  ],
}
