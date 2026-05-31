export {
  Correction,
  type CorrectionId,
  type CorrectionProps,
  type CreateCorrectionProps,
} from './correction.aggregate';
export {
  CorrectionGeneration,
  type CorrectionGenerationId,
  type CorrectionGenerationProps,
  type CreateCorrectionGenerationProps,
} from './correction-generation.entity';
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
