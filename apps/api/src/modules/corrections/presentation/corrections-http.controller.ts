import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCorrectionCommand } from '../application/commands/create-correction.command';
import { CorrectionHttpErrorMapper } from './correction-http-error.mapper';
import { CreateCorrectionHttpRequest } from './create-correction-http.request';
import { type CreateCorrectionHttpResponse } from './create-correction-http.response';

@Controller('corrections')
export class CorrectionsHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly errorMapper: CorrectionHttpErrorMapper,
  ) {}

  @Post()
  async createCorrection(
    @Body() request: CreateCorrectionHttpRequest,
  ): Promise<CreateCorrectionHttpResponse> {
    const result = await this.commandBus.execute(
      new CreateCorrectionCommand({
        originalText: request.originalText,
        correctedText: request.correctedText,
        feedback: request.feedback,
        mistakes: request.mistakes,
        metadata: request.metadata,
      }),
    );

    return result.match(
      (response) => response,
      (error) => {
        throw this.errorMapper.toException(error);
      },
    );
  }
}
