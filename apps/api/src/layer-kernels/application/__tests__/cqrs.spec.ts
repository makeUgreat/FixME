import { describe, expect, it, vi } from 'vitest';
import {
  Command,
  CqrsHandlerNotFoundError,
  InMemoryCommandBus,
  InMemoryQueryBus,
  Query,
  type CommandHandler,
  type QueryHandler,
} from '../cqrs';

class SampleCommand extends Command<string> {
  constructor(readonly value: string) {
    super();
  }
}

class UnknownCommand extends Command<string> {}

class SampleQuery extends Query<number> {
  constructor(readonly id: string) {
    super();
  }
}

class UnknownQuery extends Query<number> {}

describe('InMemoryCommandBus', () => {
  describe('execute', () => {
    it('registered command handler를 실행하고 결과를 반환한다', async () => {
      const handler: CommandHandler<SampleCommand> = {
        execute: vi.fn((command) => `handled:${command.value}`),
      };
      const bus = new InMemoryCommandBus([[SampleCommand, handler]]);

      await expect(bus.execute(new SampleCommand('command-1'))).resolves.toBe(
        'handled:command-1',
      );
      expect(handler.execute).toHaveBeenCalledWith(
        expect.objectContaining({ value: 'command-1' }),
      );
    });

    it('registered command handler가 없으면 실패한다', async () => {
      const bus = new InMemoryCommandBus();

      await expect(bus.execute(new UnknownCommand())).rejects.toThrow(
        CqrsHandlerNotFoundError,
      );
      await expect(bus.execute(new UnknownCommand())).rejects.toThrow(
        'No command handler registered for UnknownCommand',
      );
    });
  });
});

describe('InMemoryQueryBus', () => {
  describe('execute', () => {
    it('registered query handler를 실행하고 결과를 반환한다', async () => {
      const handler: QueryHandler<SampleQuery> = {
        execute: vi.fn((query) => query.id.length),
      };
      const bus = new InMemoryQueryBus([[SampleQuery, handler]]);

      await expect(bus.execute(new SampleQuery('query-1'))).resolves.toBe(7);
      expect(handler.execute).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'query-1' }),
      );
    });

    it('registered query handler가 없으면 실패한다', async () => {
      const bus = new InMemoryQueryBus();

      await expect(bus.execute(new UnknownQuery())).rejects.toThrow(
        CqrsHandlerNotFoundError,
      );
      await expect(bus.execute(new UnknownQuery())).rejects.toThrow(
        'No query handler registered for UnknownQuery',
      );
    });
  });
});
