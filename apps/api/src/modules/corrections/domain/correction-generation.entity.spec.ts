import { describe, expect, it } from 'vitest';
import {
  CorrectionGeneration,
  type CreateCorrectionGenerationProps,
} from './correction-generation.entity';

const createCorrectionGeneration = (
  overrides: Partial<CreateCorrectionGenerationProps> = {},
): ReturnType<typeof CorrectionGeneration.create> =>
  CorrectionGeneration.create({
    id: 'correction-generation-1',
    correctionId: 'correction-1',
    model: 'gpt-5-mini',
    metadata: {
      providerRequestId: 'response-1',
      tokenUsage: {
        inputTokens: 25,
        outputTokens: 80,
      },
    },
    ...overrides,
  });

describe('CorrectionGeneration', () => {
  describe('create', () => {
    it('검증에 성공하면 성공 Result와 교정 생성 모델을 반환한다', () => {
      const result = createCorrectionGeneration();

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const props = result.value.getProps();

        expect(result.value.id).toBe('correction-generation-1');
        expect(props.correctionId).toBe('correction-1');
        expect(props.model).toBe('gpt-5-mini');
        expect(props.metadata).toEqual({
          providerRequestId: 'response-1',
          tokenUsage: {
            inputTokens: 25,
            outputTokens: 80,
          },
        });
      }
    });

    it('문자열 필드 앞뒤 공백을 제거해 저장한다', () => {
      const result = createCorrectionGeneration({
        correctionId: '  correction-1  ',
        model: '  gpt-5-mini  ',
      });

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.getProps().correctionId).toBe('correction-1');
        expect(result.value.getProps().model).toBe('gpt-5-mini');
      }
    });

    it('교정 ID가 비어 있으면 실패 Result를 반환한다', () => {
      const result = createCorrectionGeneration({
        correctionId: ' ',
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe(
          'correction_generation.correction_id_empty',
        );
      }
    });

    it('모델명이 비어 있으면 실패 Result를 반환한다', () => {
      const result = createCorrectionGeneration({
        model: ' ',
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe('correction_generation.model_empty');
      }
    });

    it('메타데이터가 null이면 실패 Result를 반환한다', () => {
      const result = createCorrectionGeneration({
        metadata: null as unknown as Record<string, unknown>,
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe(
          'correction_generation.metadata_invalid',
        );
      }
    });

    it('메타데이터가 배열이면 실패 Result를 반환한다', () => {
      const result = createCorrectionGeneration({
        metadata: [] as unknown as Record<string, unknown>,
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe(
          'correction_generation.metadata_invalid',
        );
      }
    });

    it('메타데이터가 문자열이면 실패 Result를 반환한다', () => {
      const result = createCorrectionGeneration({
        metadata: 'invalid' as unknown as Record<string, unknown>,
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe(
          'correction_generation.metadata_invalid',
        );
      }
    });
  });

  describe('restore', () => {
    it('기존 생성일과 수정일을 보존한다', () => {
      const createdAt = new Date('2026-01-01T00:00:00.000Z');
      const updatedAt = new Date('2026-01-02T00:00:00.000Z');
      const result = CorrectionGeneration.restore({
        id: 'correction-generation-1',
        createdAt,
        updatedAt,
        props: {
          correctionId: 'correction-1',
          model: 'gpt-5-mini',
          metadata: { providerRequestId: 'response-1' },
        },
      });

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value.createdAt).toEqual(createdAt);
        expect(result.value.updatedAt).toEqual(updatedAt);
      }
    });

    it('잘못된 속성이 있으면 실패 Result를 반환한다', () => {
      const result = CorrectionGeneration.restore({
        id: 'correction-generation-1',
        props: {
          correctionId: 'correction-1',
          model: 'gpt-5-mini',
          metadata: [] as unknown as Record<string, unknown>,
        },
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error.code).toBe(
          'correction_generation.metadata_invalid',
        );
      }
    });
  });
});
