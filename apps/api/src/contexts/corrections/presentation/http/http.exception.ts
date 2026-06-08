import { HttpException } from '@nestjs/common';
import { type PresentationHttpError } from '@layer-kernels/presentation';

export class PresentationHttpException<
  Code extends string = string,
> extends HttpException {
  constructor(readonly body: PresentationHttpError<Code>) {
    super(body, body.statusCode);
  }

  get statusCode(): PresentationHttpError<Code>['statusCode'] {
    return this.body.statusCode;
  }

  get code(): Code {
    return this.body.code;
  }

  get details(): object | undefined {
    return this.body.details;
  }
}
