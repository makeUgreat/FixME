import { describe, expect, it } from 'vitest';
import { appEnvSchema } from '../app.config';

describe('appEnvSchema', () => {
  it('기본 app env를 사용한다', () => {
    expect(appEnvSchema.parse({})).toEqual({
      APP_ENV: 'local',
      NODE_ENV: 'development',
      PORT: 3000,
    });
  });

  it('PORT 값을 number로 변환한다', () => {
    expect(appEnvSchema.parse({ PORT: '4000' }).PORT).toBe(4000);
  });

  it('빈 문자열은 기본값으로 처리한다', () => {
    expect(
      appEnvSchema.parse({
        APP_ENV: '',
        NODE_ENV: '',
        PORT: ' ',
      }),
    ).toEqual({
      APP_ENV: 'local',
      NODE_ENV: 'development',
      PORT: 3000,
    });
  });

  it.each(['local', 'development', 'test', 'production'] as const)(
    'APP_ENV 값 %s를 app env로 사용한다',
    (appEnv) => {
      expect(appEnvSchema.parse({ APP_ENV: appEnv }).APP_ENV).toBe(appEnv);
    },
  );

  it('APP_ENV 값이 유효하지 않으면 실패한다', () => {
    expect(() => appEnvSchema.parse({ APP_ENV: 'unknown' })).toThrow();
  });

  it.each(['development', 'test', 'production'] as const)(
    'NODE_ENV 값 %s를 node env로 사용한다',
    (nodeEnv) => {
      expect(appEnvSchema.parse({ NODE_ENV: nodeEnv }).NODE_ENV).toBe(nodeEnv);
    },
  );

  it('NODE_ENV 값이 유효하지 않으면 실패한다', () => {
    expect(() => appEnvSchema.parse({ NODE_ENV: 'unknown' })).toThrow();
  });

  it('PORT 값이 유효하지 않으면 실패한다', () => {
    expect(() => appEnvSchema.parse({ PORT: 'invalid' })).toThrow();
  });

  it('adapter env를 보존하되 root에서 정규화하지 않는다', () => {
    expect(
      appEnvSchema.parse({
        CORRECTION_PERSISTENCE: 'postgres-drizzle',
        POSTGRES_HOST: ' 10.0.0.8 ',
        POSTGRES_PORT: '6543',
      }),
    ).toMatchObject({
      APP_ENV: 'local',
      NODE_ENV: 'development',
      PORT: 3000,
      CORRECTION_PERSISTENCE: 'postgres-drizzle',
      POSTGRES_HOST: ' 10.0.0.8 ',
      POSTGRES_PORT: '6543',
    });
  });

  it('adapter env 기본값은 root에서 적용하지 않는다', () => {
    expect(appEnvSchema.parse({})).not.toHaveProperty(
      'CORRECTION_PERSISTENCE',
    );
  });

  it('adapter env 값은 root에서 검증하지 않는다', () => {
    expect(
      appEnvSchema.parse({ CORRECTION_PERSISTENCE: 'unknown' }),
    ).toEqual({
      APP_ENV: 'local',
      NODE_ENV: 'development',
      PORT: 3000,
      CORRECTION_PERSISTENCE: 'unknown',
    });
  });
});
