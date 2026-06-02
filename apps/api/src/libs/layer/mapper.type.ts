import { type DomainErrorBase } from '@libs/ddd';
import { type Result } from '@libs/result';

export interface ApplicationMapper<Input, Output> {
  toApplication(input: Input): Output;
}

export interface PresentationMapper<Input, Output> {
  toPresentation(input: Input): Output;
}

export interface PersistenceMapper<
  DomainModel,
  PersistenceRecord,
  RestoreError extends DomainErrorBase,
> {
  toRecord(domain: DomainModel): PersistenceRecord;
  toDomain(record: PersistenceRecord): Result<DomainModel, RestoreError>;
}
