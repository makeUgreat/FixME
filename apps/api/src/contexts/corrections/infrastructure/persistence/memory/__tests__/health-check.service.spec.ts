import { describe, expect, it } from 'vitest';
import { CorrectionMemoryPersistenceHealthCheck } from '../health-check.service';

describe('CorrectionMemoryPersistenceHealthCheck', () => {
  it('memory persistence는 즉시 healthy로 간주한다', async () => {
    const healthCheck = new CorrectionMemoryPersistenceHealthCheck();

    expect(healthCheck.adapter).toBe('memory');
    const result = await healthCheck.check();

    expect(result.isOk()).toBe(true);
  });
});
