import { getFileRoleMatch } from '../../utils/file-role.mjs';
import { toPascalCase } from '../../utils/string-case.mjs';

const IGNORED_TYPE_SUFFIXES = [
  'Params',
  'Props',
  'Options',
  'Payload',
  'Result',
];

const DIRECTIONAL_ERROR_MAPPER_TYPE_NAMES_BY_SOURCE = {
  domain: ['DomainErrorMapper', 'DomainErrorToApplicationErrorMapper'],
};

const SHARED_BASE_TYPE_NAMES_BY_FILE_SUBJECT = new Map([
  ['application-error-mapper', ['DomainErrorToApplicationErrorMapper']],
]);

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

function getFileSubject(match) {
  return match.nameParts.join('.');
}

function getExpectedTypeName(filename) {
  const match = getFileRoleMatch(filename);

  if (!match) {
    return undefined;
  }

  return toPascalCase(match.nameParts.join('.')) + match.typeSuffix;
}

function getAllowedTypeNames(filename) {
  const expectedName = getExpectedTypeName(filename);
  const match = getFileRoleMatch(filename);

  if (!expectedName || !match) {
    return [];
  }

  const allowedNames = [expectedName];

  if (match.role === 'base') {
    allowedNames.push(expectedName + 'Base');
  }

  if (match.role === 'mapper' && match.nameParts.at(-1)?.endsWith('-error')) {
    const namePartsWithoutErrorSuffix = match.nameParts.slice();
    namePartsWithoutErrorSuffix[namePartsWithoutErrorSuffix.length - 1] =
      namePartsWithoutErrorSuffix.at(-1).replace(/-error$/u, '');
    const scopeName = toPascalCase(
      namePartsWithoutErrorSuffix.join('.'),
    );

    for (const suffix of DIRECTIONAL_ERROR_MAPPER_TYPE_NAMES_BY_SOURCE.domain) {
      allowedNames.push(scopeName + suffix);
    }
  }

  if (match.role === 'base') {
    allowedNames.push(
      ...(SHARED_BASE_TYPE_NAMES_BY_FILE_SUBJECT.get(getFileSubject(match)) ??
        []),
    );
  }

  return allowedNames;
}

function getFileRole(filename) {
  return getFileRoleMatch(filename)?.role;
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
        const allowedNames = getAllowedTypeNames(filename);

        if (allowedNames.length === 0) {
          return;
        }

        if (getFileRole(filename) === 'type') {
          return;
        }

        const declarations = getRelevantDeclarations(node);
        if (declarations.length === 0) {
          return;
        }

        const hasExpectedDeclaration = declarations.some((declaration) =>
          allowedNames.includes(getDeclarationName(declaration)),
        );

        if (hasExpectedDeclaration) {
          return;
        }

        context.report({
          node: declarations[0],
          messageId: 'expectedTypeName',
          data: { expectedName: allowedNames[0] },
        });
      },
    };
  },
};

export default typeNameMatchesFileNameRule;
