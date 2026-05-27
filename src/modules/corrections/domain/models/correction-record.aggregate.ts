import { AggregateRoot, generateId } from '../../../../libs/ddd';

interface CorrectionRecordProps {
  readonly originalSentence: string;
  readonly correctedSentence: string;
  readonly explanation: string;
  readonly mistakes: readonly CorrectionMistakePrimitives[];
}

export interface CorrectionMistakePrimitives {
  readonly originalPart: string;
  readonly correctedPart: string;
  readonly type: string;
  readonly explanation: string;
}

export interface CorrectionRecordPrimitives {
  readonly id: string;
  readonly originalSentence: string;
  readonly correctedSentence: string;
  readonly explanation: string;
  readonly mistakes: readonly CorrectionMistakePrimitives[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateCorrectionRecordProps {
  readonly originalSentence: string;
  readonly correctedSentence: string;
  readonly explanation: string;
  readonly mistakes?: readonly CorrectionMistakePrimitives[];
}

interface RehydrateCorrectionRecordProps extends CreateCorrectionRecordProps {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class CorrectionRecord extends AggregateRoot<CorrectionRecordProps> {
  static create(props: CreateCorrectionRecordProps): CorrectionRecord {
    return new CorrectionRecord({
      id: generateId(),
      props: {
        originalSentence: normalizeRequiredText(
          props.originalSentence,
          'originalSentence',
        ),
        correctedSentence: normalizeRequiredText(
          props.correctedSentence,
          'correctedSentence',
        ),
        explanation: normalizeRequiredText(props.explanation, 'explanation'),
        mistakes: normalizeMistakes(props.mistakes ?? []),
      },
    });
  }

  static rehydrate(props: CorrectionRecordPrimitives): CorrectionRecord {
    return CorrectionRecord.from(props);
  }

  static from(props: RehydrateCorrectionRecordProps): CorrectionRecord {
    return new CorrectionRecord({
      id: normalizeRequiredText(props.id, 'id'),
      props: {
        originalSentence: normalizeRequiredText(
          props.originalSentence,
          'originalSentence',
        ),
        correctedSentence: normalizeRequiredText(
          props.correctedSentence,
          'correctedSentence',
        ),
        explanation: normalizeRequiredText(props.explanation, 'explanation'),
        mistakes: normalizeMistakes(props.mistakes ?? []),
      },
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  get originalSentence(): string {
    return this.props.originalSentence;
  }

  get correctedSentence(): string {
    return this.props.correctedSentence;
  }

  get explanation(): string {
    return this.props.explanation;
  }

  get mistakes(): readonly CorrectionMistakePrimitives[] {
    return this.props.mistakes.map((mistake) => ({ ...mistake }));
  }

  toPrimitives(): CorrectionRecordPrimitives {
    return {
      id: this.id,
      originalSentence: this.originalSentence,
      correctedSentence: this.correctedSentence,
      explanation: this.explanation,
      mistakes: this.mistakes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

function normalizeMistakes(
  mistakes: readonly CorrectionMistakePrimitives[],
): readonly CorrectionMistakePrimitives[] {
  return mistakes.map((mistake) => ({
    originalPart: normalizeRequiredText(mistake.originalPart, 'originalPart'),
    correctedPart: normalizeRequiredText(
      mistake.correctedPart,
      'correctedPart',
    ),
    type: normalizeRequiredText(mistake.type, 'type'),
    explanation: normalizeRequiredText(mistake.explanation, 'explanation'),
  }));
}

function normalizeRequiredText(value: string, fieldName: string): string {
  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    throw new Error(`${fieldName} is required`);
  }

  return normalizedValue;
}
