import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCorrectionCommand } from '../application/commands/create-correction.command';
import { CorrectionHttpErrorMapper } from './correction-http-error.mapper';
import { CreateCorrectionRequestDto } from './create-correction.request.dto';
import { type CreateCorrectionResponseDto } from './create-correction.response.dto';

@Controller('corrections')
export class CorrectionsHttpController {
  private readonly errorMapper = new CorrectionHttpErrorMapper();

  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async createCorrection(
    @Body() request: CreateCorrectionRequestDto,
  ): Promise<CreateCorrectionResponseDto> {
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
        throw new HttpException(
          this.errorMapper.toResponse(error),
          this.errorMapper.toStatus(error),
        );
      },
    );
  }
}
