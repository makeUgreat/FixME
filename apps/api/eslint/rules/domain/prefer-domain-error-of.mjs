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

function isDomainErrorBaseReference(node) {
  return (
    node.type === 'TSTypeReference' &&
    node.typeName.type === 'Identifier' &&
    node.typeName.name === 'DomainErrorBase'
  );
}

function getKindFromDomainErrorBaseReference(node) {
  const [kindType] = getTypeArguments(node);

  return getLiteralTypeValue(kindType);
}

function getKindFromTypeLiteral(node) {
  const kindMember = node.members.find(
    (member) =>
      member.type === 'TSPropertySignature' && getPropertyName(member) === 'kind',
  );

  return getLiteralTypeValue(kindMember?.typeAnnotation?.typeAnnotation);
}

function isDomainErrorKind(kind) {
  return (
    kind === 'invariant_violation' ||
    kind === 'state_conflict' ||
    kind === 'operation_not_allowed'
  );
}

const preferDomainErrorOfRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require domain error contracts to use the shared DomainErrorOf helper.',
    },
    messages: {
      preferDomainErrorOf:
        'Use DomainErrorOf<Kind, Owner, Reason, Details> instead of spelling out the {{kind}} domain error shape.',
    },
    schema: [],
  },
  create(context) {
    function reportKind(node, kind) {
      if (!isDomainErrorKind(kind)) {
        return;
      }

      context.report({
        node,
        messageId: 'preferDomainErrorOf',
        data: {
          kind,
        },
      });
    }

    return {
      TSTypeReference(node) {
        if (!isDomainErrorBaseReference(node)) {
          return;
        }

        reportKind(node, getKindFromDomainErrorBaseReference(node));
      },
      TSTypeLiteral(node) {
        reportKind(node, getKindFromTypeLiteral(node));
      },
    };
  },
};

export default preferDomainErrorOfRule;
