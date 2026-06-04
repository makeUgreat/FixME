import { err, ok, type Result } from '@core/result';

export interface SafePersistenceParser<T> {
  safeParse(value: unknown):
    | {
        success: true;
        data: T;
      }
    | {
        success: false;
      };
}

export abstract class PersistenceAggregateMapper<
  Aggregate,
  PersistenceOutput,
  PersistenceInput,
  RestoreError,
> {
  abstract toPersistence(aggregate: Aggregate): PersistenceInput;

  abstract toAggregate(
    persistenceOutput: PersistenceOutput,
  ): Result<Aggregate, RestoreError>;

  protected parsePersistenceValue<T, Error extends RestoreError>(
    parser: SafePersistenceParser<T>,
    value: unknown,
    toError: () => Error,
  ): Result<T, Error> {
    const parsed = parser.safeParse(value);

    return parsed.success ? ok(parsed.data) : err(toError());
  }
}
