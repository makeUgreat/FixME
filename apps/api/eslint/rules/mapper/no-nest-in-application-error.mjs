const APPLICATION_ERROR_FILE_PATTERN =
  /[/\\]application[/\\].*[.]error[.]ts$/u;

function normalizePath(filename) {
  return filename.replaceAll('\\', '/');
}

const noNestInApplicationErrorRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Nest and HTTP imports in application error contracts.',
    },
    messages: {
      noNestImport:
        'Application error contracts must not import Nest or HTTP types. Map HTTP concerns in presentation mappers.',
    },
    schema: [],
  },
  create(context) {
    const filename = normalizePath(context.filename ?? context.getFilename());

    if (!APPLICATION_ERROR_FILE_PATTERN.test(filename)) {
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

export default noNestInApplicationErrorRule;
