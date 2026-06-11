import { describe, expect, it } from 'vitest';
import { resolveCorrectionPersistence } from '../corrections.config';

describe('resolveCorrectionPersistence', () => {
  it('값이 없으면 postgres-drizzle persistence로 해석한다', () => {
    expect(resolveCorrectionPersistence({})).toBe('postgres-drizzle');
  });

  it('빈 문자열이면 postgres-drizzle persistence로 해석한다', () => {
    expect(resolveCorrectionPersistence({ CORRECTION_PERSISTENCE: '' })).toBe(
      'postgres-drizzle',
    );
  });

  it('postgres-drizzle persistence로 해석한다', () => {
    expect(
      resolveCorrectionPersistence({
        CORRECTION_PERSISTENCE: 'postgres-drizzle',
      }),
    ).toBe('postgres-drizzle');
  });
});
