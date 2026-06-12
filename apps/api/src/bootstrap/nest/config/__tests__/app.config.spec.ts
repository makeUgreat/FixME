import { describe, expect, it } from 'vitest';
import { parseApiEnv } from '../app.config';

describe('parseApiEnv', () => {
  it('기본 app env를 사용한다', () => {
    expect(parseApiEnv({})).toEqual({
      APP_ENV: 'local',
      NODE_ENV: 'development',
      PORT: 3000,
      CORRECTION_PERSISTENCE: 'postgres-drizzle',
    });
  });

  it('PORT 값을 number로 변환한다', () => {
    expect(parseApiEnv({ PORT: '4000' }).PORT).toBe(4000);
  });

  it('빈 문자열은 기본값으로 처리한다', () => {
    expect(
      parseApiEnv({
        APP_ENV: '',
        NODE_ENV: '',
        PORT: ' ',
        CORRECTION_PERSISTENCE: '',
      }),
    ).toEqual({
      APP_ENV: 'local',
      NODE_ENV: 'development',
      PORT: 3000,
      CORRECTION_PERSISTENCE: 'postgres-drizzle',
    });
  });

  it.each(['local', 'development', 'test', 'production'] as const)(
    'APP_ENV 값 %s를 app env로 사용한다',
    (appEnv) => {
      expect(parseApiEnv({ APP_ENV: appEnv }).APP_ENV).toBe(appEnv);
    },
  );

  it('APP_ENV 값이 유효하지 않으면 실패한다', () => {
    expect(() => parseApiEnv({ APP_ENV: 'unknown' })).toThrow(
      'Invalid api environment configuration: APP_ENV:',
    );
  });

  it.each(['development', 'test', 'production'] as const)(
    'NODE_ENV 값 %s를 node env로 사용한다',
    (nodeEnv) => {
      expect(parseApiEnv({ NODE_ENV: nodeEnv }).NODE_ENV).toBe(nodeEnv);
    },
  );

  it('NODE_ENV 값이 유효하지 않으면 실패한다', () => {
    expect(() => parseApiEnv({ NODE_ENV: 'unknown' })).toThrow(
      'Invalid api environment configuration: NODE_ENV:',
    );
  });

  it('PORT 값이 유효하지 않으면 실패한다', () => {
    expect(() => parseApiEnv({ PORT: 'invalid' })).toThrow(
      'Invalid api environment configuration: PORT:',
    );
  });

  it('adapter env를 보존하되 root에서 정규화하지 않는다', () => {
    expect(
      parseApiEnv({
        CORRECTION_PERSISTENCE: 'postgres-drizzle',
        CORRECTIONS_DATABASE_URL: ' postgres://app ',
      }),
    ).toMatchObject({
      APP_ENV: 'local',
      NODE_ENV: 'development',
      PORT: 3000,
      CORRECTION_PERSISTENCE: 'postgres-drizzle',
      CORRECTIONS_DATABASE_URL: ' postgres://app ',
    });
  });

  it('adapter 필수 env는 root에서 검증하지 않는다', () => {
    expect(parseApiEnv({ CORRECTION_PERSISTENCE: 'postgres-drizzle' })).toEqual(
      {
        APP_ENV: 'local',
        NODE_ENV: 'development',
        PORT: 3000,
        CORRECTION_PERSISTENCE: 'postgres-drizzle',
      },
    );
  });

  it('지원하지 않는 persistence adapter이면 실패한다', () => {
    expect(() => parseApiEnv({ CORRECTION_PERSISTENCE: 'unknown' })).toThrow(
      'Invalid api environment configuration: CORRECTION_PERSISTENCE:',
    );
  });
});
