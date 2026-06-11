import { describe, expect, it } from 'vitest';
import { formatRuntimeConfigLog } from '../runtime-config-log';

describe('formatRuntimeConfigLog', () => {
  it('runtime 환경 식별 값을 로그 메시지로 만든다', () => {
    expect(
      formatRuntimeConfigLog({
        appEnv: 'local',
        nodeEnv: 'development',
        correctionPersistence: 'memory',
        port: 3000,
        serverUrl: 'http://127.0.0.1:3000',
      }),
    ).toBe(`
Runtime configuration
---------------------
Environment
  NODE_ENV                 development
  APP_ENV                  local

Server
  URL                      http://127.0.0.1:3000
  PORT                     3000

Adapters
  corrections.persistence  memory`);
  });
});
