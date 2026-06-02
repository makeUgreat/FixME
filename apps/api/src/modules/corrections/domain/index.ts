export {
  Correction,
  type CorrectionId,
  type CorrectionProps,
  type CreateCorrectionProps,
} from './correction.aggregate';
export type { CorrectionDomainError } from './correction.error';
export type { CorrectionFeedbackDomainError } from './correction-feedback.error';
export type { CorrectionMetadataDomainError } from './correction-metadata.error';
export type { MistakeDomainError } from './mistake.error';
export { type CorrectionRepository } from './correction.repository';
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
