import {
  HttpException,
  HttpStatus,
  type ValidationError,
} from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { HttpValidationErrorMapper } from '../http-validation-error.mapper';

describe('HttpValidationErrorMapper', () => {
  const mapper = new HttpValidationErrorMapper();

  describe('toException', () => {
    it('class-validator 오류를 presentation HTTP exception으로 변환한다', () => {
      const exception = mapper.toException([
        {
          property: 'originalText',
          constraints: {
            isNotEmpty: 'originalText should not be empty',
            isString: 'originalText must be a string',
          },
        } satisfies ValidationError,
      ]);

      expect(exception).toBeInstanceOf(HttpException);
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.message).toBe('Request validation failed');
      expect(exception.getResponse()).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'validation_failed',
        message: 'Request validation failed',
        details: {
          fields: [
            {
              path: 'originalText',
              messages: [
                'originalText should not be empty',
                'originalText must be a string',
              ],
            },
          ],
        },
      });
    });

    it('중첩 class-validator 오류를 public dot path로 평탄화한다', () => {
      const exception = mapper.toException([
        {
          property: 'mistakes',
          children: [
            {
              property: '0',
              children: [
                {
                  property: 'types',
                  constraints: {
                    isEnum: 'each value in types must be valid',
                  },
                } satisfies ValidationError,
              ],
            } satisfies ValidationError,
          ],
        } satisfies ValidationError,
      ]);

      expect(exception.getResponse()).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'validation_failed',
        message: 'Request validation failed',
        details: {
          fields: [
            {
              path: 'mistakes.types',
              messages: ['each value in types must be valid'],
            },
          ],
        },
      });
    });

    it('constraint 없는 부모 오류는 details.fields에 포함하지 않는다', () => {
      const exception = mapper.toException([
        {
          property: 'metadata',
          children: [
            {
              property: 'model',
              constraints: {
                isNotEmpty: 'metadata.model should not be empty',
              },
            } satisfies ValidationError,
          ],
        } satisfies ValidationError,
      ]);

      expect(exception.getResponse()).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'validation_failed',
        message: 'Request validation failed',
        details: {
          fields: [
            {
              path: 'metadata.model',
              messages: ['metadata.model should not be empty'],
            },
          ],
        },
      });
    });
  });
});
