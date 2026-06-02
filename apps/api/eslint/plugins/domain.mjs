import domainErrorShapeRule from '../rules/domain/domain-error-shape.mjs';
import factoryResultReturnRule from '../rules/domain/factory-result-return.mjs';
import noDirectNewRule from '../rules/domain/no-direct-new.mjs';
import noGlobalDomainErrorCodesRule from '../rules/domain/no-global-domain-error-codes.mjs';
import preferDomainErrorOfRule from '../rules/domain/prefer-domain-error-of.mjs';
import requireUnitSpecRule from '../rules/domain/require-unit-spec.mjs';
import splitMultipleValidationErrorsRule from '../rules/domain/split-multiple-validation-errors.mjs';

const domainPlugin = {
  meta: {
    name: 'eslint-plugin-domain',
  },
  rules: {
    'domain-error-shape': domainErrorShapeRule,
    'factory-result-return': factoryResultReturnRule,
    'no-direct-new': noDirectNewRule,
    'no-global-domain-error-codes': noGlobalDomainErrorCodesRule,
    'prefer-domain-error-of': preferDomainErrorOfRule,
    'require-unit-spec': requireUnitSpecRule,
    'split-multiple-validation-errors': splitMultipleValidationErrorsRule,
  },
};

export default domainPlugin;
