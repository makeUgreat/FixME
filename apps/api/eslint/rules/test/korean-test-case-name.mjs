const HANGUL_SYLLABLE_PATTERN = /[가-힣]/;

function isTestCaseCall(node) {
  if (node.type !== 'CallExpression') {
    return false;
  }

  if (node.callee.type === 'Identifier') {
    return node.callee.name === 'it' || node.callee.name === 'test';
  }

  if (
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier'
  ) {
    return node.callee.object.name === 'it' || node.callee.object.name === 'test';
  }

  return false;
}

function getStaticString(node) {
  if (node?.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }

  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis.map((quasi) => quasi.value.cooked).join('');
  }

  return undefined;
}

const koreanTestCaseNameRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require Vitest test case names to use Korean as the main sentence.',
    },
    messages: {
      expectedKoreanName:
        'Test case names must be static strings whose main sentence is Korean. English technical terms may be mixed in.',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!isTestCaseCall(node)) {
          return;
        }

        const testName = getStaticString(node.arguments[0]);

        if (testName && HANGUL_SYLLABLE_PATTERN.test(testName)) {
          return;
        }

        context.report({
          node,
          messageId: 'expectedKoreanName',
        });
      },
    };
  },
};

export default koreanTestCaseNameRule;
