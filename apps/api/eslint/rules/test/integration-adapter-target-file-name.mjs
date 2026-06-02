function normalizePath(filename) {
  return filename.replaceAll('\\', '/');
}

function isIntegrationSpec(filename) {
  return normalizePath(filename).endsWith('.integration-spec.ts');
}

function getBasename(filename) {
  return normalizePath(filename).split('/').at(-1) ?? '';
}

function getOptions(context) {
  return context.options[0] ?? {};
}

function getConfiguredSystemTargets(context) {
  return new Set(getOptions(context).systemTargets ?? []);
}

function identifiesConfiguredSystemTarget(filename, systemTargets) {
  const basename = getBasename(filename);
  const target = basename.replace(/[.]integration-spec[.]ts$/u, '');

  return systemTargets.has(target);
}

function identifiesAdapterTarget(filename) {
  const basename = getBasename(filename);

  return (
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
        'Integration spec file names must identify an adapter target or a configured system target, such as "*-http.controller.integration-spec.ts" or "*.repository.{technology}.integration-spec.ts".',
    },
    schema: [
      {
        type: 'object',
        properties: {
          systemTargets: {
            type: 'array',
            items: {
              type: 'string',
              pattern: '^[a-z0-9-]+$',
            },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const systemTargets = getConfiguredSystemTargets(context);

    if (
      !isIntegrationSpec(filename) ||
      identifiesAdapterTarget(filename) ||
      identifiesConfiguredSystemTarget(filename, systemTargets)
    ) {
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
