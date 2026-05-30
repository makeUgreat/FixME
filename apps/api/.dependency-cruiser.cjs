/** @type {import('dependency-cruiser').IConfiguration} */
const { join } = require('node:path');

module.exports = {
  extends: '../../.dependency-cruiser.cjs',
  forbidden: [
    {
      name: 'api-domain-is-independent',
      severity: 'error',
      comment: 'Domain code must not depend on application, infrastructure, presentation, or mapper layers.',
      from: {
        path: '^src/modules/[^/]+/domain/',
      },
      to: {
        path: '^src/modules/[^/]+/(?:application|infrastructure|presentation|mappers)/',
      },
    },
    {
      name: 'api-application-does-not-depend-on-adapters',
      severity: 'error',
      comment: 'Application code should not depend on infrastructure or presentation adapters.',
      from: {
        path: '^src/modules/[^/]+/application/',
      },
      to: {
        path: '^src/modules/[^/]+/(?:infrastructure|presentation)/',
      },
    },
    {
      name: 'api-infrastructure-does-not-depend-on-presentation',
      severity: 'error',
      comment: 'Infrastructure code should not depend on presentation code.',
      from: {
        path: '^src/modules/[^/]+/infrastructure/',
      },
      to: {
        path: '^src/modules/[^/]+/presentation/',
      },
    },
    {
      name: 'api-libs-do-not-depend-on-app',
      severity: 'error',
      comment: 'Shared libs must stay independent from API app modules and bootstrap code.',
      from: {
        path: '^src/libs/',
      },
      to: {
        path: '^src/(?:app[.]module|main|modules/)',
      },
    },
    {
      name: 'api-no-internal-barrel-imports',
      severity: 'error',
      comment: 'Do not import a same-directory index.ts from implementation files; use concrete files internally.',
      from: {
        path: '^src/(libs/[^/]+|modules/[^/]+|modules/[^/]+/[^/]+|modules/[^/]+/[^/]+/[^/]+)/[^/]+[.]ts$',
        pathNot: '(^|/)index[.]ts$',
      },
      to: {
        path: '^src/$1/index[.]ts$',
      },
    },
    {
      name: 'api-no-base-url-imports',
      severity: 'error',
      comment: 'Do not import from bare src/... paths; use @api/*, @modules/*, or @libs/* aliases instead.',
      from: {
        path: '^src/',
      },
      to: {
        dependencyTypes: ['aliased-tsconfig-base-url'],
      },
    },
    {
      name: 'api-modules-use-alias-for-libs',
      severity: 'error',
      comment: 'Module code should use the @libs/* alias when importing shared API libs.',
      from: {
        path: '^src/modules/',
      },
      to: {
        path: '^src/libs/',
        dependencyTypesNot: ['aliased-tsconfig-paths', 'aliased-tsconfig'],
      },
    },
  ],
  options: {
    exclude: {
      path: [
        '^dist/',
        '^node_modules/',
        '^coverage/',
      ],
    },
    includeOnly: ['^src/', '^test/'],
    tsConfig: {
      fileName: join(__dirname, 'tsconfig.json'),
    },
  },
};
