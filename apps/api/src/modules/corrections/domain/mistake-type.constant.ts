export const MISTAKE_TYPES = [
  'grammar',
  'word_choice',
  'word_order',
  'tense',
  'spelling',
  'article',
  'preposition',
  'punctuation',
  'formality',
  'tone',
  'naturalness',
  'clarity',
] as const;

export type MistakeType = (typeof MISTAKE_TYPES)[number];

export function isMistakeType(value: unknown): value is MistakeType {
  return MISTAKE_TYPES.includes(value as MistakeType);
}

export function areMistakeTypes(values: unknown[]): values is MistakeType[] {
  return values.every(isMistakeType);
}
