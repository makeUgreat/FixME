export abstract class Command<TResult> {
  declare protected readonly resultType: TResult;
}

export abstract class Query<TResult> {
  declare protected readonly resultType: TResult;
}

export type CommandResult<TCommand extends Command<unknown>> =
  TCommand extends Command<infer TResult> ? TResult : never;

export type QueryResult<TQuery extends Query<unknown>> =
  TQuery extends Query<infer TResult> ? TResult : never;

export type CommandConstructor<
  TCommand extends Command<unknown> = Command<unknown>,
> = new (...args: any[]) => TCommand;

export type QueryConstructor<TQuery extends Query<unknown> = Query<unknown>> =
  new (...args: any[]) => TQuery;

export interface CommandHandler<TCommand extends Command<unknown>> {
  execute(
    command: TCommand,
  ): CommandResult<TCommand> | Promise<CommandResult<TCommand>>;
}

export interface QueryHandler<TQuery extends Query<unknown>> {
  execute(query: TQuery): QueryResult<TQuery> | Promise<QueryResult<TQuery>>;
}

export interface CommandBus {
  execute<TCommand extends Command<unknown>>(
    command: TCommand,
  ): Promise<Awaited<CommandResult<TCommand>>>;
}

export interface QueryBus {
  execute<TQuery extends Query<unknown>>(
    query: TQuery,
  ): Promise<Awaited<QueryResult<TQuery>>>;
}

export type CommandHandlerRegistration<TCommand extends Command<unknown>> =
  readonly [CommandConstructor<TCommand>, CommandHandler<TCommand>];

export type QueryHandlerRegistration<TQuery extends Query<unknown>> = readonly [
  QueryConstructor<TQuery>,
  QueryHandler<TQuery>,
];

export class CqrsHandlerNotFoundError extends Error {
  constructor(kind: 'command' | 'query', name: string) {
    super(`No ${kind} handler registered for ${name}`);
    this.name = 'CqrsHandlerNotFoundError';
  }
}

export class InMemoryCommandBus implements CommandBus {
  private readonly handlers = new Map<
    CommandConstructor<Command<unknown>>,
    CommandHandler<Command<unknown>>
  >();

  constructor(
    registrations: readonly CommandHandlerRegistration<Command<unknown>>[] = [],
  ) {
    for (const [command, handler] of registrations) {
      this.handlers.set(command, handler);
    }
  }

  async execute<TCommand extends Command<unknown>>(
    command: TCommand,
  ): Promise<Awaited<CommandResult<TCommand>>> {
    const commandConstructor = command.constructor as CommandConstructor<TCommand>;
    const handler = this.handlers.get(commandConstructor) as
      | CommandHandler<TCommand>
      | undefined;

    if (!handler) {
      throw new CqrsHandlerNotFoundError('command', commandConstructor.name);
    }

    return (await handler.execute(command)) as Awaited<CommandResult<TCommand>>;
  }
}

export class InMemoryQueryBus implements QueryBus {
  private readonly handlers = new Map<
    QueryConstructor<Query<unknown>>,
    QueryHandler<Query<unknown>>
  >();

  constructor(
    registrations: readonly QueryHandlerRegistration<Query<unknown>>[] = [],
  ) {
    for (const [query, handler] of registrations) {
      this.handlers.set(query, handler);
    }
  }

  async execute<TQuery extends Query<unknown>>(
    query: TQuery,
  ): Promise<Awaited<QueryResult<TQuery>>> {
    const queryConstructor = query.constructor as QueryConstructor<TQuery>;
    const handler = this.handlers.get(queryConstructor) as
      | QueryHandler<TQuery>
      | undefined;

    if (!handler) {
      throw new CqrsHandlerNotFoundError('query', queryConstructor.name);
    }

    return (await handler.execute(query)) as Awaited<QueryResult<TQuery>>;
  }
}
