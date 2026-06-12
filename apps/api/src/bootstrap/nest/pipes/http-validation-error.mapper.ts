import {
  HttpException,
  HttpStatus,
  type ValidationError,
} from '@nestjs/common';
import {
  APPLICATION_ERROR_KIND,
  type ValidationFailedDetails,
} from '@layer-kernels/application';
import { type PresentationMapper } from '@layer-kernels/presentation';

export class HttpValidationErrorMapper implements PresentationMapper<
  ValidationError[],
  HttpException
> {
  toPresentation(errors: ValidationError[]): HttpException {
    return this.toException(errors);
  }

  toException(errors: ValidationError[]): HttpException {
    return new HttpException(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        code: APPLICATION_ERROR_KIND.VALIDATION_FAILED,
        message: 'Request validation failed',
        details: this.toDetails(errors),
      },
      HttpStatus.BAD_REQUEST,
    );
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
