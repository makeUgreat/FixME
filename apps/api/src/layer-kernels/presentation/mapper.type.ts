export interface PresentationMapper<Input, Output> {
  toPresentation(input: Input): Output;
}
