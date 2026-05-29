import path from 'node:path';
import { toPascalCase } from './string-case.mjs';

const TYPE_SUFFIX_BY_FILE_ROLE = {
  base: '',
  aggregate: '',
  entity: '',
  vo: '',
  interface: '',
  port: '',
  mapper: 'Mapper',
  module: 'Module',
  service: 'Service',
  'use-case': 'UseCase',
};

function basenameWithoutExtension(filename) {
  return path.basename(filename).replace(/\.ts$/, '');
}

function getTypeSuffix(role) {
  if (role.endsWith('.controller')) {
    return toPascalCase(role);
  }

  return TYPE_SUFFIX_BY_FILE_ROLE[role];
}

export function getFileRoleMatch(filename) {
  const basename = basenameWithoutExtension(filename);
  const parts = basename.split('.');
  const candidates = [
    {
      role: parts.slice(-2).join('.'),
      roleSegmentCount: 2,
    },
    {
      role: parts.at(-1),
      roleSegmentCount: 1,
    },
  ];

  for (const { role, roleSegmentCount } of candidates) {
    if (parts.length <= roleSegmentCount) {
      continue;
    }

    const typeSuffix = getTypeSuffix(role);

    if (typeSuffix !== undefined) {
      return {
        nameParts: parts.slice(0, -roleSegmentCount),
        role,
        typeSuffix,
      };
    }
  }

  return undefined;
}

export function getFileRole(filename) {
  return getFileRoleMatch(filename)?.role;
}
