import { type InfrastructureErrorOf } from '@layer-kernels/infrastructure';

type EmptyCorrectionPersistenceHealthCheckErrorDetails = Record<string, never>;

type CorrectionPersistenceHealthCheckErrorSource = {
  readonly boundary: 'persistence';
  readonly adapter: string;
};

export type CorrectionPersistenceHealthCheckUnavailableError =
  InfrastructureErrorOf<
    'unavailable',
    'correction_persistence_health_check',
    'unavailable',
    EmptyCorrectionPersistenceHealthCheckErrorDetails,
    CorrectionPersistenceHealthCheckErrorSource
  >;

export type CorrectionPersistenceHealthCheckTimeoutError =
  InfrastructureErrorOf<
    'timeout',
    'correction_persistence_health_check',
    'timeout',
    EmptyCorrectionPersistenceHealthCheckErrorDetails,
    CorrectionPersistenceHealthCheckErrorSource
  >;

export type CorrectionPersistenceHealthCheckUnexpectedError =
  InfrastructureErrorOf<
    'unexpected',
    'correction_persistence_health_check',
    'unexpected',
    EmptyCorrectionPersistenceHealthCheckErrorDetails,
    CorrectionPersistenceHealthCheckErrorSource
  >;

export type CorrectionPersistenceHealthCheckError =
  | CorrectionPersistenceHealthCheckUnavailableError
  | CorrectionPersistenceHealthCheckTimeoutError
  | CorrectionPersistenceHealthCheckUnexpectedError;
