import path from 'node:path';
import { ESLint, Linter } from 'eslint';
import { describe, expect, it } from 'vitest';
import eslintConfig from '../../eslint.config.mjs';

const tsconfigRootDir = process.cwd();

function lintWithProjectConfig(code: string, filename: string) {
  const linter = new Linter();

  return linter.verify(code, eslintConfig, { filename });
}

function getConfiguredRule(config: unknown, ruleId: string): unknown {
  return (config as { rules: Record<string, unknown> }).rules[ruleId];
}

async function calculateConfigForFile(filePath: string): Promise<unknown> {
  const eslint = new ESLint({
    cwd: tsconfigRootDir,
    overrideConfigFile: path.join(tsconfigRootDir, 'eslint.config.mjs'),
  });

  return eslint.calculateConfigForFile(filePath);
}

describe('eslint.config.mjs', () => {
  it('공통 설정에서 TypeScript enum 사용을 금지한다', () => {
    const messages = lintWithProjectConfig(
      `
        enum Status {
          Ready,
        }
      `,
      'test/eslint/fixtures/consumer.ts',
    );

    expect(messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: 'no-restricted-syntax',
          message:
            'Use as const constants plus union types instead of TypeScript enum.',
        }),
      ]),
    );
  });

  it('test 파일에서는 neverthrow Result 미사용 규칙을 끈다', async () => {
    const config = await calculateConfigForFile(
      'test/eslint/config-integration.spec.ts',
    );

    expect(getConfiguredRule(config, 'neverthrow/must-use-result')).toEqual([
      0,
    ]);
  });

  it('src 파일에는 커스텀 naming과 domain 규칙을 적용한다', async () => {
    const config = await calculateConfigForFile('src/sample.entity.ts');

    expect(
      getConfiguredRule(config, 'naming/type-name-matches-file-name'),
    ).toEqual([2]);
    expect(getConfiguredRule(config, 'domain/factory-result-return')).toEqual([
      2,
    ]);
    expect(getConfiguredRule(config, 'domain/no-direct-new')).toEqual([2]);
  });

  it('aggregate와 entity 파일에는 constructor와 factory 이름 제한을 적용한다', async () => {
    const config = await calculateConfigForFile('src/sample.entity.ts');
    const rule = getConfiguredRule(config, 'no-restricted-syntax');

    expect(rule).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          selector:
            "MethodDefinition[kind='constructor']:not([accessibility='private']):not([accessibility='protected'])",
          message:
            'Concrete domain model constructors must be private by default. Use protected only when subclassing is intentional.',
        }),
        expect.objectContaining({
          selector:
            "MethodDefinition[static=true][kind='method']:not([accessibility='private']):not([accessibility='protected'])[key.name!=/^(create|restore)$/]",
          message:
            'Public static factories on aggregates and entities must be named create or restore.',
        }),
      ]),
    );
  });

  it('value object 파일에는 constructor와 of factory 이름 제한을 적용한다', async () => {
    const config = await calculateConfigForFile('src/sample.vo.ts');
    const rule = getConfiguredRule(config, 'no-restricted-syntax');

    expect(rule).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          selector:
            "MethodDefinition[kind='constructor']:not([accessibility='private']):not([accessibility='protected'])",
          message:
            'Concrete value object constructors must be private by default. Use protected only when subclassing is intentional.',
        }),
        expect.objectContaining({
          selector:
            "MethodDefinition[static=true][kind='method']:not([accessibility='private']):not([accessibility='protected'])[key.name!='of']",
          message: 'Public static factories on value objects must be named of.',
        }),
      ]),
    );
  });
});
