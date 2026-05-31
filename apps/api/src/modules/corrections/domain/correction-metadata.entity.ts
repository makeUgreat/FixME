import {
  Entity,
  err,
  ok,
  type CreateEntityParams,
  type Result,
} from '@libs/ddd';
import { type CorrectionMetadataDomainError } from './correction.error';

export type CorrectionMetadataId = string;

export interface CorrectionMetadataProps {
  correctionId: string;
  model: string;
  providerMetadata: Record<string, unknown>;
}

export interface CreateCorrectionMetadataProps {
  id: CorrectionMetadataId;
  correctionId: string;
  model: string;
  providerMetadata: Record<string, unknown>;
}

export class CorrectionMetadata extends Entity<
  CorrectionMetadataId,
  CorrectionMetadataProps
> {
  static create(
    params: CreateCorrectionMetadataProps,
  ): Result<CorrectionMetadata, CorrectionMetadataDomainError> {
    return super.construct({
      params: {
        id: params.id,
        props: {
          correctionId: params.correctionId.trim(),
          model: params.model.trim(),
          providerMetadata: params.providerMetadata,
        },
      },
      validate: (entityParams) =>
        CorrectionMetadata.validateProps(entityParams),
      instantiate: (entityParams) => new CorrectionMetadata(entityParams),
    });
  }

  static restore(
    params: CreateEntityParams<CorrectionMetadataId, CorrectionMetadataProps>,
  ): Result<CorrectionMetadata, CorrectionMetadataDomainError> {
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
        CorrectionMetadata.validateProps(entityParams),
      instantiate: (entityParams) => new CorrectionMetadata(entityParams),
    });
  }

  private constructor(
    params: CreateEntityParams<CorrectionMetadataId, CorrectionMetadataProps>,
  ) {
    super(params);
  }

  private static validateProps(
    params: CreateEntityParams<CorrectionMetadataId, CorrectionMetadataProps>,
  ): Result<
    CreateEntityParams<CorrectionMetadataId, CorrectionMetadataProps>,
    CorrectionMetadataDomainError
  > {
    return CorrectionMetadata.ensureCorrectionIdIsNotEmpty(
      params.props.correctionId,
    )
      .andThen(() =>
        CorrectionMetadata.ensureModelIsNotEmpty(params.props.model),
      )
      .andThen(() =>
        CorrectionMetadata.ensureProviderMetadataIsPlainObject(
          params.props.providerMetadata,
        ),
      )
      .map(() => params);
  }

  private static ensureCorrectionIdIsNotEmpty(
    correctionId: string,
  ): Result<void, CorrectionMetadataDomainError> {
    if (correctionId.length === 0) {
      return err({
        kind: 'invariant_violation',
        code: 'correction_metadata.correction_id_empty',
        message: 'Correction metadata correction ID cannot be empty',
      });
    }

    return ok(undefined);
  }

  private static ensureModelIsNotEmpty(
    model: string,
  ): Result<void, CorrectionMetadataDomainError> {
    if (model.length === 0) {
      return err({
        kind: 'invariant_violation',
        code: 'correction_metadata.model_empty',
        message: 'Correction metadata model cannot be empty',
      });
    }

    return ok(undefined);
  }

  private static ensureProviderMetadataIsPlainObject(
    providerMetadata: Record<string, unknown>,
  ): Result<void, CorrectionMetadataDomainError> {
    if (!CorrectionMetadata.isPlainObject(providerMetadata)) {
      return err({
        kind: 'invariant_violation',
        code: 'correction_metadata.provider_metadata_invalid',
        message: 'Correction metadata provider metadata must be a plain object',
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
