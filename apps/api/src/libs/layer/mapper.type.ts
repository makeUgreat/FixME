import { type Result } from '@libs/result';

export interface PersistenceMapper<
  DomainModel,
  PersistenceRecord,
  RestoreError,
> {
  toRecord(domain: DomainModel): PersistenceRecord;
  toDomain(record: PersistenceRecord): Result<DomainModel, RestoreError>;
}

export interface PresentationMapper<Input, ResponseDto> {
  toResponse(input: Input): ResponseDto;
}

export interface ApplicationErrorMapper<DomainError, ApplicationError> {
  toApplicationError(error: DomainError): ApplicationError;
}

export interface PresentationErrorMapper<ApplicationError, ErrorResponseDto> {
  toResponse(error: ApplicationError): ErrorResponseDto;
  toStatus(error: ApplicationError): number;
}
