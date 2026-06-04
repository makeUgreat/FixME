export type PresentationHttpError<Code extends string = string> = {
  readonly statusCode: number;
  readonly code: Code;
  readonly message: string;
  readonly details?: object;
};
