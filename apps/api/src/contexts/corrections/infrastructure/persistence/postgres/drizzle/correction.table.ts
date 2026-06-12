import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import {
  type CorrectionFeedbackJson,
  type MistakeJson,
  type ProviderMetadataJson,
} from './correction-json.schema';
import { correctionsPostgresContext } from '../postgres-resources';

export const corrections = pgTable(
  correctionsPostgresContext.tableNames.corrections,
  {
    id: text('id').primaryKey(),
    originalText: text('original_text').notNull(),
    correctedText: text('corrected_text').notNull(),
    feedback: jsonb('feedback').$type<CorrectionFeedbackJson>().notNull(),
    mistakes: jsonb('mistakes').$type<MistakeJson[]>().notNull(),
    metadataId: text('metadata_id').notNull(),
    model: text('model').notNull(),
    providerMetadata: jsonb('provider_metadata')
      .$type<ProviderMetadataJson>()
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
    metadataCreatedAt: timestamp('metadata_created_at', {
      withTimezone: true,
    }).notNull(),
    metadataUpdatedAt: timestamp('metadata_updated_at', {
      withTimezone: true,
    }).notNull(),
  },
);

export type CorrectionRow = typeof corrections.$inferSelect;
export type InsertCorrectionRow = typeof corrections.$inferInsert;
