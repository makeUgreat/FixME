const docs = require('../docs.cjs');
const { sourceTestFiles } = require('../patterns.cjs');

module.exports = [
  {
    name: 'api-src-stays-inside-src',
    severity: 'error',
    comment:
      'Production source must not import files outside src because the API build only emits src. Move reusable production code under src or keep it test/script-only. ' +
      `See ${docs.staticAnalysis}#file-scope.`,
    from: {
      path: '^src/',
      pathNot: sourceTestFiles,
    },
    to: {
      path: '^(?!src/|node_modules/|../../node_modules/)',
    },
  },
];
