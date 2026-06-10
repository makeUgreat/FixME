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

  it('source 파일에는 import path style 규칙이 적용된다', async () => {
    const config = await calculateConfigForFile(
      'src/contexts/corrections/domain/correction.aggregate.ts',
    );

    expect(getConfiguredRules(config)).toMatchObject({
      'api-local/import-path-style': [2],
    });
  });

  it('test 파일에는 적용된 ESLint 규칙이 없다', async () => {
    const config = await calculateConfigForFile(
      'test/app/app.integration-spec.ts',
    );

    expect(getConfiguredRules(config)).toEqual({});
  });

  it('source 파일에서 public boundary로 향하는 relative import를 금지한다', () => {
    const messages = lintWithProjectConfig(
      `
        import { Correction } from '../../../domain';
      `,
      'src/contexts/corrections/infrastructure/persistence/postgres-drizzle/correction.repository.ts',
    );

    expect(messages).toHaveLength(1);
    expect(messages[0]?.ruleId).toBe('api-local/import-path-style');
    expect(messages[0]?.message).toContain('@contexts/corrections/domain');
  });

  it('source 파일에서 같은 local implementation area의 relative import는 허용한다', () => {
    const messages = lintWithProjectConfig(
      `
        import { type CorrectionDomainError } from './correction.error';
      `,
      'src/contexts/corrections/domain/correction.aggregate.ts',
    );

    expect(messages).toEqual([]);
  });

  it('source 파일에서 같은 context의 다른 layer로 향하는 relative import를 금지한다', () => {
    const messages = lintWithProjectConfig(
      `
        import { CreateCorrectionCommand } from '../../application/commands/create-correction/create-correction.command';
      `,
      'src/contexts/corrections/presentation/http/corrections.controller.ts',
    );

    expect(messages).toHaveLength(1);
    expect(messages[0]?.ruleId).toBe('api-local/import-path-style');
    expect(messages[0]?.message).toContain(
      '@contexts/corrections/application/commands/create-correction/create-correction.command',
    );
  });
});
