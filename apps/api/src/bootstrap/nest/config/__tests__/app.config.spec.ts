import { describe, expect, it } from 'vitest';
import { parseApiEnv } from '../app.config';

describe('parseApiEnv', () => {
  it('기본 app env를 사용한다', () => {
    expect(parseApiEnv({})).toEqual({
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
        PORT: ' ',
        CORRECTION_PERSISTENCE: '',
      }),
    ).toEqual({
      PORT: 3000,
      CORRECTION_PERSISTENCE: 'postgres-drizzle',
    });
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
      PORT: 3000,
      CORRECTION_PERSISTENCE: 'postgres-drizzle',
      CORRECTIONS_DATABASE_URL: ' postgres://app ',
    });
  });

  it('adapter 필수 env는 root에서 검증하지 않는다', () => {
    expect(
      parseApiEnv({ CORRECTION_PERSISTENCE: 'postgres-drizzle' }),
    ).toEqual({
      PORT: 3000,
      CORRECTION_PERSISTENCE: 'postgres-drizzle',
    });
  });

  it('지원하지 않는 persistence adapter이면 실패한다', () => {
    expect(() =>
      parseApiEnv({ CORRECTION_PERSISTENCE: 'unknown' }),
    ).toThrow(
      'Invalid api environment configuration: CORRECTION_PERSISTENCE:',
    );
  });
});
