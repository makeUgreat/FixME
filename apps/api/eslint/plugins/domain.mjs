import factoryResultReturnRule from '../rules/domain/factory-result-return.mjs';
import noDirectNewRule from '../rules/domain/no-direct-new.mjs';
import requireUnitSpecRule from '../rules/domain/require-unit-spec.mjs';
import splitMultipleValidationErrorsRule from '../rules/domain/split-multiple-validation-errors.mjs';

const domainPlugin = {
  meta: {
    name: 'eslint-plugin-domain',
  },
  rules: {
    'factory-result-return': factoryResultReturnRule,
    'no-direct-new': noDirectNewRule,
    'require-unit-spec': requireUnitSpecRule,
    'split-multiple-validation-errors': splitMultipleValidationErrorsRule,
  },
};

export default domainPlugin;
