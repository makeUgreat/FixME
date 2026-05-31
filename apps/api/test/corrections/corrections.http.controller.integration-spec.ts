import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../../src/app.module';
import { createTestNestApp } from '../support/create-test-nest-app';

interface ErrorResponse {
  code?: string;
  details?: unknown;
  message?: string | string[];
  statusCode?: number;
}

interface CreateCorrectionResponse {
  correctionId: unknown;
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
      const response = await app.inject({
        method: 'POST',
        url: '/corrections',
        payload: createRequestPayload(),
      });

      const body = JSON.parse(response.payload) as CreateCorrectionResponse;

      expect(response.statusCode).toBe(201);
      expect(typeof body.correctionId).toBe('string');
    });

    it('DTO 필수 문자열이 비어 있으면 Bad Request를 반환한다', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/corrections',
        payload: {
          ...createRequestPayload(),
          originalText: '',
        },
      });
      const body = JSON.parse(response.payload) as ErrorResponse;

      expect(response.statusCode).toBe(400);
      expect(body.statusCode).toBe(400);
      expect(body.message).toEqual(
        expect.arrayContaining(['originalText should not be empty']),
      );
    });

    it('허용되지 않은 오류 유형이면 Bad Request를 반환한다', async () => {
      const payload = createRequestPayload();

      const response = await app.inject({
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
      const body = JSON.parse(response.payload) as ErrorResponse;

      expect(response.statusCode).toBe(400);
      expect(body.statusCode).toBe(400);
      expect(body.message).toEqual(
        expect.arrayContaining([
          'mistakes.0.each value in types must be one of the following values: grammar, word_choice, word_order, tense, spelling, article, preposition, punctuation, formality, tone, naturalness, clarity',
        ]),
      );
    });

    it('교정됐는데 오류 목록이 비어 있으면 application 오류 코드를 반환한다', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/corrections',
        payload: {
          ...createRequestPayload(),
          mistakes: [],
        },
      });
      const body = JSON.parse(response.payload) as ErrorResponse;

      expect(response.statusCode).toBe(400);
      expect(body.code).toBe('create_correction.validation_failed');
      expect(body.message).toBe(
        'Correction mistakes cannot be empty when text is corrected',
      );
      expect(body.details).toEqual({
        domainCode: 'correction.mistakes_empty_for_corrected_text',
        domainDetails: {
          originalText: 'Is this for concurrency?',
          correctedText: 'Is this for handling concurrency?',
        },
      });
    });
  });
});
