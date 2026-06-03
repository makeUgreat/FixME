/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [],
  options: {
    combinedDependencies: true,
    doNotFollow: {
      path: 'node_modules',
    },
    moduleSystems: ['cjs', 'es6'],
    parser: 'swc',
    tsPreCompilationDeps: 'specify',
  },
};
