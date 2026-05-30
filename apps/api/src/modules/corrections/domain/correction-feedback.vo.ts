import { err, ok, type DomainError, type Result, ValueObject } from '@libs/ddd';

export interface CorrectionFeedbackProps {
  inferredIntent: string;
  explanation: string;
}

export type CreateCorrectionFeedbackProps = CorrectionFeedbackProps;

export class CorrectionFeedback extends ValueObject<CorrectionFeedbackProps> {
  static of(
    props: CreateCorrectionFeedbackProps,
  ): Result<CorrectionFeedback, DomainError> {
    return super.construct({
      props: {
        inferredIntent: props.inferredIntent.trim(),
        explanation: props.explanation.trim(),
      },
      validate: (feedbackProps) =>
        CorrectionFeedback.validateProps(feedbackProps),
      instantiate: (feedbackProps) => new CorrectionFeedback(feedbackProps),
    });
  }

  private constructor(props: CorrectionFeedbackProps) {
    super(props);
  }

  private static validateProps(
    props: CorrectionFeedbackProps,
  ): Result<CorrectionFeedbackProps, DomainError> {
    return CorrectionFeedback.inferredIntentMustNotBeEmpty(props.inferredIntent)
      .andThen(() =>
        CorrectionFeedback.explanationMustNotBeEmpty(props.explanation),
      )
      .map(() => props);
  }

  private static inferredIntentMustNotBeEmpty(
    inferredIntent: string,
  ): Result<void, DomainError> {
    if (inferredIntent.length === 0) {
      return err({
        kind: 'invariant_violation',
        code: 'correction_feedback.inferred_intent_empty',
        message: 'Correction feedback inferred intent cannot be empty',
      });
    }

    return ok(undefined);
  }

  private static explanationMustNotBeEmpty(
    explanation: string,
  ): Result<void, DomainError> {
    if (explanation.length === 0) {
      return err({
        kind: 'invariant_violation',
        code: 'correction_feedback.explanation_empty',
        message: 'Correction feedback explanation cannot be empty',
      });
    }

    return ok(undefined);
  }
}
