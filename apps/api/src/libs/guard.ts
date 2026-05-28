export class Guard {
  static isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'string') {
      return value.trim().length === 0;
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }

    return false;
  }

  static isLengthBetween(value: string, min: number, max: number): boolean {
    return value.length >= min && value.length <= max;
  }
}
