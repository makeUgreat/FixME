import {
  AggregateRoot,
  err,
  ok,
  type CreateEntityParams,
  type DomainError,
  type Result,
} from '@libs/ddd';
import { CorrectionFeedback } from './correction-feedback.vo';
import { Mistake } from './mistake.vo';

export type CorrectionId = string;

export interface CorrectionProps {
  originalText: string;
  correctedText: string;
  feedback: CorrectionFeedback;
  mistakes: Mistake[];
}

export interface CreateCorrectionProps {
  id: CorrectionId;
  originalText: string;
  correctedText: string;
  feedback: CorrectionFeedback;
  mistakes: Mistake[];
}

export class Correction extends AggregateRoot<CorrectionId, CorrectionProps> {
  static create(
    params: CreateCorrectionProps,
  ): Result<Correction, DomainError> {
    return super.construct({
      params: {
        id: params.id,
        props: {
          originalText: params.originalText.trim(),
          correctedText: params.correctedText.trim(),
          feedback: params.feedback,
          mistakes: params.mistakes,
        },
      },
      validate: (entityParams) => Correction.validateProps(entityParams),
      instantiate: (entityParams) => new Correction(entityParams),
    });
  }

  static restore(
    params: CreateEntityParams<CorrectionId, CorrectionProps>,
  ): Result<Correction, DomainError> {
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
  ): Result<CreateEntityParams<CorrectionId, CorrectionProps>, DomainError> {
    return Correction.ensureOriginalTextIsNotEmpty(params.props.originalText)
      .andThen(() =>
        Correction.ensureCorrectedTextIsNotEmpty(params.props.correctedText),
      )
      .andThen(() => Correction.ensureFeedbackIsValid(params.props.feedback))
      .andThen(() => Correction.ensureMistakesAreValid(params.props.mistakes))
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
  ): Result<void, DomainError> {
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
  ): Result<void, DomainError> {
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
    feedback: CorrectionFeedback,
  ): Result<void, DomainError> {
    if (!(feedback instanceof CorrectionFeedback)) {
      return err({
        kind: 'invariant_violation',
        code: 'correction.feedback_invalid',
        message: 'Correction feedback is invalid',
      });
    }

    return ok(undefined);
  }

  private static ensureMistakesAreValid(
    mistakes: Mistake[],
  ): Result<void, DomainError> {
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
  ): Result<void, DomainError> {
    if (originalText !== correctedText && mistakes.length === 0) {
      return err({
        kind: 'invariant_violation',
        code: 'correction.mistakes_empty_for_corrected_text',
        message: 'Correction mistakes cannot be empty when text is corrected',
      });
    }

    return ok(undefined);
  }
}
