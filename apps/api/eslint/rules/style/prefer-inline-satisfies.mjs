function getIdentifierName(node) {
  return node.type === 'Identifier' ? node.name : undefined;
}

function isTypedObjectVariableDeclaration(node) {
  return (
    node.type === 'VariableDeclaration' &&
    node.kind === 'const' &&
    node.declarations.length === 1 &&
    node.declarations[0]?.id.type === 'Identifier' &&
    Boolean(node.declarations[0].id.typeAnnotation) &&
    node.declarations[0]?.init?.type === 'ObjectExpression'
  );
}

function getSingleDirectIdentifierArgument(node, variableName) {
  if (
    node.type !== 'ReturnStatement' ||
    node.argument?.type !== 'CallExpression'
  ) {
    return undefined;
  }

  const matchingArguments = node.argument.arguments.filter(
    (argument) => getIdentifierName(argument) === variableName,
  );

  return matchingArguments.length === 1 ? matchingArguments[0] : undefined;
}

const preferInlineSatisfiesRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer inline satisfies for single-use typed object literals returned through a call.',
    },
    messages: {
      preferInlineSatisfies:
        'Inline this single-use typed object into the return call and keep structural checking with `satisfies {{ typeName }}`. Suggested shape: `return {{ callee }}({ ... } satisfies {{ typeName }});`.',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    function reportIfSingleUseTypedObject(statement, nextStatement) {
      if (!isTypedObjectVariableDeclaration(statement) || !nextStatement) {
        return;
      }

      const declaration = statement.declarations[0];
      const variableName = declaration.id.name;
      const identifierArgument = getSingleDirectIdentifierArgument(
        nextStatement,
        variableName,
      );

      if (!identifierArgument) {
        return;
      }

      context.report({
        node: declaration.id,
        messageId: 'preferInlineSatisfies',
        data: {
          callee: sourceCode.getText(nextStatement.argument.callee),
          typeName: sourceCode.getText(
            declaration.id.typeAnnotation.typeAnnotation,
          ),
        },
      });
    }

    return {
      BlockStatement(node) {
        node.body.forEach((statement, index) => {
          reportIfSingleUseTypedObject(statement, node.body[index + 1]);
        });
      },
    };
  },
};

export default preferInlineSatisfiesRule;
