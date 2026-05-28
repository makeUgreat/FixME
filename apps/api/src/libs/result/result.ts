export type Result<T, E> = Ok<T> | Err<E>;

export type Ok<T> = {
  kind: 'ok';
  value: T;
};

export type Err<E> = {
  kind: 'err';
  error: E;
};

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
