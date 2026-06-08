import {
  PresentationHttpErrorMapper as BasePresentationHttpErrorMapper,
  type PresentationHttpMappableError,
} from '@layer-kernels/presentation';
import { PresentationHttpException } from './http.exception';

export abstract class PresentationHttpErrorMapper<
  Error extends PresentationHttpMappableError = PresentationHttpMappableError,
> extends BasePresentationHttpErrorMapper<Error> {
  toException(error: Error): PresentationHttpException {
    return new PresentationHttpException(this.toPresentation(error));
  }

  toPresentationException(error: Error): PresentationHttpException {
    return this.toException(error);
  }
}
