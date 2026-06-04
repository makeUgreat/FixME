import { describe, expect, it } from 'vitest';
import { AggregateRoot } from '../aggregate-root.base';
import { type DomainError } from '../error.base';
import { ok, type Result } from '@core/result';

interface SampleProps {
  name: string;
}

class SampleAggregateRoot extends AggregateRoot<string, SampleProps> {
  static create(params: {
    id: string;
    props?: SampleProps;
  }): Result<SampleAggregateRoot, DomainError> {
    return super.construct({
      params: {
        id: params.id,
        props: params.props ?? { name: 'spring' },
      },
      validate: (entityParams) => ok(entityParams),
      instantiate: (entityParams) => new SampleAggregateRoot(entityParams),
    });
  }
}

describe('AggregateRoot', () => {
  describe('construct', () => {
    it('엔티티 공통 계약을 상속한 aggregate root를 반환한다', () => {
      const result = SampleAggregateRoot.create({
        id: 'sample-1',
      });

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value).toBeInstanceOf(AggregateRoot);
        expect(result.value.id).toBe('sample-1');
        expect(result.value.getProps().name).toBe('spring');
      }
    });
  });
});
