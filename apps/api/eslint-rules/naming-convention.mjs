import path from 'node:path';

const ROLE_SEGMENT_COUNTS = [2, 1];

const TECHNICAL_SUFFIX_ROLES = new Set([
  'module',
]);

const DOMAIN_MODEL_ROLES = new Set([
  'aggregate',
  'entity',
  'vo',
]);

const SUFFIXLESS_INFRASTRUCTURE_ROLES = new Set([
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

function basenameWithoutExtension(filename) {
  return path.basename(filename).replace(/\.ts$/, '');
}

function toPascalCase(value) {
  return value
    .split(/[-.]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
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

function getTechnicalRoleSuffix(role) {
  if (
    DOMAIN_MODEL_ROLES.has(role) ||
    SUFFIXLESS_INFRASTRUCTURE_ROLES.has(role)
  ) {
    return '';
  }

  if (TECHNICAL_SUFFIX_ROLES.has(role) || role.endsWith('.controller')) {
    return toPascalCase(role);
  }

  return undefined;
}

function getExpectedTypeName(filename) {
  const basename = basenameWithoutExtension(filename);
  const parts = basename.split('.');

  for (const roleSegmentCount of ROLE_SEGMENT_COUNTS) {
    if (parts.length <= roleSegmentCount) {
      continue;
    }

    const role = parts.slice(-roleSegmentCount).join('.');
    const suffix = getTechnicalRoleSuffix(role);

    if (suffix === undefined) {
      continue;
    }

    return toPascalCase(parts.slice(0, -roleSegmentCount).join('.')) + suffix;
  }

  return undefined;
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
        description: 'Require type names to match file naming roles.',
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

const namingConventionPlugin = {
  meta: {
    name: 'eslint-plugin-naming-convention',
  },
  rules: {
    'file-role-type-suffix': createExpectedTypeRule({
      getExpectedName: getExpectedTypeName,
      messageId: 'expectedRoleTypeName',
    }),
  },
};

export default namingConventionPlugin;
