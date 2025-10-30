import type { LeanDocumentBase, SchemaDefinition } from '../mongoose';
import { Schema, model } from '../mongoose';

export type PropertyStatus = 'draft' | 'published' | 'archived';

export interface PropertyImage {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  alt?: string;
  isHero: boolean;
}

export type CalendarSourceProvider = 'airbnb' | 'booking' | 'vrbo' | 'other';

export interface ExternalCalendar {
  provider: CalendarSourceProvider;
  url: string;
  active: boolean;
  lastSyncAt?: Date;
  lastStatus?: number;
  errorCount: number;
}

export type CalendarBlockSource = 'manual' | 'airbnb' | 'booking' | 'vrbo' | 'other';

export interface CalendarBlock {
  start: Date;
  end: Date;
  source: CalendarBlockSource;
  note?: string;
  createdBy?: string;
  createdAt: Date;
}

export interface Address {
  city?: string;
  country?: string;
  line1?: string;
  line2?: string;
  postalCode?: string;
}

export interface PropertyDocument extends LeanDocumentBase {
  title: string;
  slug: string;
  previousSlugs: string[];
  description?: string;
  status: PropertyStatus;
  publishedAt?: Date;
  ownerId: string;
  seasonalPeriod?: { start: Date; end: Date };
  regNumber?: string;
  capacity?: number;
  images: PropertyImage[];
  address: Address;
  externalCalendars: ExternalCalendar[];
  blocks: CalendarBlock[];
  heroImageId?: string;
  pricing?: { nightly: number; cleaningFee?: number };
  compliance?: { hasInsurance?: boolean; acceptsTerms?: boolean };
  createdAt: Date;
  updatedAt: Date;
}

const definition: SchemaDefinition<PropertyDocument> = {
  _id: { type: 'string' },
  title: { type: 'string', required: true },
  slug: { type: 'string', required: true },
  previousSlugs: { type: 'array' },
  description: { type: 'string' },
  status: { type: 'string', required: true },
  publishedAt: { type: 'date' },
  ownerId: { type: 'string', required: true },
  seasonalPeriod: { type: 'object' },
  regNumber: { type: 'string' },
  capacity: { type: 'number' },
  images: { type: 'array', default: () => [] as PropertyImage[] },
  address: { type: 'object', default: () => ({}) as Address },
  externalCalendars: { type: 'array', default: () => [] as ExternalCalendar[] },
  blocks: { type: 'array', default: () => [] as CalendarBlock[] },
  heroImageId: { type: 'string' },
  pricing: { type: 'object' },
  compliance: { type: 'object' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
};

const propertySchema = new Schema<PropertyDocument>(definition, { timestamps: true });
propertySchema.index({ slug: 1 }, { unique: true });
propertySchema.index({ status: 1, publishedAt: -1 });
propertySchema.index({ ownerId: 1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index({ 'address.city': 1 } as Record<string, 1>);
propertySchema.index({ title: 'text', 'address.city': 'text' } as Record<string, 'text'>);

export const PropertyModel = model<PropertyDocument>('properties', propertySchema);
