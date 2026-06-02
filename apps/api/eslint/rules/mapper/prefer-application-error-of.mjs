const APPLICATION_ERROR_FILE_PATTERN = /[/\\]application[/\\].*[.]error[.]ts$/u;

const APPLICATION_ERROR_KINDS = new Set([
  'validation_failed',
  'dependency_unavailable',
  'not_found',
  'state_conflict',
  'permission_denied',
  'authentication_required',
  'operation_not_allowed',
  'rate_limited',
  'unexpected',
]);

function normalizePath(filename) {
  return filename.replaceAll('\\', '/');
}

function getTypeArguments(node) {
  return node.typeArguments?.params ?? node.typeParameters?.params ?? [];
}

function getLiteralTypeValue(node) {
  if (node?.type !== 'TSLiteralType') {
    return undefined;
  }

  return node.literal?.type === 'Literal' ? node.literal.value : undefined;
}

function getPropertyName(node) {
  if (node.key?.type === 'Identifier') {
    return node.key.name;
  }

  if (node.key?.type === 'Literal') {
    return node.key.value;
  }

  return undefined;
}

function isApplicationErrorBaseReference(node) {
  return (
    node.type === 'TSTypeReference' &&
    node.typeName.type === 'Identifier' &&
    node.typeName.name === 'ApplicationErrorBase'
  );
}

function getKindFromApplicationErrorBaseReference(node) {
  const [kindType] = getTypeArguments(node);

  return getLiteralTypeValue(kindType);
}

function getKindFromTypeLiteral(node) {
  const kindMember = node.members.find(
    (member) =>
      member.type === 'TSPropertySignature' &&
      getPropertyName(member) === 'kind',
  );

  return getLiteralTypeValue(kindMember?.typeAnnotation?.typeAnnotation);
}

const preferApplicationErrorOfRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require application error contracts to use ApplicationErrorOf.',
    },
    messages: {
      preferApplicationErrorOf:
        'Use ApplicationErrorOf<Kind, Owner, Reason, Details> instead of spelling out the {{kind}} application error shape.',
    },
    schema: [],
  },
  create(context) {
    const filename = normalizePath(context.filename ?? context.getFilename());

    if (!APPLICATION_ERROR_FILE_PATTERN.test(filename)) {
      return {};
    }

    function reportKind(node, kind) {
      if (!APPLICATION_ERROR_KINDS.has(kind)) {
        return;
      }

      context.report({
        node,
        messageId: 'preferApplicationErrorOf',
        data: {
          kind,
        },
      });
    }

    return {
      TSTypeReference(node) {
        if (!isApplicationErrorBaseReference(node)) {
          return;
        }

        reportKind(node, getKindFromApplicationErrorBaseReference(node));
      },
      TSTypeLiteral(node) {
        reportKind(node, getKindFromTypeLiteral(node));
      },
    };
  },
};

export default preferApplicationErrorOfRule;
