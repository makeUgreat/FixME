import { generateId } from '@core/id';
import { err, ok, type Result } from '@core/result';
import { type CommandHandler } from '@layer-kernels/application';
import { type CorrectionRepository } from '../../ports';
import {
  Correction,
  CorrectionFeedback,
  Mistake,
} from '../../../domain';
import {
  CreateCorrectionCommand,
  type CreateCorrectionResult,
} from './create-correction.command';
import { type CreateCorrectionError } from './create-correction.error';
import {
  CreateCorrectionDomainErrorToApplicationErrorMapper,
  CreateCorrectionRepositoryErrorToApplicationErrorMapper,
} from './create-correction-error.mapper';

export class CreateCorrectionCommandHandler
  implements CommandHandler<CreateCorrectionCommand>
{
  constructor(
    private readonly correctionRepository: CorrectionRepository,
    private readonly domainErrorMapper: CreateCorrectionDomainErrorToApplicationErrorMapper,
    private readonly repositoryErrorMapper: CreateCorrectionRepositoryErrorToApplicationErrorMapper,
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
        const saveResult = await this.correctionRepository.save(correction);

        return saveResult.match(
          () => ok({ correctionId }),
          (error) => err(this.repositoryErrorMapper.toApplication(error)),
        );
      },
      (error) =>
        Promise.resolve(err(this.domainErrorMapper.toApplicationError(error))),
    );
  }
}
