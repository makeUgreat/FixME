import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { type PresentationHttpError } from '@layer-kernels/presentation';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../../../src/bootstrap/nest/app.module';
import { type CreateCorrectionHttpResponse } from '../../../src/contexts/corrections/presentation/http/create-correction/response';
import { createTestNestApp } from '../../support/create-test-nest-app';

interface ValidationErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  details: {
    fields: {
      path: string;
      messages: string[];
    }[];
  };
}

const createRequestPayload = () => ({
  originalText: 'Is this for concurrency?',
  correctedText: 'Is this for handling concurrency?',
  feedback: {
    inferredIntent: 'The user asks whether this is meant for concurrency.',
    explanation:
      'The corrected sentence uses a more natural and specific phrase.',
  },
  mistakes: [
    {
      types: ['naturalness'],
      explanation: 'The original phrase is understandable but vague.',
    },
  ],
  metadata: {
    model: 'gpt-5-mini',
    providerMetadata: { providerRequestId: 'response-1' },
  },
});

describe('CorrectionsHttpController (integration)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    app = await createTestNestApp(AppModule);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /corrections', () => {
    it('유효한 교정 결과 요청이면 생성된 교정 ID를 반환한다', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/corrections',
        payload: createRequestPayload(),
      });

      expect(res.statusCode).toBe(201);
      expect(res.json<CreateCorrectionHttpResponse>().correctionId).toEqual(
        expect.any(String),
      );
      expect(res.json<CreateCorrectionHttpResponse>()).toEqual({
        correctionId: res.json<CreateCorrectionHttpResponse>().correctionId,
      });
    });

    it('요청 필수 문자열이 비어 있으면 Bad Request를 반환한다', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/corrections',
        payload: {
          ...createRequestPayload(),
          originalText: '',
        },
      });

      expect(res.statusCode).toBe(400);
      const body = res.json<ValidationErrorResponse>();

      expect(body).toMatchObject({
        statusCode: 400,
        code: 'validation_failed',
        message: 'Request validation failed',
        details: {
          fields: [
            {
              path: 'originalText',
              messages: ['originalText should not be empty'],
            },
          ],
        },
      });
    });

    it('허용되지 않은 오류 유형이면 Bad Request를 반환한다', async () => {
      const payload = createRequestPayload();

      const res = await app.inject({
        method: 'POST',
        url: '/corrections',
        payload: {
          ...payload,
          mistakes: [
            {
              ...payload.mistakes[0],
              types: ['unknown'],
            },
          ],
        },
      });

      expect(res.statusCode).toBe(400);
      const body = res.json<ValidationErrorResponse>();

      expect(body).toMatchObject({
        statusCode: 400,
        code: 'validation_failed',
        message: 'Request validation failed',
        details: {
          fields: [
            {
              path: 'mistakes.types',
              messages: [
                'each value in types must be one of the following values: grammar, word_choice, word_order, tense, spelling, article, preposition, punctuation, formality, tone, naturalness, clarity',
              ],
            },
          ],
        },
      });
    });

    it('교정됐는데 오류 목록이 비어 있으면 표준 Bad Request를 반환한다', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/corrections',
        payload: {
          ...createRequestPayload(),
          mistakes: [],
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json<PresentationHttpError>()).toEqual({
        statusCode: 400,
        code: 'validation_failed',
        message: 'Request validation failed',
        details: {
          fields: [
            {
              path: 'correctedText',
              messages: [
                'Correction mistakes are required when text is corrected',
              ],
            },
            {
              path: 'mistakes',
              messages: [
                'Correction mistakes are required when text is corrected',
              ],
            },
          ],
        },
      });
    });
  });
});
