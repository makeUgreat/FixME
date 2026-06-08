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
  RestoreErrorValue,
> {
  abstract toPersistence(aggregate: Aggregate): PersistenceInput;

  abstract toAggregate(
    persistenceOutput: PersistenceOutput,
  ): Result<Aggregate, RestoreErrorValue>;

  protected parsePersistenceValue<T, ErrorValue extends RestoreErrorValue>(
    parser: SafePersistenceParser<T>,
    value: unknown,
    toError: () => ErrorValue,
  ): Result<T, ErrorValue> {
    const parsed = parser.safeParse(value);

    return parsed.success ? ok(parsed.data) : err(toError());
  }
}
