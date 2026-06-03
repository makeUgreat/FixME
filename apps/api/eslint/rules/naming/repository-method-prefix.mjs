const ALLOWED_EXACT_METHOD_NAMES = new Set(['save']);

const ALLOWED_BY_PREFIXES = [
  'findBy',
  'getBy',
  'listBy',
  'countBy',
  'existsBy',
  'deleteBy',
];

function normalizePath(filename) {
  return filename.replaceAll('\\', '/');
}

function isRepositoryFile(filename) {
  return normalizePath(filename).endsWith('.repository.ts');
}

function getKeyName(key) {
  if (key?.type === 'Identifier') {
    return key.name;
  }

  if (key?.type === 'Literal' && typeof key.value === 'string') {
    return key.value;
  }

  return undefined;
}

function isPublicClassMethod(member) {
  return (
    member.type === 'MethodDefinition' &&
    member.kind === 'method' &&
    !member.static &&
    member.accessibility !== 'private' &&
    member.accessibility !== 'protected'
  );
}

function isInterfaceMethod(member) {
  return member.type === 'TSMethodSignature';
}

function getRepositoryMethodNodes(programNode) {
  return programNode.body.flatMap((node) => {
    if (node.type === 'TSInterfaceDeclaration') {
      return node.body.body.filter(isInterfaceMethod);
    }

    if (node.type === 'ClassDeclaration') {
      return node.body.body.filter(isPublicClassMethod);
    }

    if (
      node.type === 'ExportNamedDeclaration' &&
      node.declaration?.type === 'TSInterfaceDeclaration'
    ) {
      return node.declaration.body.body.filter(isInterfaceMethod);
    }

    if (
      node.type === 'ExportNamedDeclaration' &&
      node.declaration?.type === 'ClassDeclaration'
    ) {
      return node.declaration.body.body.filter(isPublicClassMethod);
    }

    return [];
  });
}

function hasByQualifier(name, prefix) {
  const qualifier = name.slice(prefix.length);

  return /^[A-Z][a-zA-Z0-9]*$/u.test(qualifier);
}

function isAllowedRepositoryMethodName(name) {
  if (ALLOWED_EXACT_METHOD_NAMES.has(name)) {
    return true;
  }

  return ALLOWED_BY_PREFIXES.some(
    (prefix) => name.startsWith(prefix) && hasByQualifier(name, prefix),
  );
}

const repositoryMethodPrefixRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require repository methods to use supported persistence prefixes.',
    },
    messages: {
      expectedRepositoryMethodPrefix:
        'Repository methods must be named save or use a supported By-qualified prefix: findByX, getByX, listByX, countByX, existsByX, deleteByX.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();

    if (!isRepositoryFile(filename)) {
      return {};
    }

    return {
      Program(node) {
        for (const methodNode of getRepositoryMethodNodes(node)) {
          const name = getKeyName(methodNode.key);

          if (!name || isAllowedRepositoryMethodName(name)) {
            continue;
          }

          context.report({
            node: methodNode.key,
            messageId: 'expectedRepositoryMethodPrefix',
          });
        }
      },
    };
  },
};

export default repositoryMethodPrefixRule;
