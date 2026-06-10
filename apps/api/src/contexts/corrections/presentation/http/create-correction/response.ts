import { type CreateCorrectionResult } from '@contexts/corrections/application/commands/create-correction/create-correction.command';

export class CreateCorrectionHttpResponse {
  correctionId!: CreateCorrectionResult['correctionId'];
}
