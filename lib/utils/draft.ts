export type DeepPartial<T> = T extends Array<infer U>
  ? DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T | undefined;

export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const sanitizeDraft = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    const sanitizedArray = value
      .map((item) => sanitizeDraft(item))
      .filter((item) => item !== undefined);
    return sanitizedArray;
  }

  if (isPlainObject(value)) {
    const sanitizedObject: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      const sanitizedValue = sanitizeDraft(nestedValue);
      if (sanitizedValue === undefined) {
        continue;
      }
      if (isPlainObject(sanitizedValue) && Object.keys(sanitizedValue).length === 0) {
        continue;
      }
      if (Array.isArray(sanitizedValue) && sanitizedValue.length === 0) {
        continue;
      }
      sanitizedObject[key] = sanitizedValue;
    }
    if (Object.keys(sanitizedObject).length === 0) {
      return undefined;
    }
    return sanitizedObject;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }

  return value;
};

export const mergeDraftInto = <T>(target: T, source: DeepPartial<T>): T => {
  if (!isPlainObject(source)) {
    return target;
  }

  for (const [key, value] of Object.entries(source) as [keyof T, DeepPartial<T[keyof T]>][]) {
    if (value === undefined) {
      continue;
    }

    const targetValue = (target as Record<string, unknown>)[key];

    if (Array.isArray(value)) {
      (target as Record<string, unknown>)[key] = value as unknown as T[keyof T];
      continue;
    }

    if (isPlainObject(value)) {
      const nextTarget = isPlainObject(targetValue) ? { ...targetValue } : {};
      (target as Record<string, unknown>)[key] = mergeDraftInto(nextTarget, value) as unknown as T[keyof T];
      continue;
    }

    (target as Record<string, unknown>)[key] = value as unknown as T[keyof T];
  }

  return target;
};
