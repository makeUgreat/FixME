const RESTRICTED_BOOTSTRAP_IMPORTS = new Set([
  '@nestjs/platform-fastify',
  '@nestjs/testing',
]);

function isIntegrationSpec(filename) {
  return filename.replaceAll('\\', '/').endsWith('.integration-spec.ts');
}

const noDirectIntegrationBootstrapRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require integration specs to use the shared integration app helper.',
    },
    messages: {
      useIntegrationHelper:
        'Use createTestNestApp() instead of bootstrapping Nest/Fastify directly in integration specs.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();

    if (!isIntegrationSpec(filename)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        if (node.importKind === 'type') {
          return;
        }

        if (!RESTRICTED_BOOTSTRAP_IMPORTS.has(node.source.value)) {
          return;
        }

        context.report({
          node,
          messageId: 'useIntegrationHelper',
        });
      },
    };
  },
};

export default noDirectIntegrationBootstrapRule;
