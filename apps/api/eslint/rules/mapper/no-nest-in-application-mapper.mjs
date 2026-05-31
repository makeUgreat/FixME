const APPLICATION_MAPPER_FILE_PATTERN = /\/application\/.*[.]mapper[.]ts$/;

function normalizePath(filename) {
  return filename.replaceAll('\\', '/');
}

const noNestInApplicationMapperRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow Nest and HTTP imports in application mappers.',
    },
    messages: {
      noNestImport:
        'Application mappers must not import Nest or HTTP types. Translate HTTP concerns in presentation mappers.',
    },
    schema: [],
  },
  create(context) {
    const filename = normalizePath(context.filename ?? context.getFilename());

    if (!APPLICATION_MAPPER_FILE_PATTERN.test(filename)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value !== '@nestjs/common') {
          return;
        }

        context.report({
          node,
          messageId: 'noNestImport',
        });
      },
    };
  },
};

export default noNestInApplicationMapperRule;
