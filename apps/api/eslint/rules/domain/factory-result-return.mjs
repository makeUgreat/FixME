import { getMethodName, isPublicStaticMethod } from '../../utils/ast.mjs';
import { getFileRole } from '../../utils/file-role.mjs';
import { hasResultReturnType } from '../../utils/result-type.mjs';

const FACTORY_NAMES_BY_ROLE = {
  aggregate: new Set(['create', 'restore']),
  entity: new Set(['create', 'restore']),
  vo: new Set(['of']),
};

const factoryResultReturnRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require public domain model factories to explicitly return Result.',
    },
    messages: {
      expectedResultReturn:
        'Public domain model factories must explicitly return Result.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const role = getFileRole(filename);
    const expectedFactoryNames = FACTORY_NAMES_BY_ROLE[role];

    if (!expectedFactoryNames) {
      return {};
    }

    return {
      MethodDefinition(node) {
        if (!isPublicStaticMethod(node)) {
          return;
        }

        const methodName = getMethodName(node);

        if (!methodName || !expectedFactoryNames.has(methodName)) {
          return;
        }

        if (hasResultReturnType(node)) {
          return;
        }

        context.report({
          node,
          messageId: 'expectedResultReturn',
        });
      },
    };
  },
};

export default factoryResultReturnRule;
