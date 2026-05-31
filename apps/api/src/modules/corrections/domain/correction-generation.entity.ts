import {
  Entity,
  err,
  ok,
  type CreateEntityParams,
  type DomainError,
  type Result,
} from '@libs/ddd';
import { type CorrectionId } from './correction.aggregate';

export type CorrectionGenerationId = string;

export interface CorrectionGenerationProps {
  correctionId: CorrectionId;
  model: string;
  metadata: Record<string, unknown>;
}

export interface CreateCorrectionGenerationProps {
  id: CorrectionGenerationId;
  correctionId: CorrectionId;
  model: string;
  metadata: Record<string, unknown>;
}

export class CorrectionGeneration extends Entity<
  CorrectionGenerationId,
  CorrectionGenerationProps
> {
  static create(
    params: CreateCorrectionGenerationProps,
  ): Result<CorrectionGeneration, DomainError> {
    return super.construct({
      params: {
        id: params.id,
        props: {
          correctionId: params.correctionId.trim(),
          model: params.model.trim(),
          metadata: params.metadata,
        },
      },
      validate: (entityParams) =>
        CorrectionGeneration.validateProps(entityParams),
      instantiate: (entityParams) => new CorrectionGeneration(entityParams),
    });
  }

  static restore(
    params: CreateEntityParams<
      CorrectionGenerationId,
      CorrectionGenerationProps
    >,
  ): Result<CorrectionGeneration, DomainError> {
    return super.construct({
      params: {
        ...params,
        props: {
          ...params.props,
          correctionId: params.props.correctionId.trim(),
          model: params.props.model.trim(),
        },
      },
      validate: (entityParams) =>
        CorrectionGeneration.validateProps(entityParams),
      instantiate: (entityParams) => new CorrectionGeneration(entityParams),
    });
  }

  private constructor(
    params: CreateEntityParams<
      CorrectionGenerationId,
      CorrectionGenerationProps
    >,
  ) {
    super(params);
  }

  private static validateProps(
    params: CreateEntityParams<
      CorrectionGenerationId,
      CorrectionGenerationProps
    >,
  ): Result<
    CreateEntityParams<CorrectionGenerationId, CorrectionGenerationProps>,
    DomainError
  > {
    return CorrectionGeneration.ensureCorrectionIdIsNotEmpty(
      params.props.correctionId,
    )
      .andThen(() =>
        CorrectionGeneration.ensureModelIsNotEmpty(params.props.model),
      )
      .andThen(() =>
        CorrectionGeneration.ensureMetadataIsPlainObject(params.props.metadata),
      )
      .map(() => params);
  }

  private static ensureCorrectionIdIsNotEmpty(
    correctionId: CorrectionId,
  ): Result<void, DomainError> {
    if (correctionId.length === 0) {
      return err({
        kind: 'invariant_violation',
        code: 'correction_generation.correction_id_empty',
        message: 'Correction generation correction ID cannot be empty',
      });
    }

    return ok(undefined);
  }

  private static ensureModelIsNotEmpty(
    model: string,
  ): Result<void, DomainError> {
    if (model.length === 0) {
      return err({
        kind: 'invariant_violation',
        code: 'correction_generation.model_empty',
        message: 'Correction generation model cannot be empty',
      });
    }

    return ok(undefined);
  }

  private static ensureMetadataIsPlainObject(
    metadata: Record<string, unknown>,
  ): Result<void, DomainError> {
    if (!CorrectionGeneration.isPlainObject(metadata)) {
      return err({
        kind: 'invariant_violation',
        code: 'correction_generation.metadata_invalid',
        message: 'Correction generation metadata must be a plain object',
      });
    }

    return ok(undefined);
  }

  private static isPlainObject(
    value: unknown,
  ): value is Record<string, unknown> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }

    const prototype = Object.getPrototypeOf(value) as object | null;

    return prototype === Object.prototype || prototype === null;
  }
}
