const docs = require('../docs.cjs');
const { frameworkDependency, sourceTestFiles } = require('../patterns.cjs');

module.exports = [
  {
    name: 'api-not-to-bootstrap-from-production',
    severity: 'error',
    comment:
      'Bootstrap is runtime wiring. Only src/main.ts and bootstrap code may import it; move shared contracts inward instead of importing concrete bootstrap types. ' +
      `See ${docs.runtimeWiring}#bootstrap.`,
    from: {
      path: '^src/',
      pathNot: `^src/(main[.]ts|bootstrap/)|${sourceTestFiles}`,
    },
    to: {
      path: '^src/bootstrap/',
    },
  },
  {
    name: 'api-inner-layers-not-to-frameworks',
    severity: 'error',
    comment:
      'Core, domain, layer kernels, and application core must stay framework-independent. Keep framework decorators and SDK imports in bootstrap, feature root modules, presentation, or infrastructure adapters. ' +
      `See ${docs.runtimeWiring}#nestjs-di.`,
    from: {
      path: [
        '^src/core/',
        '^src/layer-kernels/',
        '^src/contexts/[^/]+/domain/',
        '^src/contexts/[^/]+/application/',
      ],
    },
    to: {
      path: frameworkDependency,
    },
  },
];
