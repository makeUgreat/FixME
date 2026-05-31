import { getMethodName } from '../../utils/ast.mjs';

const DOMAIN_FILE_PATTERN = /\/domain\/.*[.](aggregate|entity|vo)[.]ts$/;
const SERIALIZATION_METHOD_NAMES = new Set([
  'fromRecord',
  'toDto',
  'toJSON',
  'toRecord',
  'toResponse',
]);

function normalizePath(filename) {
  return filename.replaceAll('\\', '/');
}

const noDomainModelSerializationRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow persistence or presentation serialization methods on domain models.',
    },
    messages: {
      noSerialization:
        'Keep boundary serialization in mappers instead of domain models.',
    },
    schema: [],
  },
  create(context) {
    const filename = normalizePath(context.filename ?? context.getFilename());

    if (!DOMAIN_FILE_PATTERN.test(filename)) {
      return {};
    }

    return {
      MethodDefinition(node) {
        const methodName = getMethodName(node);

        if (!methodName || !SERIALIZATION_METHOD_NAMES.has(methodName)) {
          return;
        }

        context.report({
          node: node.key,
          messageId: 'noSerialization',
        });
      },
    };
  },
};

export default noDomainModelSerializationRule;
