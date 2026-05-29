import { getFileRoleMatch } from '../../utils/file-role.mjs';
import { toPascalCase } from '../../utils/string-case.mjs';

const IGNORED_TYPE_SUFFIXES = [
  'Params',
  'Props',
  'Options',
  'Payload',
  'Result',
];

function isClassOrInterface(node) {
  return (
    node.type === 'ClassDeclaration' || node.type === 'TSInterfaceDeclaration'
  );
}

function getDeclarationName(node) {
  return isClassOrInterface(node) ? node.id?.name : undefined;
}

function isIgnoredHelperDeclaration(name) {
  return IGNORED_TYPE_SUFFIXES.some((suffix) => name.endsWith(suffix));
}

function getExpectedTypeName(filename) {
  const match = getFileRoleMatch(filename);

  if (!match) {
    return undefined;
  }

  return toPascalCase(match.nameParts.join('.')) + match.typeSuffix;
}

function getRelevantDeclarations(programNode) {
  return programNode.body
    .map((node) => {
      if (isClassOrInterface(node)) {
        return node;
      }

      if (
        node.type === 'ExportNamedDeclaration' ||
        node.type === 'ExportDefaultDeclaration'
      ) {
        return node.declaration;
      }

      return undefined;
    })
    .filter(Boolean)
    .filter(isClassOrInterface)
    .filter((node) => {
      const name = getDeclarationName(node);
      return name && !isIgnoredHelperDeclaration(name);
    });
}

const typeNameMatchesFileNameRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require type names to match file names.',
    },
    messages: {
      expectedTypeName: 'Expected this file to declare {{ expectedName }}.',
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const filename = context.filename ?? context.getFilename();
        const expectedName = getExpectedTypeName(filename);

        if (!expectedName) {
          return;
        }

        const declarations = getRelevantDeclarations(node);
        if (declarations.length === 0) {
          return;
        }

        const hasExpectedDeclaration = declarations.some(
          (declaration) => getDeclarationName(declaration) === expectedName,
        );

        if (hasExpectedDeclaration) {
          return;
        }

        context.report({
          node: declarations[0],
          messageId: 'expectedTypeName',
          data: { expectedName },
        });
      },
    };
  },
};

export default typeNameMatchesFileNameRule;
