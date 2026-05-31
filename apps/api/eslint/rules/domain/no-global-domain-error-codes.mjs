const DOMAIN_ERROR_CODE_PATTERN = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/u;

function isSharedDomainErrorFile(filename) {
  return /[/\\]src[/\\]libs[/\\]ddd[/\\]domain.error\.ts$/u.test(filename);
}

function isSharedDddCode(value) {
  return value.startsWith('entity.');
}

const noGlobalDomainErrorCodesRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent the shared DomainError type from becoming a global domain error code registry.',
    },
    messages: {
      domainCode:
        'Domain-specific error codes must be owned by their domain, not src/libs/ddd/domain.error.ts.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();

    if (!isSharedDomainErrorFile(filename)) {
      return {};
    }

    return {
      Literal(node) {
        if (
          typeof node.value === 'string' &&
          DOMAIN_ERROR_CODE_PATTERN.test(node.value) &&
          !isSharedDddCode(node.value)
        ) {
          context.report({
            node,
            messageId: 'domainCode',
          });
        }
      },
    };
  },
};

export default noGlobalDomainErrorCodesRule;
