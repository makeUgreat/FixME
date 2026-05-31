import {
  AggregateRoot,
  err,
  ok,
  type CreateEntityParams,
  type Result,
} from '@libs/ddd';
import {
  type CorrectionDomainError,
  type CorrectionMetadataDomainError,
} from './correction.error';
import { CorrectionFeedback } from './correction-feedback.vo';
import {
  CorrectionMetadata,
  type CreateCorrectionMetadataProps,
} from './correction-metadata.entity';
import { Mistake } from './mistake.vo';

export type CorrectionId = string;

export interface CorrectionProps {
  originalText: string;
  correctedText: string;
  feedback: CorrectionFeedback;
  mistakes: Mistake[];
  metadata: CorrectionMetadata;
}

export interface CreateCorrectionProps {
  id: CorrectionId;
  originalText: string;
  correctedText: string;
  feedback: CorrectionFeedback;
  mistakes: Mistake[];
  metadata: Omit<CreateCorrectionMetadataProps, 'correctionId'>;
}

export class Correction extends AggregateRoot<CorrectionId, CorrectionProps> {
  static create(
    params: CreateCorrectionProps,
  ): Result<Correction, CorrectionDomainError | CorrectionMetadataDomainError> {
    return CorrectionMetadata.create({
      ...params.metadata,
      correctionId: params.id,
    }).andThen((metadata) =>
      super.construct({
        params: {
          id: params.id,
          props: {
            originalText: params.originalText.trim(),
            correctedText: params.correctedText.trim(),
            feedback: params.feedback,
            mistakes: params.mistakes,
            metadata,
          },
        },
        validate: (entityParams) => Correction.validateProps(entityParams),
        instantiate: (entityParams) => new Correction(entityParams),
      }),
    );
  }

  static restore(
    params: CreateEntityParams<CorrectionId, CorrectionProps>,
  ): Result<Correction, CorrectionDomainError> {
    return super.construct({
      params: {
        ...params,
        props: {
          ...params.props,
          originalText: params.props.originalText.trim(),
          correctedText: params.props.correctedText.trim(),
        },
      },
      validate: (entityParams) => Correction.validateProps(entityParams),
      instantiate: (entityParams) => new Correction(entityParams),
    });
  }

  private constructor(
    params: CreateEntityParams<CorrectionId, CorrectionProps>,
  ) {
    super(params);
  }

  private static validateProps(
    params: CreateEntityParams<CorrectionId, CorrectionProps>,
  ): Result<
    CreateEntityParams<CorrectionId, CorrectionProps>,
    CorrectionDomainError
  > {
    return Correction.ensureOriginalTextIsNotEmpty(params.props.originalText)
      .andThen(() =>
        Correction.ensureCorrectedTextIsNotEmpty(params.props.correctedText),
      )
      .andThen(() => Correction.ensureFeedbackIsValid(params.props.feedback))
      .andThen(() => Correction.ensureMistakesAreValid(params.props.mistakes))
      .andThen(() => Correction.ensureMetadataIsValid(params.props.metadata))
      .andThen(() =>
        Correction.ensureMetadataBelongsToCorrection(
          params.id,
          params.props.metadata,
        ),
      )
      .andThen(() =>
        Correction.ensureCorrectedCorrectionHasMistakes(
          params.props.originalText,
          params.props.correctedText,
          params.props.mistakes,
        ),
      )
      .map(() => params);
  }

  private static ensureOriginalTextIsNotEmpty(
    originalText: string,
  ): Result<void, CorrectionDomainError> {
    if (originalText.length === 0) {
      return err({
        kind: 'invariant_violation',
        code: 'correction.original_text_empty',
        message: 'Correction original text cannot be empty',
      });
    }

    return ok(undefined);
  }

  private static ensureCorrectedTextIsNotEmpty(
    correctedText: string,
  ): Result<void, CorrectionDomainError> {
    if (correctedText.length === 0) {
      return err({
        kind: 'invariant_violation',
        code: 'correction.corrected_text_empty',
        message: 'Correction corrected text cannot be empty',
      });
    }

    return ok(undefined);
  }

  private static ensureFeedbackIsValid(
    feedback: unknown,
  ): Result<void, CorrectionDomainError> {
    if (!(feedback instanceof CorrectionFeedback)) {
      return err({
        kind: 'invariant_violation',
        code: 'correction.feedback_invalid',
        message: 'Correction feedback is invalid',
      });
    }

    return ok(undefined);
  }

  private static ensureMetadataIsValid(
    metadata: unknown,
  ): Result<void, CorrectionDomainError> {
    if (!(metadata instanceof CorrectionMetadata)) {
      return err({
        kind: 'invariant_violation',
        code: 'correction.metadata_invalid',
        message: 'Correction metadata is invalid',
      });
    }

    return ok(undefined);
  }

  private static ensureMetadataBelongsToCorrection(
    correctionId: CorrectionId,
    metadata: CorrectionMetadata,
  ): Result<void, CorrectionDomainError> {
    if (metadata.getProps().correctionId !== correctionId) {
      return err({
        kind: 'invariant_violation',
        code: 'correction.metadata_correction_id_mismatch',
        message: 'Correction metadata must belong to the correction',
        details: {
          correctionId,
          metadataCorrectionId: metadata.getProps().correctionId,
        },
      });
    }

    return ok(undefined);
  }

  private static ensureMistakesAreValid(
    mistakes: unknown,
  ): Result<void, CorrectionDomainError> {
    if (
      !Array.isArray(mistakes) ||
      !mistakes.every((mistake) => mistake instanceof Mistake)
    ) {
      return err({
        kind: 'invariant_violation',
        code: 'correction.mistakes_invalid',
        message: 'Correction mistakes are invalid',
      });
    }

    return ok(undefined);
  }

  private static ensureCorrectedCorrectionHasMistakes(
    originalText: string,
    correctedText: string,
    mistakes: Mistake[],
  ): Result<void, CorrectionDomainError> {
    if (originalText !== correctedText && mistakes.length === 0) {
      return err({
        kind: 'invariant_violation',
        code: 'correction.mistakes_empty_for_corrected_text',
        message: 'Correction mistakes cannot be empty when text is corrected',
        details: { originalText, correctedText },
      });
    }

    return ok(undefined);
  }
}
