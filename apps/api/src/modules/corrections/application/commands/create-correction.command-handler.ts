import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { err, generateId, ok, type Result } from '@libs/ddd';
import { CORRECTION_REPOSITORY } from '../../corrections.tokens';
import {
  Correction,
  CorrectionFeedback,
  type CorrectionRepository,
  Mistake,
} from '../../domain';
import {
  CreateCorrectionCommand,
  type CreateCorrectionError,
  type CreateCorrectionResult,
} from './create-correction.command';

@CommandHandler(CreateCorrectionCommand)
export class CreateCorrectionCommandHandler implements ICommandHandler<CreateCorrectionCommand> {
  constructor(
    @Inject(CORRECTION_REPOSITORY)
    private readonly correctionRepository: CorrectionRepository,
  ) {}

  async execute(
    command: CreateCorrectionCommand,
  ): Promise<Result<CreateCorrectionResult, CreateCorrectionError>> {
    const result = CorrectionFeedback.of(command.feedback).andThen((feedback) =>
      Mistake.createMany(command.mistakes).map((mistakes) => ({
        feedback,
        mistakes,
      })),
    );

    return result.match(
      ({ feedback, mistakes }) =>
        this.createAndSaveCorrection(command, feedback, mistakes),
      (error) => Promise.resolve(err(error)),
    );
  }

  private async createAndSaveCorrection(
    command: CreateCorrectionCommand,
    feedback: CorrectionFeedback,
    mistakes: Mistake[],
  ): Promise<Result<CreateCorrectionResult, CreateCorrectionError>> {
    const correctionId = generateId();

    return Correction.create({
      id: correctionId,
      originalText: command.originalText,
      correctedText: command.correctedText,
      feedback,
      mistakes,
      metadata: {
        id: generateId(),
        model: command.metadata.model,
        providerMetadata: command.metadata.providerMetadata,
      },
    }).match(
      async (correction) => {
        await this.correctionRepository.save(correction);

        return ok({ correctionId });
      },
      (error) => Promise.resolve(err(error)),
    );
  }
}
