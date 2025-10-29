
// lib/db/mongoose.ts

import crypto from 'node:crypto';
import { MongoClient, type Collection, type Db, type Filter } from 'mongodb';
import { env } from '@/env';

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
  public readonly options: SchemaOptions;
  private readonly schemaIndexes: SchemaIndex<T>[] = [];

  constructor(definition: SchemaDefinition<T>, options?: SchemaOptions) {
    this.definition = definition;
    this.options = options ?? {}; // ✅ toujours un objet
  }

  public index(fields: SchemaIndex<T>['fields'], options?: SchemaIndex<T>['options']): void {
    this.schemaIndexes.push({
      fields,
      options: options ?? {}, // ✅ évite undefined
    });
  }

  public get indexes(): SchemaIndex<T>[] {
    return [...this.schemaIndexes];
  }
}

export interface LeanDocumentBase {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
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

type MongoDocument<T extends LeanDocumentBase> = T & Record<string, unknown>;

let client: MongoClient | null = null;
let database: Db | null = null;

const collectionCache = new Map<string, Promise<Collection<MongoDocument<any>>>>();

function resolveDatabaseName(uri: string): string {
  try {
    const url = new URL(uri);
    const pathname = url.pathname.replace(/^\//, '');
    if (pathname) return pathname;
  } catch {
    // noop
  }
  return process.env.MONGODB_DB ?? 'chalet-manager';
}

async function getDatabase(): Promise<Db> {
  if (database) return database;

  const uri = env.NODE_ENV === 'test' && env.MONGODB_URI_TEST ? env.MONGODB_URI_TEST : env.MONGODB_URI;
  client = new MongoClient(uri);
  await client.connect();
  database = client.db(resolveDatabaseName(uri));
  return database;
}

async function getCollection<T extends LeanDocumentBase>(
  name: string,
  schema: Schema<T>,
): Promise<Collection<MongoDocument<T>>> {
  let promise = collectionCache.get(name);
  if (!promise) {
    promise = (async () => {
      const db = await getDatabase();
      const collection = db.collection<MongoDocument<T>>(name);

      if (schema.indexes.length > 0) {
        await Promise.all(
          schema.indexes.map(async (idx) =>
            collection.createIndex(
              idx.fields as Record<string, IndexDirection>,
              idx.options ?? {}, // ✅ évite undefined
            ),
          ),
        );
      }

      return collection;
    })();

    collectionCache.set(name, promise as Promise<Collection<MongoDocument<any>>>);
  }

  return promise as Promise<Collection<MongoDocument<T>>>;
}

function isPropertyDefinition<T>(value: unknown): value is SchemaDefinitionProperty<T> {
  return typeof value === 'object' && value !== null && 'type' in (value as Record<string, unknown>);
}

function applyDefaults<T extends LeanDocumentBase>(
  schema: Schema<T>,
  document: Partial<MongoDocument<T>>,
): MongoDocument<T> {
  const withDefaults: Record<string, unknown> = { ...document };

  for (const [key, value] of Object.entries(schema.definition)) {
    if (!isPropertyDefinition<unknown>(value)) continue;

    const currentValue = withDefaults[key];
    if (typeof currentValue === 'undefined' && typeof value.default !== 'undefined') {
      withDefaults[key] =
        typeof value.default === 'function'
          ? (value.default as () => unknown)()
          : value.default;
    }
  }

  return withDefaults as MongoDocument<T>;
}

export function model<T extends LeanDocumentBase>(name: string, schema: Schema<T>): Model<T> {
  async function create(
    payload: Omit<T, '_id' | 'createdAt' | 'updatedAt'> & Partial<LeanDocumentBase>
  ): Promise<T> {
    const collection = await getCollection(name, schema);
    const now = new Date();
    const defaultsApplied = applyDefaults(schema, payload as Partial<MongoDocument<T>>);

    const document = {
      ...defaultsApplied,
      _id: (payload._id ?? crypto.randomUUID()) as string,
      createdAt: payload.createdAt ?? now,
      updatedAt: payload.updatedAt ?? now,
    } as MongoDocument<T>; // ✅ cast ici

    await collection.insertOne(document as any);
    return document as T;
  }

  async function find(filter?: Partial<T>, options?: QueryOptions): Promise<T[]> {
    const collection = await getCollection(name, schema);
    const query = (filter ?? {}) as Filter<MongoDocument<T>>;
    let cursor = collection.find(query);

    if (options?.sort) cursor = cursor.sort(options.sort);
    if (typeof options?.skip === 'number') cursor = cursor.skip(options.skip);
    if (typeof options?.limit === 'number') cursor = cursor.limit(options.limit);

    const documents = await cursor.toArray();
    return documents.map((doc) => doc as T);
  }

  async function findOne(filter: Partial<T>): Promise<T | null> {
    const collection = await getCollection(name, schema);
    const document = await collection.findOne(filter as Filter<MongoDocument<T>>);
    return (document as T | null) ?? null;
  }

  async function findById(id: string): Promise<T | null> {
    return findOne({ _id: id } as Partial<T>);
  }

  async function findByIdAndUpdate(
    id: string,
    update: Partial<T>,
    options?: { new?: boolean }
  ): Promise<T | null> {
    const collection = await getCollection(name, schema);
    const now = new Date();

    const setPayload: Record<string, unknown> = {
      ...(update as Record<string, unknown>),
      updatedAt: now,
    };

    const filterById = { _id: id } as Filter<MongoDocument<T>>;

    const result = await collection.findOneAndUpdate(
      filterById,
      { $set: setPayload } as any, // ✅ cast pour éviter incompatibilité UpdateFilter
      {
        returnDocument: options?.new === false ? 'before' : 'after',
      }
    );

    const value = result?.value ?? null;
    return (value as T | null) ?? null;
  }

  async function findByIdAndDelete(id: string): Promise<T | null> {
    const collection = await getCollection(name, schema);
    const result = await collection.findOneAndDelete({ _id: id } as Filter<MongoDocument<T>>);
    return (result?.value as T | null) ?? null;
  }

  async function countDocuments(filter?: Partial<T>): Promise<number> {
    const collection = await getCollection(name, schema);
    return collection.countDocuments(filter as Filter<MongoDocument<T>> | undefined);
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
  await getDatabase();
}

export async function disconnectMongo(): Promise<void> {
  collectionCache.clear();
  if (client) {
    await client.close();
  }
  client = null;
  database = null;
}

export type InferSchemaType<S> = S extends Schema<infer T> ? T : never;
