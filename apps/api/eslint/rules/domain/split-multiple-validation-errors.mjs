import { getMethodName } from '../../utils/ast.mjs';
import { getFileRole } from '../../utils/file-role.mjs';

const DOMAIN_MODEL_ROLES = new Set(['aggregate', 'entity', 'vo']);
const MAX_DIRECT_ERR_RETURNS = 1;

function getContainingFunction(node) {
  let current = node.parent;

  while (current) {
    if (
      current.type === 'FunctionDeclaration' ||
      current.type === 'FunctionExpression' ||
      current.type === 'ArrowFunctionExpression'
    ) {
      return current;
    }

    current = current.parent;
  }

  return undefined;
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

function isErrReturn(node) {
  return (
    node.argument?.type === 'CallExpression' &&
    isErrCallee(node.argument.callee)
  );
}

const splitMultipleValidationErrorsRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require validateProps methods with multiple validation errors to split rules into named methods.',
    },
    messages: {
      splitValidationErrors:
        'Split validateProps validation rules into named methods when returning more than one validation error directly.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const role = getFileRole(filename);

    if (!DOMAIN_MODEL_ROLES.has(role)) {
      return {};
    }

    const validatePropsStack = [];

    return {
      MethodDefinition(node) {
        if (getMethodName(node) !== 'validateProps') {
          return;
        }

        validatePropsStack.push({
          node,
          directErrReturnCount: 0,
        });
      },

      'MethodDefinition:exit'(node) {
        const current = validatePropsStack.at(-1);

        if (!current || current.node !== node) {
          return;
        }

        validatePropsStack.pop();

        if (current.directErrReturnCount <= MAX_DIRECT_ERR_RETURNS) {
          return;
        }

        context.report({
          node,
          messageId: 'splitValidationErrors',
        });
      },

      ReturnStatement(node) {
        const current = validatePropsStack.at(-1);

        if (!current || getContainingFunction(node) !== current.node.value) {
          return;
        }

        if (isErrReturn(node)) {
          current.directErrReturnCount += 1;
        }
      },
    };
  },
};

export default splitMultipleValidationErrorsRule;
