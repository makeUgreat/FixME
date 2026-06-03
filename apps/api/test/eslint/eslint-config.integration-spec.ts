import path from 'node:path';
import { ESLint, Linter } from 'eslint';
import { describe, expect, it } from 'vitest';
import eslintConfig from '../../eslint.config.mjs';

const tsconfigRootDir = process.cwd();

function lintWithProjectConfig(code: string, filename: string) {
  const linter = new Linter();

  return linter.verify(code, eslintConfig, { filename });
}

function getConfiguredRules(config: unknown): Record<string, unknown> {
  return (config as { rules?: Record<string, unknown> }).rules ?? {};
}

async function calculateConfigForFile(filePath: string): Promise<unknown> {
  const eslint = new ESLint({
    cwd: tsconfigRootDir,
    overrideConfigFile: path.join(tsconfigRootDir, 'eslint.config.mjs'),
  });

  return eslint.calculateConfigForFile(filePath);
}

describe('eslint.config.mjs (integration)', () => {
  it('규칙 없이 TypeScript 파일을 파싱한다', () => {
    const messages = lintWithProjectConfig(
      `
        enum Status {
          Ready,
        }
      `,
      'test/eslint/eslint-config.integration-spec.ts',
    );

    expect(messages).toEqual([]);
  });

  it('source 파일에는 적용된 ESLint 규칙이 없다', async () => {
    const config = await calculateConfigForFile(
      'src/modules/corrections/domain/correction.aggregate.ts',
    );

    expect(getConfiguredRules(config)).toEqual({});
  });

  it('test 파일에는 적용된 ESLint 규칙이 없다', async () => {
    const config = await calculateConfigForFile(
      'test/app/app.integration-spec.ts',
    );

    expect(getConfiguredRules(config)).toEqual({});
  });
});
