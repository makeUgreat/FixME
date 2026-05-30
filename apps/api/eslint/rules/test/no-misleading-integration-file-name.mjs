function normalizePath(filename) {
  return filename.replaceAll('\\', '/');
}

function isTestFile(filename) {
  const normalizedFilename = normalizePath(filename);

  return (
    normalizedFilename.endsWith('.spec.ts') ||
    normalizedFilename.endsWith('.integration-spec.ts')
  );
}

function isIntegrationSpec(filename) {
  return normalizePath(filename).endsWith('.integration-spec.ts');
}

function hasIntegrationNameSegment(filename) {
  const basename = normalizePath(filename).split('/').at(-1) ?? '';

  return /(^|[.-])integration([.-]|$)/.test(basename);
}

const noMisleadingIntegrationFileNameRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require files named as integration tests to use the integration spec suffix.',
    },
    messages: {
      expectedIntegrationSpecSuffix:
        'Test files with an integration name segment must use the "*.integration-spec.ts" suffix.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();

    if (
      !isTestFile(filename) ||
      !hasIntegrationNameSegment(filename) ||
      isIntegrationSpec(filename)
    ) {
      return {};
    }

    return {
      Program(node) {
        context.report({
          node,
          messageId: 'expectedIntegrationSpecSuffix',
        });
      },
    };
  },
};

export default noMisleadingIntegrationFileNameRule;
