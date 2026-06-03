import { type HttpStatus } from '@nestjs/common';
export type ValidationFailedFieldDetail = {
  path: string;
  messages: string[];
};

export type ValidationFailedDetails = {
  fields: ValidationFailedFieldDetail[];
};

export type PresentationHttpError<Code extends string = string> = {
  readonly statusCode: HttpStatus;
  readonly code: Code;
  readonly message: string;
  readonly details?: object;
};
