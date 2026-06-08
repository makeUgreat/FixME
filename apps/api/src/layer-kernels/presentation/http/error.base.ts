export type PresentationHttpErrorDetails = object;

export type PresentationHttpError<
  Code extends string = string,
  Details extends PresentationHttpErrorDetails = PresentationHttpErrorDetails,
> = {
  readonly statusCode: number;
  readonly code: Code;
  readonly message: string;
  readonly details?: Details;
};
