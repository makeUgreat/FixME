import {
  INFRASTRUCTURE_ERROR_KIND,
  type InfrastructureErrorBase,
  type InfrastructureErrorCode,
  type InfrastructureErrorKind,
  type InfrastructureErrorSource,
} from '../error.base';

export const PERSISTENCE_ERROR_KIND = {
  UNAVAILABLE: INFRASTRUCTURE_ERROR_KIND.UNAVAILABLE,
  TIMEOUT: INFRASTRUCTURE_ERROR_KIND.TIMEOUT,
  CONFLICT: INFRASTRUCTURE_ERROR_KIND.CONFLICT,
  INVALID_DATA: INFRASTRUCTURE_ERROR_KIND.INVALID_DATA,
  RESTORE_FAILED: INFRASTRUCTURE_ERROR_KIND.RESTORE_FAILED,
  UNEXPECTED: INFRASTRUCTURE_ERROR_KIND.UNEXPECTED,
} as const satisfies Record<string, InfrastructureErrorKind>;

export type PersistenceErrorKind =
  (typeof PERSISTENCE_ERROR_KIND)[keyof typeof PERSISTENCE_ERROR_KIND];

export interface PersistenceErrorSource extends InfrastructureErrorSource {}

export interface PersistenceErrorBase<
  Kind extends PersistenceErrorKind = PersistenceErrorKind,
  Code extends string = string,
  Details = unknown,
  Source extends PersistenceErrorSource = PersistenceErrorSource,
> extends InfrastructureErrorBase<Kind, Code, Details, Source> {}

export type PersistenceErrorOf<
  Kind extends PersistenceErrorKind,
  Owner extends string,
  Reason extends string,
  Details = unknown,
  Source extends PersistenceErrorSource = PersistenceErrorSource,
> = PersistenceErrorBase<
  Kind,
  InfrastructureErrorCode<Owner, Reason>,
  Details,
  Source
>;

export type PersistenceError = PersistenceErrorOf<
  PersistenceErrorKind,
  string,
  string
>;
