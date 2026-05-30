import integrationDescribeNameRule from '../rules/test/integration-describe-name.mjs';
import integrationFileLocationRule from '../rules/test/integration-file-location.mjs';
import koreanTestCaseNameRule from '../rules/test/korean-test-case-name.mjs';
import noDirectIntegrationBootstrapRule from '../rules/test/no-direct-integration-bootstrap.mjs';
import noMisleadingIntegrationFileNameRule from '../rules/test/no-misleading-integration-file-name.mjs';

const testPlugin = {
  meta: {
    name: 'eslint-plugin-test',
  },
  rules: {
    'integration-describe-name': integrationDescribeNameRule,
    'integration-file-location': integrationFileLocationRule,
    'korean-test-case-name': koreanTestCaseNameRule,
    'no-direct-integration-bootstrap': noDirectIntegrationBootstrapRule,
    'no-misleading-integration-file-name': noMisleadingIntegrationFileNameRule,
  },
};

export default testPlugin;
