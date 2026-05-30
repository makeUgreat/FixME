import fs from 'node:fs';
import path from 'node:path';
import { getFileRole } from '../../utils/file-role.mjs';

function expectedSpecPath(filename) {
  const parsedPath = path.parse(filename);

  return path.join(parsedPath.dir, `${parsedPath.name}.spec${parsedPath.ext}`);
}

const requireUnitSpecRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require concrete domain model files to have a colocated unit spec.',
    },
    messages: {
      missingUnitSpec:
        'Domain models must have a colocated unit spec file: {{specFilename}}.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const role = getFileRole(filename);

    if (!role) {
      return {};
    }

    const specPath = expectedSpecPath(filename);

    if (fs.existsSync(specPath)) {
      return {};
    }

    return {
      Program(node) {
        context.report({
          node,
          messageId: 'missingUnitSpec',
          data: {
            specFilename: path.basename(specPath),
          },
        });
      },
    };
  },
};

export default requireUnitSpecRule;
