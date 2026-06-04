import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCorrectionCommand } from '../../application/commands/create-correction/create-correction.command';
import { CreateCorrectionHttpErrorMapper } from './create-correction/error.mapper';
import { CreateCorrectionHttpRequest } from './create-correction/request';
import { type CreateCorrectionHttpResponse } from './create-correction/response';

@Controller('corrections')
export class CorrectionsHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly errorMapper: CreateCorrectionHttpErrorMapper,
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
