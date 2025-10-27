import type { LeanDocumentBase, SchemaDefinition } from '../mongoose';
import { Schema, model } from '../mongoose';

export interface SeasonalListingDocument extends LeanDocumentBase {
  propertyId: string;
  season: string;
  start: Date;
  end: Date;
  nightlyPrice: number;
  minimumStay: number;
  createdAt: Date;
  updatedAt: Date;
}

const definition: SchemaDefinition<SeasonalListingDocument> = {
  _id: { type: 'string' },
  propertyId: { type: 'string', required: true },
  season: { type: 'string', required: true },
  start: { type: 'date', required: true },
  end: { type: 'date', required: true },
  nightlyPrice: { type: 'number', required: true },
  minimumStay: { type: 'number', required: true },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
};

const seasonalListingSchema = new Schema<SeasonalListingDocument>(definition, { timestamps: true });
seasonalListingSchema.index({ propertyId: 1, start: 1, end: 1 }, { unique: true });

export const SeasonalListingModel = model<SeasonalListingDocument>('seasonal_listings', seasonalListingSchema);
