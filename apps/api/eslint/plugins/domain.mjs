import factoryResultReturnRule from '../rules/domain/factory-result-return.mjs';
import noDirectNewRule from '../rules/domain/no-direct-new.mjs';

const domainPlugin = {
  meta: {
    name: 'eslint-plugin-domain',
  },
  rules: {
    'factory-result-return': factoryResultReturnRule,
    'no-direct-new': noDirectNewRule,
  },
};

export default domainPlugin;
