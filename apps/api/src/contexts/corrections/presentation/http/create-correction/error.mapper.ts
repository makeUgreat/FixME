import { type ValidationFailedDetails } from '@layer-kernels/application';
import {
  type CreateCorrectionDomainError,
  type CreateCorrectionError,
} from '@contexts/corrections/application/commands/create-correction/create-correction.error';
import { PresentationHttpErrorMapper } from '../error-mapper.base';

const PUBLIC_VALIDATION_MESSAGE_BY_PATH = {
  originalText: 'Original text is required',
  correctedText: 'Corrected text is required',
  feedback: 'Feedback is invalid',
  'feedback.inferredIntent': 'Feedback inferred intent is required',
  'feedback.explanation': 'Feedback explanation is required',
  mistakes: 'Mistakes are invalid',
  'mistakes.types': 'Mistake types are invalid',
  'mistakes.explanation': 'Mistake explanation is required',
  metadata: 'Metadata is invalid',
  'metadata.correctionId': 'Correction metadata is invalid',
  'metadata.model': 'Correction model is required',
  'metadata.providerMetadata': 'Provider metadata is invalid',
} as const satisfies Record<string, string>;

type PublicValidationPath = keyof typeof PUBLIC_VALIDATION_MESSAGE_BY_PATH;
type PublicValidationField = ValidationFailedDetails['fields'][number];

export class CreateCorrectionHttpErrorMapper extends PresentationHttpErrorMapper<CreateCorrectionError> {
  protected override toDetails(
    error: CreateCorrectionError,
  ): ValidationFailedDetails | undefined {
    if (error.kind !== 'invariant_violation') {
      return undefined;
    }

    return this.toValidationDetails(error);
  }

  private toValidationDetails(
    error: CreateCorrectionDomainError,
  ): ValidationFailedDetails | undefined {
    const fields = this.toPublicFields(error);

    return fields.length > 0 ? { fields } : undefined;
  }

  private toPublicFields(
    error: CreateCorrectionDomainError,
  ): ValidationFailedDetails['fields'] {
    const paths = error.details.fields.flatMap((field) => {
      const path = this.toPublicPath(this.toRequestPath(error, field));

      return path ? [path] : [];
    });

    return paths.map((path) => this.toPublicField(path, paths));
  }

  private toPublicField(
    path: PublicValidationPath,
    paths: readonly PublicValidationPath[],
  ): PublicValidationField {
    return {
      path,
      messages: [this.toPublicMessage(path, paths)],
    };
  }

  private toPublicMessage(
    path: PublicValidationPath,
    paths: readonly PublicValidationPath[],
  ): string {
    if (
      (path === 'correctedText' || path === 'mistakes') &&
      paths.includes('correctedText') &&
      paths.includes('mistakes')
    ) {
      return 'Correction mistakes are required when text is corrected';
    }

    return PUBLIC_VALIDATION_MESSAGE_BY_PATH[path];
  }

  private toRequestPath(
    error: CreateCorrectionDomainError,
    field: string,
  ): string {
    switch (error.code) {
      case 'correction_feedback.inferred_intent_empty':
      case 'correction_feedback.explanation_empty':
        return `feedback.${field}`;
      case 'mistake.types_empty':
      case 'mistake.types_invalid':
      case 'mistake.explanation_empty':
        return `mistakes.${field}`;
      case 'correction_metadata.correction_id_empty':
      case 'correction_metadata.model_empty':
      case 'correction_metadata.provider_metadata_invalid':
        return `metadata.${field}`;
      default:
        return field;
    }
  }

  private toPublicPath(path: string): PublicValidationPath | undefined {
    return this.isPublicValidationPath(path) ? path : undefined;
  }

  private isPublicValidationPath(path: string): path is PublicValidationPath {
    return path in PUBLIC_VALIDATION_MESSAGE_BY_PATH;
  }
}
