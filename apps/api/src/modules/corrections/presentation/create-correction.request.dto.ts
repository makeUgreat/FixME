import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MISTAKE_TYPES, type MistakeType } from '../domain';

export class CorrectionFeedbackRequestDto {
  @IsString()
  @IsNotEmpty()
  inferredIntent!: string;

  @IsString()
  @IsNotEmpty()
  explanation!: string;
}

export class CorrectionMistakeRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(MISTAKE_TYPES, { each: true })
  types!: MistakeType[];

  @IsString()
  @IsNotEmpty()
  explanation!: string;
}

export class CorrectionMetadataRequestDto {
  @IsString()
  @IsNotEmpty()
  model!: string;

  @IsObject()
  providerMetadata!: Record<string, unknown>;
}

export class CreateCorrectionRequestDto {
  @IsString()
  @IsNotEmpty()
  originalText!: string;

  @IsString()
  @IsNotEmpty()
  correctedText!: string;

  @ValidateNested()
  @IsDefined()
  @IsObject()
  @Type(() => CorrectionFeedbackRequestDto)
  feedback!: CorrectionFeedbackRequestDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CorrectionMistakeRequestDto)
  mistakes!: CorrectionMistakeRequestDto[];

  @ValidateNested()
  @IsDefined()
  @IsObject()
  @Type(() => CorrectionMetadataRequestDto)
  metadata!: CorrectionMetadataRequestDto;
}
