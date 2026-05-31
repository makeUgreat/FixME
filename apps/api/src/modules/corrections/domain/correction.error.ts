import { type EntityDomainError } from '@libs/ddd';
import { type MistakeType } from './mistake-type.constant';

export type CorrectionDomainError =
  | {
      kind: 'invariant_violation';
      code: 'correction.original_text_empty';
      message: string;
    }
  | {
      kind: 'invariant_violation';
      code: 'correction.corrected_text_empty';
      message: string;
    }
  | {
      kind: 'invariant_violation';
      code: 'correction.feedback_invalid';
      message: string;
    }
  | {
      kind: 'invariant_violation';
      code: 'correction.mistakes_invalid';
      message: string;
    }
  | {
      kind: 'invariant_violation';
      code: 'correction.metadata_invalid';
      message: string;
    }
  | {
      kind: 'invariant_violation';
      code: 'correction.metadata_correction_id_mismatch';
      message: string;
      details: {
        correctionId: string;
        metadataCorrectionId: string;
      };
    }
  | {
      kind: 'invariant_violation';
      code: 'correction.mistakes_empty_for_corrected_text';
      message: string;
      details: {
        originalText: string;
        correctedText: string;
      };
    }
  | EntityDomainError;

export type CorrectionFeedbackDomainError =
  | {
      kind: 'invariant_violation';
      code: 'correction_feedback.inferred_intent_empty';
      message: string;
    }
  | {
      kind: 'invariant_violation';
      code: 'correction_feedback.explanation_empty';
      message: string;
    };

export type MistakeDomainError =
  | {
      kind: 'invariant_violation';
      code: 'mistake.types_empty';
      message: string;
    }
  | {
      kind: 'invariant_violation';
      code: 'mistake.types_invalid';
      message: string;
      details: {
        types: readonly MistakeType[];
      };
    }
  | {
      kind: 'invariant_violation';
      code: 'mistake.explanation_empty';
      message: string;
    };

export type CorrectionMetadataDomainError =
  | {
      kind: 'invariant_violation';
      code: 'correction_metadata.correction_id_empty';
      message: string;
    }
  | {
      kind: 'invariant_violation';
      code: 'correction_metadata.model_empty';
      message: string;
    }
  | {
      kind: 'invariant_violation';
      code: 'correction_metadata.provider_metadata_invalid';
      message: string;
    }
  | EntityDomainError;
