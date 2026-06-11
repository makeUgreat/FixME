export interface RuntimeConfigLogValues {
  readonly appEnv: string;
  readonly nodeEnv: string;
  readonly correctionPersistence: string;
  readonly port: number;
  readonly serverUrl: string;
}

export function formatRuntimeConfigLog(
  values: RuntimeConfigLogValues,
): string {
  return [
    '',
    'Runtime configuration',
    '---------------------',
    'Environment',
    formatRuntimeSetting('NODE_ENV', values.nodeEnv),
    formatRuntimeSetting('APP_ENV', values.appEnv),
    '',
    'Server',
    formatRuntimeSetting('URL', values.serverUrl),
    formatRuntimeSetting('PORT', values.port),
    '',
    'Adapters',
    formatRuntimeSetting(
      'corrections.persistence',
      values.correctionPersistence,
    ),
  ].join('\n');
}

function formatRuntimeSetting(label: string, value: string | number): string {
  return `  ${label.padEnd(24)} ${String(value)}`;
}
