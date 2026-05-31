const MAPPER_FILE_PATTERN = /[.]mapper[.]ts$/u;

function normalizePath(filename) {
  return filename.replaceAll('\\', '/');
}

function isExported(node) {
  return node.parent?.type === 'ExportNamedDeclaration';
}

function getDeclarationName(node) {
  if (node.type === 'TSInterfaceDeclaration') {
    return node.id?.name;
  }

  if (node.type === 'TSTypeAliasDeclaration') {
    return node.id?.name;
  }

  return undefined;
}

function isErrorContractName(name) {
  return name.endsWith('Error');
}

function reportIfExportedErrorContract(context, node) {
  const name = getDeclarationName(node);

  if (!name || !isExported(node) || !isErrorContractName(name)) {
    return;
  }

  context.report({
    node,
    messageId: 'noErrorContract',
  });
}

const noErrorContractInMapperRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow exported error contracts in mapper files.',
    },
    messages: {
      noErrorContract:
        'Mapper files must not export error contracts. Put application error types in .error.ts files.',
    },
    schema: [],
  },
  create(context) {
    const filename = normalizePath(context.filename ?? context.getFilename());

    if (!MAPPER_FILE_PATTERN.test(filename)) {
      return {};
    }

    return {
      TSInterfaceDeclaration(node) {
        reportIfExportedErrorContract(context, node);
      },
      TSTypeAliasDeclaration(node) {
        reportIfExportedErrorContract(context, node);
      },
    };
  },
};

export default noErrorContractInMapperRule;
