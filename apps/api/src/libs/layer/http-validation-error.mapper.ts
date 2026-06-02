import { HttpStatus, type ValidationError } from '@nestjs/common';
import { APPLICATION_ERROR_KIND } from './application-error.base';
import { type PresentationMapper } from './mapper.type';
import { type ValidationFailedDetails } from './presentation-http-error.base';
import { PresentationHttpException } from './presentation-http.exception';

export class HttpValidationErrorMapper implements PresentationMapper<
  ValidationError[],
  PresentationHttpException
> {
  toPresentation(errors: ValidationError[]): PresentationHttpException {
    return this.toException(errors);
  }

  toException(errors: ValidationError[]): PresentationHttpException {
    return new PresentationHttpException({
      statusCode: HttpStatus.BAD_REQUEST,
      code: APPLICATION_ERROR_KIND.VALIDATION_FAILED,
      message: 'Request validation failed',
      details: this.toDetails(errors),
    });
  }

  private toDetails(errors: ValidationError[]): ValidationFailedDetails {
    return {
      fields: errors.flatMap((error) => this.toFields(error)),
    };
  }

  private toFields(
    error: ValidationError,
    parentPath?: string,
  ): ValidationFailedDetails['fields'] {
    const path = this.toPath(error.property, parentPath);
    const fields: ValidationFailedDetails['fields'] = [];
    const messages = Object.values(error.constraints ?? {});

    if (messages.length > 0) {
      fields.push({
        path,
        messages,
      });
    }

    for (const child of error.children ?? []) {
      fields.push(...this.toFields(child, path));
    }

    return fields;
  }

  private toPath(property: string, parentPath?: string): string {
    if (this.isArrayIndex(property)) {
      return parentPath ?? property;
    }

    return parentPath ? `${parentPath}.${property}` : property;
  }

  private isArrayIndex(property: string): boolean {
    return /^\d+$/.test(property);
  }
}
