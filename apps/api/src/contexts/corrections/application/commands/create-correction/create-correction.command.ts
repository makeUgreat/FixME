import { type Result } from '@core/result';
import { Command } from '@layer-kernels/application';
import { MISTAKE_TYPES, type CorrectionId, type MistakeType } from '../../../domain';
import { type CreateCorrectionError } from './create-correction.error';

export const CREATE_CORRECTION_MISTAKE_TYPES = MISTAKE_TYPES;

export interface CorrectionFeedbackInput {
  readonly inferredIntent: string;
  readonly explanation: string;
}

export interface CorrectionMistakeInput {
  readonly types: readonly MistakeType[];
  readonly explanation: string;
}

export interface CorrectionMetadataInput {
  readonly model: string;
  readonly providerMetadata: Record<string, unknown>;
}

export interface CreateCorrectionCommandProps {
  readonly originalText: string;
  readonly correctedText: string;
  readonly feedback: CorrectionFeedbackInput;
  readonly mistakes: readonly CorrectionMistakeInput[];
  readonly metadata: CorrectionMetadataInput;
}

export interface CreateCorrectionResult {
  correctionId: CorrectionId;
}

export class CreateCorrectionCommand extends Command<
  Result<CreateCorrectionResult, CreateCorrectionError>
> {
  readonly originalText: string;
  readonly correctedText: string;
  readonly feedback: CorrectionFeedbackInput;
  readonly mistakes: readonly CorrectionMistakeInput[];
  readonly metadata: CorrectionMetadataInput;

  constructor(props: CreateCorrectionCommandProps) {
    super();

    this.originalText = props.originalText;
    this.correctedText = props.correctedText;
    this.feedback = props.feedback;
    this.mistakes = props.mistakes;
    this.metadata = props.metadata;
  }
}
