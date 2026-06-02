function normalizePath(filename) {
  return filename.replaceAll('\\', '/');
}

function isIntegrationSpec(filename) {
  return normalizePath(filename).endsWith('.integration-spec.ts');
}

function getBasename(filename) {
  return normalizePath(filename).split('/').at(-1) ?? '';
}

function identifiesAdapterTarget(filename) {
  const basename = getBasename(filename);

  return (
    basename === 'app.integration-spec.ts' ||
    basename === 'eslint-config.integration-spec.ts' ||
    /^[a-z0-9-]+[.]controller[.]integration-spec[.]ts$/.test(
      basename,
    ) ||
    /^[a-z0-9-]+[.]repository[.][a-z0-9-]+[.]integration-spec[.]ts$/.test(
      basename,
    )
  );
}

const integrationAdapterTargetFileNameRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require integration spec file names to identify the adapter target.',
    },
    messages: {
      expectedAdapterTarget:
        'Integration spec file names must identify the adapter target, such as "*-http.controller.integration-spec.ts" or "*.repository.{technology}.integration-spec.ts".',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();

    if (!isIntegrationSpec(filename) || identifiesAdapterTarget(filename)) {
      return {};
    }

    return {
      Program(node) {
        context.report({
          node,
          messageId: 'expectedAdapterTarget',
        });
      },
    };
  },
};

export default integrationAdapterTargetFileNameRule;
