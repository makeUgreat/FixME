function isIntegrationSpec(filename) {
  return filename.replaceAll('\\', '/').endsWith('.integration-spec.ts');
}

function isDescribeCall(node) {
  return node?.type === 'CallExpression' && node.callee.name === 'describe';
}

function getTopLevelDescribe(programNode) {
  return programNode.body
    .map((node) => (node.type === 'ExpressionStatement' ? node.expression : undefined))
    .find(isDescribeCall);
}

const integrationDescribeNameRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require integration specs to mark the outer describe name as integration.',
    },
    messages: {
      expectedIntegrationName:
        'Integration specs must include "(integration)" in the outer describe name.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();

    if (!isIntegrationSpec(filename)) {
      return {};
    }

    return {
      Program(node) {
        const describeCall = getTopLevelDescribe(node);
        const describeName = describeCall?.arguments[0];

        if (
          describeName?.type === 'Literal' &&
          typeof describeName.value === 'string' &&
          describeName.value.includes('(integration)')
        ) {
          return;
        }

        context.report({
          node: describeCall ?? node,
          messageId: 'expectedIntegrationName',
        });
      },
    };
  },
};

export default integrationDescribeNameRule;
