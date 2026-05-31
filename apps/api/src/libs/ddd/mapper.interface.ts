import { DomainError } from './domain.error';
import { Entity } from './entity.base';
import { type Result } from './result.util';

export interface Mapper<
  DomainEntity extends Entity<any, any>,
  DbRecord,
  Response = any,
> {
  toModel(entity: DomainEntity): DbRecord;
  toDomain(record: DbRecord): Result<DomainEntity, DomainError>;
  toResponse?(entity: DomainEntity): Response;
}
