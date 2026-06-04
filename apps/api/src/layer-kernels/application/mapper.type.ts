export interface ApplicationMapper<Input, Output> {
  toApplication(input: Input): Output;
}
