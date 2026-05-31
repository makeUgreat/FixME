import { err, ok, type Result, ValueObject } from '@libs/ddd';
import { type MistakeDomainError } from './correction.error';
import { areMistakeTypes, type MistakeType } from './mistake-type.constant';

export interface MistakeProps {
  types: MistakeType[];
  explanation: string;
}

export interface CreateMistakeProps {
  readonly types: readonly MistakeType[];
  readonly explanation: string;
}

export class Mistake extends ValueObject<MistakeProps> {
  static of(props: CreateMistakeProps): Result<Mistake, MistakeDomainError> {
    const mistakeProps: MistakeProps = {
      types: [...props.types],
      explanation: props.explanation.trim(),
    };

    return super.construct({
      props: mistakeProps,
      validate: (mistakeProps) => Mistake.validateProps(mistakeProps),
      instantiate: (mistakeProps) => new Mistake(mistakeProps),
    });
  }

  static createMany(
    propsList: readonly CreateMistakeProps[],
  ): Result<Mistake[], MistakeDomainError> {
    return propsList.reduce<Result<Mistake[], MistakeDomainError>>(
      (result, props) =>
        result.andThen((mistakes) =>
          Mistake.of(props).map((mistake) => [...mistakes, mistake]),
        ),
      ok([]),
    );
  }

  private constructor(props: MistakeProps) {
    super(props);
  }

  private static validateProps(
    props: MistakeProps,
  ): Result<MistakeProps, MistakeDomainError> {
    return Mistake.typesMustNotBeEmpty(props.types)
      .andThen(() => Mistake.typesMustBeKnown(props.types))
      .andThen(() => Mistake.explanationMustNotBeEmpty(props.explanation))
      .map(() => props);
  }

  private static typesMustNotBeEmpty(
    types: MistakeType[],
  ): Result<void, MistakeDomainError> {
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
  ): Result<void, MistakeDomainError> {
    if (!areMistakeTypes(types)) {
      return err({
        kind: 'invariant_violation',
        code: 'mistake.types_invalid',
        message: 'Mistake types are invalid',
        details: { types },
      });
    }

    return ok(undefined);
  }

  private static explanationMustNotBeEmpty(
    explanation: string,
  ): Result<void, MistakeDomainError> {
    if (explanation.length === 0) {
      return err({
        kind: 'invariant_violation',
        code: 'mistake.explanation_empty',
        message: 'Mistake explanation cannot be empty',
      });
    }

    return ok(undefined);
  }
}
