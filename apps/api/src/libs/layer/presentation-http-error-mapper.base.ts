import { HttpStatus } from '@nestjs/common';
import { type PresentationMapper } from './mapper.type';
import {
  APPLICATION_ERROR_KIND,
  type ApplicationErrorBase,
  type ApplicationErrorKind,
} from './application-error.base';
import { type PresentationHttpError } from './presentation-http-error.base';
import { PresentationHttpException } from './presentation-http.exception';

export abstract class PresentationHttpErrorMapper<
  ApplicationError extends ApplicationErrorBase,
> implements PresentationMapper<ApplicationError, PresentationHttpException> {
  toPresentation(error: ApplicationError): PresentationHttpException {
    return this.toException(error);
  }

  toException(error: ApplicationError): PresentationHttpException {
    return new PresentationHttpException(this.toHttpError(error));
  }

  protected toHttpError(
    error: ApplicationError,
  ): PresentationHttpError<ApplicationErrorKind> {
    const details = this.toDetails(error);

    if (details) {
      return {
        statusCode: this.toStatusCode(error),
        code: error.kind,
        message: this.toMessage(error),
        details,
      };
    }

    return {
      statusCode: this.toStatusCode(error),
      code: error.kind,
      message: this.toMessage(error),
    };
  }

  protected toMessage(error: ApplicationError): string {
    switch (error.kind) {
      case APPLICATION_ERROR_KIND.VALIDATION_FAILED:
        return 'Request validation failed';
      case APPLICATION_ERROR_KIND.AUTHENTICATION_REQUIRED:
        return 'Authentication required';
      case APPLICATION_ERROR_KIND.PERMISSION_DENIED:
        return 'Permission denied';
      case APPLICATION_ERROR_KIND.OPERATION_NOT_ALLOWED:
        return 'Operation not allowed';
      case APPLICATION_ERROR_KIND.NOT_FOUND:
        return 'Resource not found';
      case APPLICATION_ERROR_KIND.STATE_CONFLICT:
        return 'Request conflicts with current state';
      case APPLICATION_ERROR_KIND.RATE_LIMITED:
        return 'Rate limit exceeded';
      case APPLICATION_ERROR_KIND.DEPENDENCY_UNAVAILABLE:
        return 'Service temporarily unavailable';
      case APPLICATION_ERROR_KIND.UNEXPECTED:
        return 'Internal server error';
    }
  }

  protected toDetails(error: ApplicationError): object | undefined {
    void error;

    return undefined;
  }

  private toStatusCode(error: ApplicationError): HttpStatus {
    switch (error.kind) {
      case APPLICATION_ERROR_KIND.VALIDATION_FAILED:
        return HttpStatus.BAD_REQUEST;
      case APPLICATION_ERROR_KIND.AUTHENTICATION_REQUIRED:
        return HttpStatus.UNAUTHORIZED;
      case APPLICATION_ERROR_KIND.PERMISSION_DENIED:
      case APPLICATION_ERROR_KIND.OPERATION_NOT_ALLOWED:
        return HttpStatus.FORBIDDEN;
      case APPLICATION_ERROR_KIND.NOT_FOUND:
        return HttpStatus.NOT_FOUND;
      case APPLICATION_ERROR_KIND.STATE_CONFLICT:
        return HttpStatus.CONFLICT;
      case APPLICATION_ERROR_KIND.RATE_LIMITED:
        return HttpStatus.TOO_MANY_REQUESTS;
      case APPLICATION_ERROR_KIND.DEPENDENCY_UNAVAILABLE:
        return HttpStatus.SERVICE_UNAVAILABLE;
      case APPLICATION_ERROR_KIND.UNEXPECTED:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
