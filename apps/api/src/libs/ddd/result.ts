export type Result<T, E> = Ok<T> | Err<E>;

export type Ok<T> = {
  kind: 'ok';
  value: T;
};

export type Err<E> = {
  kind: 'err';
  error: E;
};

export type ResultRule<E> = () => Result<void, E>;

export function ok<T>(value: T): Ok<T> {
  return {
    kind: 'ok',
    value,
  };
}

export function err<E>(error: E): Err<E> {
  return {
    kind: 'err',
    error,
  };
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.kind === 'ok';
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.kind === 'err';
}

export function map<T, E, U>(
  result: Result<T, E>,
  transform: (value: T) => U,
): Result<U, E> {
  if (isErr(result)) {
    return result;
  }

  return ok(transform(result.value));
}

export function mapErr<T, E, F>(
  result: Result<T, E>,
  transform: (error: E) => F,
): Result<T, F> {
  if (isOk(result)) {
    return result;
  }

  return err(transform(result.error));
}

export function andThen<T, E, U, F>(
  result: Result<T, E>,
  next: (value: T) => Result<U, F>,
): Result<U, E | F> {
  if (isErr(result)) {
    return result;
  }

  return next(result.value);
}

export function ensure<E>(condition: boolean, error: E): Result<void, E> {
  if (condition) {
    return ok(undefined);
  }

  return err(error);
}

export function all<E>(rules: ResultRule<E>[]): Result<void, E> {
  for (const rule of rules) {
    const result = rule();

    if (isErr(result)) {
      return result;
    }
  }

  return ok(undefined);
}
