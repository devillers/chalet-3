// lib/db/onboarding.ts

import { randomUUID } from 'node:crypto';
import { connectMongo } from './mongoose';
import { OnboardingDraftModel, type OnboardingDraftDocument } from './models/onboarding-draft';
import { updateUser } from './users';

export type OnboardingDraft = OnboardingDraftDocument;

const inMemoryDrafts = new Map<string, OnboardingDraft>();
let hasLoggedMongoFallback = false;

// ✅ Log Mongo fallback only once
const logMongoFallback = (error: unknown) => {
  if (hasLoggedMongoFallback) return;
  hasLoggedMongoFallback = true;
  console.warn('⚠️ MongoDB non disponible → utilisation du stockage en mémoire.', { error });
};

// ✅ Preserve all keys (especially photos)
const mergeDraftData = (
  existingData: Record<string, unknown>,
  data: Record<string, unknown>
): Record<string, unknown> => {
  const merged = { ...existingData, ...data };
  if ('photos' in data) merged.photos = data.photos;
  else if ('photos' in existingData) merged.photos = existingData.photos;
  return merged;
};

// ✅ In-memory fallback storage
const upsertDraftInMemory = (
  userId: string,
  role: 'OWNER' | 'TENANT',
  data: Record<string, unknown>
): OnboardingDraft => {
  const now = new Date();
  const existing = inMemoryDrafts.get(userId);
  const mergedData = mergeDraftData(existing?.data ?? {}, data);

  const draft: OnboardingDraft = {
    _id: existing?._id ?? randomUUID(),
    userId,
    role,
    data: mergedData,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  inMemoryDrafts.set(userId, draft);
  return draft;
};

// ✅ Read draft with full Mongo → memory fallback
export async function getOnboardingDraft(userId: string): Promise<OnboardingDraft | null> {
  try {
    await connectMongo();
    console.debug('Recherche du brouillon d\'onboarding dans MongoDB.', { userId });
    return (await OnboardingDraftModel.findOne({ userId })) ?? null;
  } catch (error) {
    logMongoFallback(error);
    console.debug('→ Recherche dans le stockage mémoire.', { userId });
    return inMemoryDrafts.get(userId) ?? null;
  }
}

// ✅ Upsert fully fixed (NO MORE findOneAndUpdate null error)
export async function upsertOnboardingDraft(
  userId: string,
  role: 'OWNER' | 'TENANT',
  data: Record<string, unknown>
): Promise<OnboardingDraft> {
  try {
    await connectMongo();

    console.debug('Upsert du brouillon dans MongoDB.', {
      userId,
      role,
      keys: Object.keys(data),
      hasPhotos: !!(data as any).photos,
    });

    const existingDraft = await OnboardingDraftModel.findOne({ userId });
    const mergedData = mergeDraftData(existingDraft?.data ?? {}, data);

    // 🔥 MongoDB safe upsert:
    let draft = await OnboardingDraftModel.findOneAndUpdate(
      { userId },
      { userId, role, data: mergedData },
      { new: true, upsert: true }
    );

    // ⚠ If result is null → create instead of throwing error
    if (!draft) {
      console.warn('⚠️ MongoDB findOneAndUpdate returned null → using create()');
      draft = await OnboardingDraftModel.create({
        _id: randomUUID(),
        userId,
        role,
        data: mergedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.debug('✅ Brouillon sauvegardé dans MongoDB.', {
      userId,
      draftId: draft._id,
    });

    return draft;
  } catch (error) {
    logMongoFallback(error);
    console.debug('💾 → Sauvegarde dans le stockage mémoire', {
      userId,
      role,
      keys: Object.keys(data ?? {}),
    });
    return upsertDraftInMemory(userId, role, data);
  }
}

// ✅ Delete draft after final onboarding submission
export async function clearOnboardingDraft(userId: string): Promise<void> {
  try {
    await connectMongo();
    const draft = await OnboardingDraftModel.findOne({ userId });
    if (draft) {
      console.debug('🗑 Suppression brouillon MongoDB.', { userId });
      await OnboardingDraftModel.findByIdAndDelete(draft._id);
    }
  } catch (error) {
    logMongoFallback(error);
    inMemoryDrafts.delete(userId);
  }
}

// ✅ Finalize onboarding
export async function completeOnboarding(userId: string): Promise<void> {
  console.info('🎉 Onboarding terminé → mise à jour utilisateur.', { userId });
  await updateUser(userId, { onboardingCompleted: true });
  await clearOnboardingDraft(userId);
}
