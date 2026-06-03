/** @type {import('dependency-cruiser').IConfiguration} */
const { join } = require('node:path');

module.exports = {
  extends: '../../.dependency-cruiser.cjs',
  forbidden: [],
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
