module.exports = {
  extends: '@loopback/eslint-config',
  overrides: [{
    files: ['*.ts'],
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  }]
};
