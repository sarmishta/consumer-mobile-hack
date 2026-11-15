// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // The resolver follows react-native-svg's "react-native" source entry and fails; Metro and tsc resolve it fine.
      'import/no-unresolved': ['error', { ignore: ['^react-native-svg$'] }],
    },
  },
]);
