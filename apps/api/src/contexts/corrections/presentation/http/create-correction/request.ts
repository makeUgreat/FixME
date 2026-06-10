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
import {
  CREATE_CORRECTION_MISTAKE_TYPES,
  type CorrectionMistakeInput,
} from '@contexts/corrections/application/commands/create-correction/create-correction.command';

export class CorrectionFeedbackHttpRequest {
  @IsString()
  @IsNotEmpty()
  inferredIntent!: string;

  @IsString()
  @IsNotEmpty()
  explanation!: string;
}

export class CorrectionMistakeHttpRequest {
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(CREATE_CORRECTION_MISTAKE_TYPES, { each: true })
  types!: CorrectionMistakeInput['types'];

  @IsString()
  @IsNotEmpty()
  explanation!: string;
}

export class CorrectionMetadataHttpRequest {
  @IsString()
  @IsNotEmpty()
  model!: string;

  @IsObject()
  providerMetadata!: Record<string, unknown>;
}

export class CreateCorrectionHttpRequest {
  @IsString()
  @IsNotEmpty()
  originalText!: string;

  @IsString()
  @IsNotEmpty()
  correctedText!: string;

  @ValidateNested()
  @IsDefined()
  @IsObject()
  @Type(() => CorrectionFeedbackHttpRequest)
  feedback!: CorrectionFeedbackHttpRequest;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CorrectionMistakeHttpRequest)
  mistakes!: CorrectionMistakeHttpRequest[];

  @ValidateNested()
  @IsDefined()
  @IsObject()
  @Type(() => CorrectionMetadataHttpRequest)
  metadata!: CorrectionMetadataHttpRequest;
}
