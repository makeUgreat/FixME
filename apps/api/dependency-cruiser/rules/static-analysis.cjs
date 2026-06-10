const docs = require('../docs.cjs');
const { sourceTestFiles } = require('../patterns.cjs');

module.exports = [
  {
    name: 'api-not-to-tests-from-production',
    severity: 'error',
    comment:
      'Production source must not depend on test-only code. Move reusable helpers into production source or test support with an explicit test-only boundary. ' +
      `See ${docs.staticAnalysis}#test-scope.`,
    from: {
      path: '^src/',
      pathNot: sourceTestFiles,
    },
    to: {
      path: ['^test/', sourceTestFiles],
    },
  },
];
