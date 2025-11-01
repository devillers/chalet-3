import { randomUUID } from 'node:crypto';
import mongoose, {
  Schema as MongooseSchema,
  type ConnectOptions,
  type Model as MongooseModel,
} from 'mongoose';

import { env } from '@/env';

export type IndexDirection = 1 | -1 | 'text';

export interface SchemaIndex<T> {
  fields: Partial<Record<keyof T & string, IndexDirection>> & Record<string, IndexDirection>;
  options?: {
    unique?: boolean;
    sparse?: boolean;
  };
}

type PrimitiveSchemaType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';

export interface SchemaDefinitionProperty<T> {
  type: PrimitiveSchemaType;
  required?: boolean;
  default?: T | (() => T);
}

export type SchemaDefinition<T> = {
  [K in keyof T & string]: SchemaDefinitionProperty<T[K]> | SchemaDefinition<T[K]>;
};

export interface SchemaOptions {
  timestamps?: boolean;
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
  findOneAndUpdate(
    filter: Partial<T>,
    update: Partial<T>,
    options?: { new?: boolean; upsert?: boolean },
  ): Promise<T | null>;
  findByIdAndDelete(id: string): Promise<T | null>;
  countDocuments(filter?: Partial<T>): Promise<number>;
}

const primitiveTypeMap: Record<PrimitiveSchemaType, unknown> = {
  string: String,
  number: Number,
  boolean: Boolean,
  date: Date,
  object: MongooseSchema.Types.Mixed,
  array: [MongooseSchema.Types.Mixed],
};

function isPropertyDefinition<T>(value: unknown): value is SchemaDefinitionProperty<T> {
  return typeof value === 'object' && value !== null && 'type' in (value as Record<string, unknown>);
}

function convertDefinition<T>(definition: SchemaDefinition<T>): Record<string, unknown> {
  const converted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(definition)) {
    if (isPropertyDefinition(value)) {
      const mappedType = primitiveTypeMap[value.type];
      if (!mappedType) {
        throw new Error(`Unsupported schema type "${value.type}" for key "${key}".`);
      }

      const property: Record<string, unknown> = { type: mappedType };

      if (value.required) {
        property.required = true;
      }

      if (typeof value.default !== 'undefined') {
        property.default = value.default;
      } else if (key === '_id' && value.type === 'string') {
        property.default = () => randomUUID();
      }

      if (key === '_id') {
        property.immutable = true;
      }

      converted[key] = property;
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      converted[key] = convertDefinition(value as SchemaDefinition<unknown>);
    }
  }

  return converted;
}

export class Schema<T extends LeanDocumentBase> {
  public readonly mongooseSchema: MongooseSchema<T>;

  constructor(definition: SchemaDefinition<T>, options?: SchemaOptions) {
    const convertedDefinition = convertDefinition(definition);

    this.mongooseSchema = new MongooseSchema<T>(convertedDefinition, {
      timestamps: options?.timestamps ?? false,
      versionKey: false,
      minimize: false,
    });
  }

  public index(fields: SchemaIndex<T>['fields'], options?: SchemaIndex<T>['options']): void {
    this.mongooseSchema.index(fields as Record<string, IndexDirection>, options ?? {});
  }
}

function resolveDatabaseName(uri: string): string | undefined {
  try {
    const url = new URL(uri);
    const pathname = url.pathname.replace(/^\//, '');
    if (pathname) return pathname;
  } catch {
    // noop
  }

  return process.env.MONGODB_DB ?? 'chalet-manager';
}

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    const uri = env.NODE_ENV === 'test' && env.MONGODB_URI_TEST ? env.MONGODB_URI_TEST : env.MONGODB_URI;
    const dbName = resolveDatabaseName(uri);

    mongoose.set('strictQuery', false);
    const options: ConnectOptions = {};
    if (dbName) {
      options.dbName = dbName;
    }

    connectionPromise = mongoose.connect(uri, options);
  }

  await connectionPromise;
}

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  connectionPromise = null;
}

function getModel<T extends LeanDocumentBase>(name: string, schema: Schema<T>): MongooseModel<T> {
  const existing = (mongoose.models[name] as MongooseModel<T> | undefined) ?? null;
  if (existing) {
    return existing;
  }

  return mongoose.model<T>(name, schema.mongooseSchema);
}

export function model<T extends LeanDocumentBase>(name: string, schema: Schema<T>): Model<T> {
  const mongooseModel = getModel(name, schema);

  return {
    async create(payload) {
      const document = await mongooseModel.create(payload as any);
      return document.toObject({ getters: false, virtuals: false }) as T;
    },

    async find(filter, options) {
      let query = mongooseModel.find(filter ?? {});

      if (options?.sort) {
        query = query.sort(options.sort);
      }

      if (typeof options?.skip === 'number') {
        query = query.skip(options.skip);
      }

      if (typeof options?.limit === 'number') {
        query = query.limit(options.limit);
      }

      const documents = await query.lean().exec();
      return documents as T[];
    },

    async findOne(filter) {
      const document = await mongooseModel.findOne(filter as any).lean().exec();
      return (document as T | null) ?? null;
    },

    async findById(id) {
      const document = await mongooseModel.findById(id).lean().exec();
      return (document as T | null) ?? null;
    },

    async findByIdAndUpdate(id, update, options) {
      const document = await mongooseModel
        .findByIdAndUpdate(id, update as any, {
          new: options?.new ?? true,
          setDefaultsOnInsert: true,
        })
        .lean()
        .exec();

      return (document as T | null) ?? null;
    },

    async findOneAndUpdate(filter, update, options) {
      const document = await mongooseModel
        .findOneAndUpdate(filter as any, update as any, {
          new: options?.new ?? true,
          upsert: options?.upsert ?? false,
          setDefaultsOnInsert: true,
        })
        .lean()
        .exec();

      return (document as T | null) ?? null;
    },

    async findByIdAndDelete(id) {
      const document = await mongooseModel.findByIdAndDelete(id).lean().exec();
      return (document as T | null) ?? null;
    },

    async countDocuments(filter) {
      return mongooseModel.countDocuments(filter ?? {}).exec();
    },
  };
}

export type InferSchemaType<S> = S extends Schema<infer T> ? T : never;
