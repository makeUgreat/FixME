import { type DomainErrorBase } from '@layer-kernels/domain';
import { type ApplicationMapper } from './mapper.type';
import { type ApplicationErrorBase } from './error.base';

export type DomainErrorToApplicationErrorHandlers<
  DomainError extends DomainErrorBase,
  ApplicationError extends ApplicationErrorBase,
> = {
  [Kind in DomainError['kind']]: (
    error: Extract<DomainError, { kind: Kind }>,
  ) => ApplicationError;
};

export abstract class DomainErrorToApplicationErrorMapper<
  DomainError extends DomainErrorBase,
  ApplicationError extends ApplicationErrorBase,
> implements ApplicationMapper<DomainError, ApplicationError> {
  protected abstract readonly handlers: DomainErrorToApplicationErrorHandlers<
    DomainError,
    ApplicationError
  >;

  toApplication(error: DomainError): ApplicationError {
    return this.toApplicationError(error);
  }

  toApplicationError(error: DomainError): ApplicationError {
    const handler = this.handlers[error.kind] as (
      error: DomainError,
    ) => ApplicationError;

    return handler(error);
  }
}
