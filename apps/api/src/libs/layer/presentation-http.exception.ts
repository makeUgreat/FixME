import { HttpException } from '@nestjs/common';
import { type PresentationHttpError } from './presentation-http-error.base';

export class PresentationHttpException<
  Code extends string = string,
> extends HttpException {
  constructor(readonly error: PresentationHttpError<Code>) {
    super(error, error.statusCode);
  }

  get statusCode(): PresentationHttpError<Code>['statusCode'] {
    return this.error.statusCode;
  }

  get code(): Code {
    return this.error.code;
  }

  get details(): object | undefined {
    return this.error.details;
  }
}
