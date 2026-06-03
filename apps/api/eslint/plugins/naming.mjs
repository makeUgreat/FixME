import repositoryMethodPrefixRule from '../rules/naming/repository-method-prefix.mjs';
import typeNameMatchesFileNameRule from '../rules/naming/type-name-matches-file-name.mjs';

const namingPlugin = {
  meta: {
    name: 'eslint-plugin-naming',
  },
  rules: {
    'repository-method-prefix': repositoryMethodPrefixRule,
    'type-name-matches-file-name': typeNameMatchesFileNameRule,
  },
};

export default namingPlugin;
