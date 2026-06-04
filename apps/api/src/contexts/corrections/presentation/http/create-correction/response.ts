import { type CreateCorrectionResult } from '../../../application/commands/create-correction/create-correction.command';

export class CreateCorrectionHttpResponse {
  correctionId!: CreateCorrectionResult['correctionId'];
}
