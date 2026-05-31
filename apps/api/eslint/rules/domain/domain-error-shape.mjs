const DOMAIN_ERROR_KINDS = new Set([
  'invariant_violation',
  'state_conflict',
  'operation_not_allowed',
]);

const DOMAIN_ERROR_CODE_PATTERN = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/u;

function isDomainFile(filename) {
  return /[/\\]src[/\\]modules[/\\][^/\\]+[/\\]domain[/\\]/u.test(filename);
}

function isErrCallee(callee) {
  if (callee.type === 'Identifier') {
    return callee.name === 'err';
  }

  return (
    callee.type === 'MemberExpression' &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'err'
  );
}

function getObjectProperty(node, name) {
  return node.properties.find(
    (property) =>
      property.type === 'Property' &&
      property.key.type === 'Identifier' &&
      property.key.name === name,
  );
}

function getStringLiteralValue(node) {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }

  return undefined;
}

const domainErrorShapeRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require domain errors returned through err({...}) to expose a stable shape.',
    },
    messages: {
      missingProperty:
        'Domain error objects returned through err must include {{ name }}.',
      invalidKind:
        'Domain error kind must be invariant_violation, state_conflict, or operation_not_allowed.',
      invalidCode:
        'Domain error code must follow {domain}.{reason}, for example correction.original_text_empty.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();

    if (!isDomainFile(filename)) {
      return {};
    }

    return {
      CallExpression(node) {
        if (!isErrCallee(node.callee)) {
          return;
        }

        const [errorArgument] = node.arguments;

        if (errorArgument?.type !== 'ObjectExpression') {
          return;
        }

        for (const name of ['kind', 'code', 'message']) {
          if (!getObjectProperty(errorArgument, name)) {
            context.report({
              node: errorArgument,
              messageId: 'missingProperty',
              data: { name },
            });
          }
        }

        const kindProperty = getObjectProperty(errorArgument, 'kind');
        const kindValue =
          kindProperty?.type === 'Property'
            ? getStringLiteralValue(kindProperty.value)
            : undefined;

        if (kindValue !== undefined && !DOMAIN_ERROR_KINDS.has(kindValue)) {
          context.report({
            node: kindProperty,
            messageId: 'invalidKind',
          });
        }

        const codeProperty = getObjectProperty(errorArgument, 'code');
        const codeValue =
          codeProperty?.type === 'Property'
            ? getStringLiteralValue(codeProperty.value)
            : undefined;

        if (
          codeValue !== undefined &&
          !DOMAIN_ERROR_CODE_PATTERN.test(codeValue)
        ) {
          context.report({
            node: codeProperty,
            messageId: 'invalidCode',
          });
        }
      },
    };
  },
};

export default domainErrorShapeRule;
