import { err, ok, type DomainError, type Result, ValueObject } from '@libs/ddd';

export interface CorrectionAnalysisProps {
  inferredIntent: string;
  overallExplanation: string;
}

export type CreateCorrectionAnalysisProps = CorrectionAnalysisProps;

export class CorrectionAnalysis extends ValueObject<CorrectionAnalysisProps> {
  static of(
    props: CreateCorrectionAnalysisProps,
  ): Result<CorrectionAnalysis, DomainError> {
    return super.construct({
      props: {
        inferredIntent: props.inferredIntent.trim(),
        overallExplanation: props.overallExplanation.trim(),
      },
      validate: (analysisProps) =>
        CorrectionAnalysis.validateProps(analysisProps),
      instantiate: (analysisProps) => new CorrectionAnalysis(analysisProps),
    });
  }

  private constructor(props: CorrectionAnalysisProps) {
    super(props);
  }

  private static validateProps(
    props: CorrectionAnalysisProps,
  ): Result<CorrectionAnalysisProps, DomainError> {
    return CorrectionAnalysis.inferredIntentMustNotBeEmpty(props.inferredIntent)
      .andThen(() =>
        CorrectionAnalysis.overallExplanationMustNotBeEmpty(
          props.overallExplanation,
        ),
      )
      .map(() => props);
  }

  private static inferredIntentMustNotBeEmpty(
    inferredIntent: string,
  ): Result<void, DomainError> {
    if (inferredIntent.length === 0) {
      return err({
        kind: 'invariant_violation',
        code: 'correction_analysis.inferred_intent_empty',
        message: 'Correction analysis inferred intent cannot be empty',
      });
    }

    return ok(undefined);
  }

  private static overallExplanationMustNotBeEmpty(
    overallExplanation: string,
  ): Result<void, DomainError> {
    if (overallExplanation.length === 0) {
      return err({
        kind: 'invariant_violation',
        code: 'correction_analysis.overall_explanation_empty',
        message: 'Correction analysis overall explanation cannot be empty',
      });
    }

    return ok(undefined);
  }
}
