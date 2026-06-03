export interface ApplicationMapper<Input, Output> {
  toApplication(input: Input): Output;
}

export interface PresentationMapper<Input, Output> {
  toPresentation(input: Input): Output;
}
