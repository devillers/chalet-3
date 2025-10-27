import crypto from 'node:crypto';

export type IndexDirection = 1 | -1 | 'text';
export interface SchemaIndex<T> {
  fields: Partial<Record<keyof T & string, IndexDirection>> & Record<string, IndexDirection>;
  options?: {
    unique?: boolean;
    sparse?: boolean;
  };
}

export interface SchemaDefinitionProperty<T> {
  type: unknown;
  required?: boolean;
  default?: T | (() => T);
}

export type SchemaDefinition<T> = {
  [K in keyof T & string]: SchemaDefinitionProperty<T[K]> | SchemaDefinition<T[K]>;
};

export interface SchemaOptions {
  timestamps?: boolean;
}

export class Schema<T extends { _id: string }> {
  public readonly definition: SchemaDefinition<T>;
  public readonly options: SchemaOptions | undefined;
  private readonly schemaIndexes: SchemaIndex<T>[] = [];

  constructor(definition: SchemaDefinition<T>, options?: SchemaOptions) {
    this.definition = definition;
    this.options = options;
  }

  public index(fields: SchemaIndex<T>['fields'], options?: SchemaIndex<T>['options']): void {
    this.schemaIndexes.push({ fields, options });
  }

  public get indexes(): SchemaIndex<T>[] {
    return [...this.schemaIndexes];
  }
}

const collections = new Map<string, Map<string, unknown>>();

export interface LeanDocumentBase {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

function ensureCollection(name: string): Map<string, unknown> {
  let collection = collections.get(name);
  if (!collection) {
    collection = new Map();
    collections.set(name, collection);
  }
  return collection;
}

export interface QueryOptions {
  lean?: boolean;
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
}

export interface Model<T extends LeanDocumentBase> {
  create(payload: Omit<T, '_id' | 'createdAt' | 'updatedAt'> & Partial<LeanDocumentBase>): Promise<T>;
  find(filter?: Partial<T>, options?: QueryOptions): Promise<T[]>;
  findOne(filter: Partial<T>): Promise<T | null>;
  findById(id: string): Promise<T | null>;
  findByIdAndUpdate(id: string, update: Partial<T>, options?: { new?: boolean }): Promise<T | null>;
  findByIdAndDelete(id: string): Promise<T | null>;
  countDocuments(filter?: Partial<T>): Promise<number>;
}

function matchesFilter<T extends LeanDocumentBase>(doc: T, filter: Partial<T> | undefined): boolean {
  if (!filter) {
    return true;
  }
  return Object.entries(filter).every(([key, value]) => {
    const docValue = (doc as Record<string, unknown>)[key];
    if (value === undefined) {
      return true;
    }
    if (value instanceof Date && docValue instanceof Date) {
      return value.getTime() === docValue.getTime();
    }
    if (Array.isArray(value) && Array.isArray(docValue)) {
      return value.every((entry) => docValue.includes(entry));
    }
    return value === docValue;
  });
}

function sortDocuments<T extends LeanDocumentBase>(docs: T[], sort?: QueryOptions['sort']): T[] {
  if (!sort) {
    return docs;
  }
  const [key, direction] = Object.entries(sort)[0] ?? [];
  if (!key || !direction) {
    return docs;
  }
  const sorted = [...docs].sort((a, b) => {
    const aValue = (a as Record<string, unknown>)[key];
    const bValue = (b as Record<string, unknown>)[key];
    if (aValue === bValue) {
      return 0;
    }
    if (aValue === undefined) {
      return direction === 1 ? -1 : 1;
    }
    if (bValue === undefined) {
      return direction === 1 ? 1 : -1;
    }
    if (aValue instanceof Date && bValue instanceof Date) {
      return direction === 1
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 1 ? aValue - bValue : bValue - aValue;
    }
    return direction === 1
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });
  return sorted;
}

export function model<T extends LeanDocumentBase>(name: string, schema: Schema<T>): Model<T> {
  const collection = ensureCollection(name);

  async function create(payload: Omit<T, '_id' | 'createdAt' | 'updatedAt'> & Partial<LeanDocumentBase>): Promise<T> {
    const now = new Date();
    const document: T = {
      ...(payload as T),
      _id: (payload._id ?? crypto.randomUUID()) as string,
      createdAt: payload.createdAt ?? now,
      updatedAt: payload.updatedAt ?? now,
    };
    collection.set(document._id, document);
    return document;
  }

  async function find(filter?: Partial<T>, options?: QueryOptions): Promise<T[]> {
    const docs = Array.from(collection.values()) as T[];
    const filtered = docs.filter((doc) => matchesFilter(doc, filter));
    const sorted = sortDocuments(filtered, options?.sort);
    const start = options?.skip ?? 0;
    const end = options?.limit ? start + options.limit : undefined;
    return sorted.slice(start, end);
  }

  async function findOne(filter: Partial<T>): Promise<T | null> {
    const docs = await find(filter, { limit: 1 });
    return docs[0] ?? null;
  }

  async function findById(id: string): Promise<T | null> {
    return (collection.get(id) as T | undefined) ?? null;
  }

  async function findByIdAndUpdate(id: string, update: Partial<T>, options?: { new?: boolean }): Promise<T | null> {
    const existing = await findById(id);
    if (!existing) {
      return null;
    }
    const now = new Date();
    const updated: T = {
      ...existing,
      ...update,
      updatedAt: now,
    };
    collection.set(id, updated);
    return options?.new === false ? existing : updated;
  }

  async function findByIdAndDelete(id: string): Promise<T | null> {
    const existing = await findById(id);
    if (!existing) {
      return null;
    }
    collection.delete(id);
    return existing;
  }

  async function countDocuments(filter?: Partial<T>): Promise<number> {
    const docs = await find(filter);
    return docs.length;
  }

  return {
    create,
    find,
    findOne,
    findById,
    findByIdAndUpdate,
    findByIdAndDelete,
    countDocuments,
  };
}

export async function connectMongo(): Promise<void> {
  // In-memory implementation; real deployment should connect to MongoDB.
}

export async function disconnectMongo(): Promise<void> {
  collections.clear();
}

export type InferSchemaType<S> = S extends Schema<infer T> ? T : never;
