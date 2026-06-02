const EXPECTED_INTERFACE_BY_MAPPER = [
  {
    pathPattern: /\/infrastructure\/.*[.]mapper[.]ts$/,
    namePattern: /Mapper$/,
    interfaceName: 'PersistenceMapper',
  },
  {
    pathPattern: /\/application\/.*error[.]mapper[.]ts$/,
    namePattern: /Mapper$/,
    interfaceName: 'DomainErrorToApplicationErrorMapper',
    relationship: 'extend',
  },
  {
    pathPattern: /\/presentation\/.*-http-error[.]mapper[.]ts$/,
    namePattern: /Mapper$/,
    interfaceName: 'PresentationHttpErrorMapper',
    relationship: 'extend',
  },
  {
    pathPattern: /\/presentation\/.*[.]mapper[.]ts$/,
    namePattern: /Mapper$/,
    interfaceName: 'PresentationMapper',
  },
];

const EXTENDABLE_MAPPER_BY_INTERFACE = new Map();

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
  );
}

function getExpectedRelationship(expectedInterface) {
  return expectedInterface.relationship ?? 'implement';
}

function implementsInterface(node, interfaceName) {
  return (node.implements ?? []).some(
    (implemented) =>
      getImplementedInterfaceName(implemented.expression) === interfaceName,
  );
}

function getExtendedClassName(superClass) {
  if (!superClass) {
    return undefined;
  }

  if (superClass.type === 'Identifier') {
    return superClass.name;
  }

  if (
    superClass.type === 'TSInstantiationExpression' &&
    superClass.expression.type === 'Identifier'
  ) {
    return superClass.expression.name;
  }

  return undefined;
}

function extendsClass(node, className) {
  if (!className) {
    return false;
  }

  return getExtendedClassName(node.superClass) === className;
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
        'Mapper class {{ className }} must {{ relationship }} {{ interfaceName }}.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const expectedInterface = getExpectedInterface(filename);

    if (!expectedInterface) {
      return {};
    }

    const expectedRelationship = getExpectedRelationship(expectedInterface);
    const interfaceName = expectedInterface.interfaceName;

    return {
      ClassDeclaration(node) {
        const className = getClassName(node);

        if (!className?.endsWith('Mapper')) {
          return;
        }

        const extendsAllowedBase =
          EXTENDABLE_MAPPER_BY_INTERFACE.get(interfaceName);
        const satisfiesContract =
          expectedRelationship === 'extend'
            ? extendsClass(node, interfaceName)
            : implementsInterface(node, interfaceName) ||
              extendsClass(node, extendsAllowedBase);

        if (satisfiesContract) {
          return;
        }

        context.report({
          node: node.id ?? node,
          messageId: 'expectedInterface',
          data: {
            className,
            interfaceName,
            relationship: expectedRelationship,
          },
        });
      },
    };
  },
};

export default implementsLayerMapperRule;
