import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { generateId } from '@libs/id';
import { err, ok, type Result } from '@libs/result';
import { CORRECTION_REPOSITORY } from '../../corrections.tokens';
import {
  Correction,
  CorrectionFeedback,
  type CorrectionRepository,
  Mistake,
} from '../../domain';
import {
  CreateCorrectionCommand,
  type CreateCorrectionResult,
} from './create-correction.command';
import {
  type CreateCorrectionDependencyUnavailableError,
  type CreateCorrectionError,
} from './create-correction.error';
import { CreateCorrectionDomainErrorToApplicationErrorMapper } from './create-correction-error.mapper';

@CommandHandler(CreateCorrectionCommand)
export class CreateCorrectionCommandHandler implements ICommandHandler<CreateCorrectionCommand> {
  constructor(
    @Inject(CORRECTION_REPOSITORY)
    private readonly correctionRepository: CorrectionRepository,
    private readonly domainErrorMapper: CreateCorrectionDomainErrorToApplicationErrorMapper,
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
      (error) =>
        Promise.resolve(err(this.domainErrorMapper.toApplicationError(error))),
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
        try {
          await this.correctionRepository.save(correction);
        } catch {
          return err({
            kind: 'dependency_unavailable',
            code: 'create_correction.persistence_unavailable',
            message: 'Correction could not be saved',
            details: {},
          } satisfies CreateCorrectionDependencyUnavailableError);
        }

        return ok({ correctionId });
      },
      (error) =>
        Promise.resolve(err(this.domainErrorMapper.toApplicationError(error))),
    );
  }
}
