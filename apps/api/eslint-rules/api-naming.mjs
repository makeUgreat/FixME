import path from 'node:path';

const ROLE_SUFFIXES = new Map([
  ['usecase', 'UseCase'],
  ['command', 'Command'],
  ['query', 'Query'],
  ['service', 'Service'],
  ['mapper', 'Mapper'],
  ['factory', 'Factory'],
  ['model', 'Model'],
  ['exception', 'Exception'],
  ['strategy', 'Strategy'],
  ['filter', 'Filter'],
  ['module', 'Module'],
  ['tokens', 'Tokens'],
]);

const MULTI_ROLE_SUFFIXES = [
  { parts: ['request', 'dto'], suffix: 'RequestDto' },
  { parts: ['response', 'dto'], suffix: 'ResponseDto' },
  { parts: ['repository', 'port'], suffix: 'Repository' },
];

const NO_TECHNICAL_SUFFIX_ROLES = new Set([
  'aggregate',
  'entity',
  'vo',
  'base',
  'interface',
  'port',
]);

const IGNORED_TYPE_SUFFIXES = [
  'Params',
  'Props',
  'Options',
  'Payload',
  'Result',
];

const PASCAL_CASE_OVERRIDES = new Map([['usecase', 'UseCase']]);

function basenameWithoutExtension(filename) {
  return path.basename(filename).replace(/\.ts$/, '');
}

function toPascalCase(value) {
  return value
    .split(/[-.]/)
    .filter(Boolean)
    .map(
      (part) =>
        PASCAL_CASE_OVERRIDES.get(part) ??
        part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join('');
}

function isExportedDeclaration(node) {
  return (
    node.parent?.type === 'ExportNamedDeclaration' ||
    node.parent?.type === 'ExportDefaultDeclaration' ||
    node.export === true
  );
}

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

function getExpectedRoleTypeName(filename) {
  const basename = basenameWithoutExtension(filename);
  const parts = basename.split('.');

  for (const { parts: roleParts, suffix } of MULTI_ROLE_SUFFIXES) {
    if (parts.length <= roleParts.length) {
      continue;
    }

    const tail = parts.slice(-roleParts.length);
    if (tail.join('.') !== roleParts.join('.')) {
      continue;
    }

    return toPascalCase(parts.slice(0, -roleParts.length).join('.')) + suffix;
  }

  if (parts.length < 2) {
    return undefined;
  }

  const role = parts.at(-1);
  const name = parts.slice(0, -1).join('.');
  const roleSuffix = ROLE_SUFFIXES.get(role);

  if (roleSuffix) {
    return toPascalCase(name) + roleSuffix;
  }

  if (NO_TECHNICAL_SUFFIX_ROLES.has(role)) {
    return toPascalCase(name);
  }

  return undefined;
}

function getExpectedControllerTypeName(filename) {
  const basename = basenameWithoutExtension(filename);
  const parts = basename.split('.');

  if (parts.length < 3 || parts.at(-1) !== 'controller') {
    return undefined;
  }

  const protocol = parts.at(-2);
  const name = parts.slice(0, -2).join('.');

  return `${toPascalCase(name)}${toPascalCase(protocol)}Controller`;
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
    .filter(isExportedDeclaration)
    .filter((node) => {
      const name = getDeclarationName(node);
      return name && !isIgnoredHelperDeclaration(name);
    });
}

function createExpectedTypeRule({ getExpectedName, messageId }) {
  return {
    meta: {
      type: 'problem',
      docs: {
        description: 'Require API type names to match file naming roles.',
      },
      messages: {
        [messageId]: 'Expected this file to export {{ expectedName }}.',
      },
      schema: [],
    },
    create(context) {
      return {
        Program(node) {
          const filename = context.filename ?? context.getFilename();
          const expectedName = getExpectedName(filename);

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
            messageId,
            data: { expectedName },
          });
        },
      };
    },
  };
}

const apiNamingPlugin = {
  meta: {
    name: 'eslint-plugin-api-naming',
  },
  rules: {
    'file-role-type-suffix': createExpectedTypeRule({
      getExpectedName: getExpectedRoleTypeName,
      messageId: 'expectedRoleTypeName',
    }),
    'controller-protocol-name': createExpectedTypeRule({
      getExpectedName: getExpectedControllerTypeName,
      messageId: 'expectedControllerTypeName',
    }),
  },
};

export default apiNamingPlugin;
