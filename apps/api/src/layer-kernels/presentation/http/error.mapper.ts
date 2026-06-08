import { type PresentationMapper } from '../mapper.type';
import { type PresentationHttpError } from './error.base';

export type PresentationHttpMappableError = {
  readonly kind: string;
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
  readonly source?: unknown;
};

type PresentationHttpErrorMapping = {
  readonly statusCode: number;
  readonly code: string;
  readonly message: string;
};

export class PresentationHttpErrorMapper<
  Input extends PresentationHttpMappableError = PresentationHttpMappableError,
> implements PresentationMapper<Input, PresentationHttpError> {
  toPresentation(error: Input): PresentationHttpError {
    const mapping = this.toMapping(error);
    const details = this.toDetails(error);

    if (details) {
      return {
        ...mapping,
        details,
      };
    }

    return mapping;
  }

  protected toDetails(error: Input): object | undefined {
    void error;

    return undefined;
  }

  protected toMapping(error: Input): PresentationHttpErrorMapping {
    switch (error.kind) {
      case 'validation_failed':
      case 'invariant_violation':
        return {
          statusCode: 400,
          code: 'validation_failed',
          message: 'Request validation failed',
        };
      case 'authentication_required':
        return {
          statusCode: 401,
          code: 'authentication_required',
          message: 'Authentication required',
        };
      case 'permission_denied':
        return {
          statusCode: 403,
          code: 'permission_denied',
          message: 'Permission denied',
        };
      case 'operation_not_allowed':
        return {
          statusCode: 403,
          code: 'operation_not_allowed',
          message: 'Operation not allowed',
        };
      case 'not_found':
        return {
          statusCode: 404,
          code: 'not_found',
          message: 'Resource not found',
        };
      case 'state_conflict':
      case 'conflict':
        return {
          statusCode: 409,
          code: 'state_conflict',
          message: 'Request conflicts with current state',
        };
      case 'rate_limited':
        return {
          statusCode: 429,
          code: 'rate_limited',
          message: 'Rate limit exceeded',
        };
      case 'dependency_unavailable':
      case 'unavailable':
      case 'timeout':
      case 'bad_response':
        return {
          statusCode: 503,
          code: 'dependency_unavailable',
          message: 'Service temporarily unavailable',
        };
      case 'invalid_data':
      case 'restore_failed':
      case 'unexpected':
      default:
        return {
          statusCode: 500,
          code: 'unexpected',
          message: 'Internal server error',
        };
    }
  }
}
