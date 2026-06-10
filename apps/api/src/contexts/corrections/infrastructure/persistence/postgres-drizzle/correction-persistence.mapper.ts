import {
  INFRASTRUCTURE_ERROR_KIND,
  PersistenceAggregateMapper,
} from '@layer-kernels/infrastructure';
import { type Result } from '@core/result';
import {
  Correction,
  CorrectionFeedback,
  CorrectionMetadata,
  Mistake,
  type CorrectionProps,
} from '@contexts/corrections/domain';
import {
  correctionFeedbackJsonSchema,
  mistakesJsonSchema,
  providerMetadataJsonSchema,
  type CorrectionFeedbackJson,
  type MistakeJson,
  type ProviderMetadataJson,
} from './correction-json.schema';
import {
  type CorrectionPersistenceError,
  type CorrectionPersistenceRestoreError,
} from './correction-persistence.error';
import {
  type CorrectionRow,
  type InsertCorrectionRow,
} from './correction.table';

export class CorrectionPersistenceMapper extends PersistenceAggregateMapper<
  Correction,
  CorrectionRow,
  InsertCorrectionRow,
  CorrectionPersistenceRestoreError
> {
  override toPersistence(correction: Correction): InsertCorrectionRow {
    const props = correction.getProps();
    const metadata = props.metadata.getProps();

    return {
      id: correction.id,
      originalText: props.originalText,
      correctedText: props.correctedText,
      feedback: props.feedback.value,
      mistakes: props.mistakes.map((mistake) => mistake.value),
      metadataId: metadata.id,
      model: metadata.model,
      providerMetadata: metadata.providerMetadata,
      createdAt: correction.createdAt,
      updatedAt: correction.updatedAt,
      metadataCreatedAt: metadata.createdAt,
      metadataUpdatedAt: metadata.updatedAt,
    };
  }

  override toAggregate(
    row: CorrectionRow,
  ): Result<Correction, CorrectionPersistenceRestoreError> {
    return this.toFeedback(row.feedback)
      .andThen((feedback) =>
        this.toMistakes(row.mistakes).map((mistakes) => ({
          feedback,
          mistakes,
        })),
      )
      .andThen(({ feedback, mistakes }) =>
        this.toMetadata(row).map((metadata) => ({
          feedback,
          mistakes,
          metadata,
        })),
      )
      .andThen(({ feedback, mistakes, metadata }) =>
        Correction.restore({
          id: row.id,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          props: {
            originalText: row.originalText,
            correctedText: row.correctedText,
            feedback,
            mistakes,
            metadata,
          } satisfies CorrectionProps,
        }),
      );
  }

  private toFeedback(
    value: unknown,
  ): Result<CorrectionFeedback, CorrectionPersistenceRestoreError> {
    return this.parseFeedbackJson(value).andThen((feedback) =>
      CorrectionFeedback.of(feedback),
    );
  }

  private toMistakes(
    value: unknown,
  ): Result<Mistake[], CorrectionPersistenceRestoreError> {
    return this.parseMistakesJson(value).andThen((mistakes) =>
      Mistake.createMany(mistakes),
    );
  }

  private toMetadata(
    row: CorrectionRow,
  ): Result<CorrectionMetadata, CorrectionPersistenceRestoreError> {
    return this.parseProviderMetadataJson(row.providerMetadata).andThen(
      (providerMetadata) =>
        CorrectionMetadata.restore({
          id: row.metadataId,
          createdAt: row.metadataCreatedAt,
          updatedAt: row.metadataUpdatedAt,
          props: {
            correctionId: row.id,
            model: row.model,
            providerMetadata,
          },
        }),
    );
  }

  private parseFeedbackJson(
    value: unknown,
  ): Result<CorrectionFeedbackJson, CorrectionPersistenceError> {
    return this.parsePersistenceValue(
      correctionFeedbackJsonSchema,
      value,
      () => ({
        kind: INFRASTRUCTURE_ERROR_KIND.INVALID_DATA,
        code: 'correction_persistence.feedback_json_invalid',
        source: {
          boundary: 'persistence',
          adapter: 'postgres_drizzle',
        },
        message: 'Correction persistence JSON shape is invalid',
        details: { fields: ['feedback'] },
      }),
    );
  }

  private parseMistakesJson(
    value: unknown,
  ): Result<MistakeJson[], CorrectionPersistenceError> {
    return this.parsePersistenceValue(mistakesJsonSchema, value, () => ({
      kind: INFRASTRUCTURE_ERROR_KIND.INVALID_DATA,
      code: 'correction_persistence.mistakes_json_invalid',
      source: {
        boundary: 'persistence',
        adapter: 'postgres_drizzle',
      },
      message: 'Correction persistence JSON shape is invalid',
      details: { fields: ['mistakes'] },
    }));
  }

  private parseProviderMetadataJson(
    value: unknown,
  ): Result<ProviderMetadataJson, CorrectionPersistenceError> {
    return this.parsePersistenceValue(
      providerMetadataJsonSchema,
      value,
      () => ({
        kind: INFRASTRUCTURE_ERROR_KIND.INVALID_DATA,
        code: 'correction_persistence.provider_metadata_json_invalid',
        source: {
          boundary: 'persistence',
          adapter: 'postgres_drizzle',
        },
        message: 'Correction persistence JSON shape is invalid',
        details: { fields: ['providerMetadata'] },
      }),
    );
  }
}
