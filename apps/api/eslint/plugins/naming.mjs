import typeNameMatchesFileNameRule from '../rules/naming/type-name-matches-file-name.mjs';

const namingPlugin = {
  meta: {
    name: 'eslint-plugin-naming',
  },
  rules: {
    'type-name-matches-file-name': typeNameMatchesFileNameRule,
  },
};

export default namingPlugin;
