import { type Result } from 'neverthrow';
import { DomainError } from './domain-error';
import { Entity } from './entity.base';

export interface Mapper<
  DomainEntity extends Entity<any>,
  DbRecord,
  Response = any,
> {
  toModel(entity: DomainEntity): DbRecord;
  toDomain(record: DbRecord): Result<DomainEntity, DomainError>;
  toResponse?(entity: DomainEntity): Response;
}
