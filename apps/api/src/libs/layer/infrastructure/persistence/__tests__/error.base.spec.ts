import { describe, expect, it } from 'vitest';
import {
  INFRASTRUCTURE_ERROR_KIND,
  type InfrastructureErrorBase,
} from '../../error.base';
import { PERSISTENCE_ERROR_KIND, type PersistenceErrorOf } from '../error.base';

type TestPersistenceError = PersistenceErrorOf<
  typeof PERSISTENCE_ERROR_KIND.UNAVAILABLE,
  'sample_repository',
  'save_unavailable',
  Record<string, never>,
  {
    boundary: 'persistence';
    adapter: 'memory';
  }
>;

describe('PersistenceErrorBase', () => {
  it('infrastructure error의 더 좁은 타입으로 사용할 수 있다', () => {
    const error: TestPersistenceError = {
      kind: PERSISTENCE_ERROR_KIND.UNAVAILABLE,
      code: 'sample_repository.save_unavailable',
      source: {
        boundary: 'persistence',
        adapter: 'memory',
      },
      message: 'Sample could not be saved',
      details: {},
    };

    const infrastructureError: InfrastructureErrorBase = error;

    expect(infrastructureError.kind).toBe(
      INFRASTRUCTURE_ERROR_KIND.UNAVAILABLE,
    );
    expect(infrastructureError.source.boundary).toBe('persistence');
  });
});
