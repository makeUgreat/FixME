import { describe, expect, it } from 'vitest';
import { createCorrectionsPostgresDrizzleConfig } from '../postgres-drizzle.config';

describe('createCorrectionsPostgresDrizzleConfig', () => {
  it('postgres drizzle config를 생성하고 database url을 정규화한다', () => {
    expect(
      createCorrectionsPostgresDrizzleConfig({
        CORRECTIONS_DATABASE_URL: ' postgres://app ',
      }),
    ).toEqual({ databaseUrl: 'postgres://app' });
  });

  it('database url이 없으면 실패한다', () => {
    expect(() => createCorrectionsPostgresDrizzleConfig({})).toThrow(
      'Invalid corrections postgres drizzle environment configuration: CORRECTIONS_DATABASE_URL:',
    );
  });

  it('database url이 빈 문자열이면 실패한다', () => {
    expect(() =>
      createCorrectionsPostgresDrizzleConfig({
        CORRECTIONS_DATABASE_URL: ' ',
      }),
    ).toThrow(
      'Invalid corrections postgres drizzle environment configuration: CORRECTIONS_DATABASE_URL:',
    );
  });
});
