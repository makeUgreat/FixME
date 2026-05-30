import { err, ok, type DomainError, type Result, ValueObject } from '@libs/ddd';
import { areMistakeTypes, type MistakeType } from './mistake-type.constant';

export interface MistakeProps {
  types: MistakeType[];
  explanation: string;
  originalFragment?: string;
  correctedFragment?: string;
}

export type CreateMistakeProps = MistakeProps;

export class Mistake extends ValueObject<MistakeProps> {
  static of(props: CreateMistakeProps): Result<Mistake, DomainError> {
    const mistakeProps: MistakeProps = {
      types: props.types,
      explanation: props.explanation.trim(),
      originalFragment: Mistake.normalizeOptionalText(props.originalFragment),
      correctedFragment: Mistake.normalizeOptionalText(props.correctedFragment),
    };

    return super.construct({
      props: mistakeProps,
      validate: (mistakeProps) => Mistake.validateProps(mistakeProps),
      instantiate: (mistakeProps) => new Mistake(mistakeProps),
    });
  }

  private constructor(props: MistakeProps) {
    super(props);
  }

  private static validateProps(
    props: MistakeProps,
  ): Result<MistakeProps, DomainError> {
    return Mistake.typesMustNotBeEmpty(props.types)
      .andThen(() => Mistake.typesMustBeKnown(props.types))
      .andThen(() => Mistake.explanationMustNotBeEmpty(props.explanation))
      .map(() => props);
  }

  private static typesMustNotBeEmpty(
    types: MistakeType[],
  ): Result<void, DomainError> {
    if (!Array.isArray(types) || types.length === 0) {
      return err({
        kind: 'invariant_violation',
        code: 'mistake.types_empty',
        message: 'Mistake types cannot be empty',
      });
    }

    return ok(undefined);
  }

  private static typesMustBeKnown(
    types: MistakeType[],
  ): Result<void, DomainError> {
    if (!areMistakeTypes(types)) {
      return err({
        kind: 'invariant_violation',
        code: 'mistake.types_invalid',
        message: 'Mistake types are invalid',
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
        code: 'mistake.explanation_empty',
        message: 'Mistake explanation cannot be empty',
      });
    }

    return ok(undefined);
  }

  private static normalizeOptionalText(
    value: string | undefined,
  ): string | undefined {
    const normalized = value?.trim();

    return normalized && normalized.length > 0 ? normalized : undefined;
  }
}
