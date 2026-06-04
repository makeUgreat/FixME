import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  CORRECTIONS_COMMAND_BUS,
  type CorrectionsCommandBus,
} from '../../application/command-bus.token';
import { CreateCorrectionCommand } from '../../application/commands/create-correction/create-correction.command';
import { CreateCorrectionHttpErrorMapper } from './create-correction/error.mapper';
import { CreateCorrectionHttpRequest } from './create-correction/request';
import { type CreateCorrectionHttpResponse } from './create-correction/response';

@Controller('corrections')
export class CorrectionsHttpController {
  constructor(
    @Inject(CORRECTIONS_COMMAND_BUS)
    private readonly commandBus: CorrectionsCommandBus,
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
