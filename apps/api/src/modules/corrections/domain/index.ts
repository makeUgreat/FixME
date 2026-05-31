export {
  Correction,
  type CorrectionId,
  type CorrectionProps,
  type CreateCorrectionProps,
} from './correction.aggregate';
export type {
  CorrectionDomainError,
  CorrectionFeedbackDomainError,
  CorrectionMetadataDomainError,
  MistakeDomainError,
} from './correction.error';
export { type CorrectionRepository } from './correction.repository.port';
export {
  CorrectionMetadata,
  type CorrectionMetadataId,
  type CorrectionMetadataProps,
  type CreateCorrectionMetadataProps,
} from './correction-metadata.entity';
export {
  CorrectionFeedback,
  type CorrectionFeedbackProps,
  type CreateCorrectionFeedbackProps,
} from './correction-feedback.vo';
export {
  Mistake,
  type CreateMistakeProps,
  type MistakeProps,
} from './mistake.vo';
export {
  isMistakeType,
  MISTAKE_TYPES,
  type MistakeType,
} from './mistake-type.constant';
