function normalizePath(filename) {
  return filename.replaceAll('\\', '/');
}

function isIntegrationSpec(filename) {
  return normalizePath(filename).endsWith('.integration-spec.ts');
}

function isUnderTestDomainDirectory(filename) {
  const normalizedFilename = normalizePath(filename);

  return /(^|\/)test\/[^/]+\/.+[.]integration-spec[.]ts$/.test(
    normalizedFilename,
  );
}

const integrationFileLocationRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require integration specs to live under a test domain directory.',
    },
    messages: {
      expectedTestDirectory:
        'Integration specs must be placed under test/{domain}/.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();

    if (!isIntegrationSpec(filename) || isUnderTestDomainDirectory(filename)) {
      return {};
    }

    return {
      Program(node) {
        context.report({
          node,
          messageId: 'expectedTestDirectory',
        });
      },
    };
  },
};

export default integrationFileLocationRule;
