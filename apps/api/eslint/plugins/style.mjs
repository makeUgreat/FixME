import preferInlineSatisfiesRule from '../rules/style/prefer-inline-satisfies.mjs';

const stylePlugin = {
  meta: {
    name: 'eslint-plugin-style',
  },
  rules: {
    'prefer-inline-satisfies': preferInlineSatisfiesRule,
  },
};

export default stylePlugin;
