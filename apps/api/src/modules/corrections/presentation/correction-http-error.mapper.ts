import { HttpStatus } from '@nestjs/common';
import { type PresentationErrorMapper } from '@libs/layer';
import { type CreateCorrectionError } from '../application/commands/create-correction.error';
import { type CorrectionErrorResponseDto } from './correction-error.response.dto';

export class CorrectionHttpErrorMapper implements PresentationErrorMapper<
  CreateCorrectionError,
  CorrectionErrorResponseDto
> {
  toResponse(error: CreateCorrectionError): CorrectionErrorResponseDto {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  toStatus(error: CreateCorrectionError): number {
    switch (error.kind) {
      case 'validation_failed':
        return HttpStatus.BAD_REQUEST;
      case 'dependency_unavailable':
        return HttpStatus.SERVICE_UNAVAILABLE;
    }
  }
}
