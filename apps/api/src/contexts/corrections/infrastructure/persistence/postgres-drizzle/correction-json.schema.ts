import { z } from 'zod';
import { MISTAKE_TYPES } from '@contexts/corrections/domain';

export const correctionFeedbackJsonSchema = z
  .object({
    inferredIntent: z.string(),
    explanation: z.string(),
  })
  .strict();

export const mistakeJsonSchema = z
  .object({
    types: z.array(z.enum(MISTAKE_TYPES)),
    explanation: z.string(),
  })
  .strict();

export const mistakesJsonSchema = z.array(mistakeJsonSchema);

export const providerMetadataJsonSchema = z.record(z.string(), z.unknown());

export type CorrectionFeedbackJson = z.infer<
  typeof correctionFeedbackJsonSchema
>;
export type MistakeJson = z.infer<typeof mistakeJsonSchema>;
export type ProviderMetadataJson = z.infer<typeof providerMetadataJsonSchema>;
