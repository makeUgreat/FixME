const EXPECTED_INTERFACE_BY_MAPPER = [
  {
    pathPattern: /\/infrastructure\/.*[.]mapper[.]ts$/,
    namePattern: /Mapper$/,
    interfaceName: 'PersistenceMapper',
  },
  {
    pathPattern: /\/application\/.*error[.]mapper[.]ts$/,
    namePattern: /Mapper$/,
    interfaceName: 'ApplicationErrorMapper',
  },
  {
    pathPattern: /\/presentation\/.*error[.]mapper[.]ts$/,
    namePattern: /Mapper$/,
    interfaceName: 'PresentationErrorMapper',
  },
  {
    pathPattern: /\/presentation\/.*[.]mapper[.]ts$/,
    namePattern: /Mapper$/,
    interfaceName: 'PresentationMapper',
  },
];

function normalizePath(filename) {
  return filename.replaceAll('\\', '/');
}

function getClassName(node) {
  return node.id?.name;
}

function getImplementedInterfaceName(expression) {
  if (expression.type === 'Identifier') {
    return expression.name;
  }

  if (
    expression.type === 'TSInstantiationExpression' &&
    expression.expression.type === 'Identifier'
  ) {
    return expression.expression.name;
  }

  return undefined;
}

function getExpectedInterface(filename) {
  const normalizedFilename = normalizePath(filename);

  return EXPECTED_INTERFACE_BY_MAPPER.find(({ pathPattern }) =>
    pathPattern.test(normalizedFilename),
  )?.interfaceName;
}

function implementsInterface(node, interfaceName) {
  return (node.implements ?? []).some(
    (implemented) =>
      getImplementedInterfaceName(implemented.expression) === interfaceName,
  );
}

const implementsLayerMapperRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require mapper classes to implement the layer-specific mapper interface.',
    },
    messages: {
      expectedInterface:
        'Mapper class {{ className }} must implement {{ interfaceName }}.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const expectedInterface = getExpectedInterface(filename);

    if (!expectedInterface) {
      return {};
    }

    return {
      ClassDeclaration(node) {
        const className = getClassName(node);

        if (!className?.endsWith('Mapper')) {
          return;
        }

        if (implementsInterface(node, expectedInterface)) {
          return;
        }

        context.report({
          node: node.id ?? node,
          messageId: 'expectedInterface',
          data: { className, interfaceName: expectedInterface },
        });
      },
    };
  },
};

export default implementsLayerMapperRule;
