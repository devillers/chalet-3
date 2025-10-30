import { connectMongo } from './mongoose';
import { TenantPreferenceModel, type TenantPreferenceDocument } from './models/tenant-preference';

export interface TenantPreferencePayload {
  city?: string;
  capacityMin?: number;
  budgetMax?: number;
  amenities?: string[];
}

export async function upsertTenantPreferences(
  userId: string,
  payload: TenantPreferencePayload,
): Promise<TenantPreferenceDocument> {
  await connectMongo();

  const normalizedAmenities = Array.from(
    new Set((payload.amenities ?? []).map((amenity) => amenity.trim()).filter(Boolean)),
  );

  const update: TenantPreferencePayload & { userId: string } = {
    userId,
    city: payload.city,
    capacityMin: payload.capacityMin,
    budgetMax: payload.budgetMax,
    amenities: normalizedAmenities,
  };

  console.debug('Upsert des préférences locataire dans MongoDB.', {
    userId,
    hasCity: Boolean(update.city),
    hasCapacity: typeof update.capacityMin === 'number',
    amenitiesCount: update.amenities?.length ?? 0,
  });

  const preferences = await TenantPreferenceModel.findOneAndUpdate(
    { userId },
    update,
    { new: true, upsert: true },
  );

  if (!preferences) {
    throw new Error('Échec de la sauvegarde des préférences locataire.');
  }

  console.debug('Préférences locataire sauvegardées avec succès.', {
    userId,
    preferenceId: preferences._id,
  });

  return preferences;
}

