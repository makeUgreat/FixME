import { z } from 'zod';
import { emptyStringToUndefined } from '@core/env';

export const CORRECTION_PERSISTENCE_ADAPTERS = [
  'memory',
  'postgres-drizzle',
] as const;

export type CorrectionPersistenceAdapter =
  (typeof CORRECTION_PERSISTENCE_ADAPTERS)[number];

export const DEFAULT_CORRECTION_PERSISTENCE: CorrectionPersistenceAdapter =
  'postgres-drizzle';

export const correctionsEnvSchema = z.object({
  CORRECTION_PERSISTENCE: z.preprocess(
    emptyStringToUndefined,
    z
      .enum(CORRECTION_PERSISTENCE_ADAPTERS)
      .default(DEFAULT_CORRECTION_PERSISTENCE),
  ),
});

export type CorrectionsEnv = z.infer<typeof correctionsEnvSchema>;

export function resolveCorrectionPersistence(
  env: Partial<Record<'CORRECTION_PERSISTENCE', string | undefined>>,
): CorrectionPersistenceAdapter {
  return correctionsEnvSchema.parse(env).CORRECTION_PERSISTENCE;
}
