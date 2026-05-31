import implementsLayerMapperRule from '../rules/mapper/implements-layer-mapper.mjs';
import noDomainModelSerializationRule from '../rules/mapper/no-domain-model-serialization.mjs';
import noErrorContractInMapperRule from '../rules/mapper/no-error-contract-in-mapper.mjs';
import noNestInApplicationErrorRule from '../rules/mapper/no-nest-in-application-error.mjs';
import noNestInApplicationMapperRule from '../rules/mapper/no-nest-in-application-mapper.mjs';

const mapperPlugin = {
  meta: {
    name: 'eslint-plugin-mapper',
  },
  rules: {
    'implements-layer-mapper': implementsLayerMapperRule,
    'no-domain-model-serialization': noDomainModelSerializationRule,
    'no-error-contract-in-mapper': noErrorContractInMapperRule,
    'no-nest-in-application-error': noNestInApplicationErrorRule,
    'no-nest-in-application-mapper': noNestInApplicationMapperRule,
  },
};

export default mapperPlugin;
