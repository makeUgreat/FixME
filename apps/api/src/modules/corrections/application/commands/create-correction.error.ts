export type CreateCorrectionValidationFailedCode =
  'create_correction.validation_failed';

export interface CreateCorrectionValidationFailedDetails {
  readonly domainCode: string;
  readonly domainDetails: unknown;
}

export interface CreateCorrectionValidationFailedError {
  readonly kind: 'validation_failed';
  readonly code: CreateCorrectionValidationFailedCode;
  readonly message: string;
  readonly details: CreateCorrectionValidationFailedDetails;
}

export interface CreateCorrectionDependencyUnavailableError {
  readonly kind: 'dependency_unavailable';
  readonly code: 'create_correction.persistence_unavailable';
  readonly message: string;
  readonly details: unknown;
}

export type CreateCorrectionError =
  | CreateCorrectionValidationFailedError
  | CreateCorrectionDependencyUnavailableError;
