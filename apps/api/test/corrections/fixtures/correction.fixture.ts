import {
  Correction,
  CorrectionFeedback,
  Mistake,
} from '../../../src/contexts/corrections/domain';

interface CreateCorrectionFixtureParams {
  id?: string;
  correctedText?: string;
}

export function createCorrectionFixture(
  params?: CreateCorrectionFixtureParams,
): Correction {
  const id = params?.id ?? 'correction-1';
  const feedback = CorrectionFeedback.of({
    inferredIntent: 'The user asks whether this is meant for concurrency.',
    explanation: 'The corrected sentence uses a more natural phrase.',
  })._unsafeUnwrap();
  const mistake = Mistake.of({
    types: ['naturalness'],
    explanation: 'The original phrase is understandable but vague.',
  })._unsafeUnwrap();

  return Correction.create({
    id,
    originalText: 'Is this for concurrency?',
    correctedText: params?.correctedText ?? 'Is this for handling concurrency?',
    feedback,
    mistakes: [mistake],
    metadata: {
      id: `${id}-metadata`,
      model: 'gpt-5-mini',
      providerMetadata: { providerRequestId: `${id}-request` },
    },
  })._unsafeUnwrap();
}
