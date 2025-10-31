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
    // Keep arrays even if empty, but drop undefined items
    const sanitizedArray = value.map((item) => sanitizeDraft(item)).filter((item) => item !== undefined);
    return sanitizedArray;
  }

  if (isPlainObject(value)) {
    const sanitizedObject: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      const sanitizedValue = sanitizeDraft(nestedValue);
      if (sanitizedValue === undefined) {
        continue;
      }
      // Keep empty objects/arrays for draft persistence
      sanitizedObject[key] = sanitizedValue;
    }
    // Keep empty objects for drafts (user may fill them later)
    return sanitizedObject;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }

  return value;
};

export const mergeDraftInto = <T extends Record<string, unknown>>(target: T, source: DeepPartial<T>): T => {
  if (!isPlainObject(source)) {
    return target;
  }

  for (const [key, value] of Object.entries(source) as [keyof T, DeepPartial<T[keyof T]>][]) {
    if (value === undefined) {
      continue;
    }

    const targetValue = target[key];

    if (Array.isArray(value)) {
      target[key] = value as unknown as T[keyof T];
      continue;
    }

    if (isPlainObject(value)) {
      const nextTarget: Record<string, unknown> = isPlainObject(targetValue) ? { ...targetValue } : {};
      target[key] = mergeDraftInto<Record<string, unknown>>(
        nextTarget,
        value as DeepPartial<Record<string, unknown>>
      ) as unknown as T[keyof T];
      continue;
    }

    target[key] = value as unknown as T[keyof T];
  }

  return target;
};
