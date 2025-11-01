// lib/db/onboarding.ts
import { randomUUID } from 'node:crypto';
import { connectMongo } from './mongoose';
import { OnboardingDraftModel, type OnboardingDraftDocument } from './models/onboarding-draft';
import { updateUser } from './users';

export type OnboardingDraft = OnboardingDraftDocument;

// --- mémoire (fallback) : une entrée par userId ---
const inMemoryDrafts = new Map<string, OnboardingDraft>();
let hasLoggedMongoFallback = false;

const logMongoFallback = (error: unknown) => {
  if (hasLoggedMongoFallback) return;
  hasLoggedMongoFallback = true;
  console.warn('⚠️ MongoDB non disponible → fallback mémoire.', { error });
};

// Merge qui préserve explicitement "photos"
const mergeDraftData = (
  existingData: Record<string, unknown>,
  data: Record<string, unknown>
): Record<string, unknown> => {
  const merged = { ...existingData, ...data };
  if ('photos' in data) merged.photos = (data as any).photos;
  else if ('photos' in existingData) merged.photos = (existingData as any).photos;
  return merged;
};

// -------- READ --------
export async function getOnboardingDraft(userId: string): Promise<OnboardingDraft | null> {
  try {
    await connectMongo();
    return (await OnboardingDraftModel.findOne({ userId })) ?? null;
  } catch (error) {
    logMongoFallback(error);
    return inMemoryDrafts.get(userId) ?? null;
  }
}

// -------- UPSERT --------
export async function upsertOnboardingDraft(
  userId: string,
  role: 'OWNER' | 'TENANT',
  data: Record<string, unknown>
): Promise<OnboardingDraft> {
  try {
    await connectMongo();

    const existing = await OnboardingDraftModel.findOne({ userId });
    const mergedData = mergeDraftData(existing?.data ?? {}, data);

    // upsert sûr
    let draft = await OnboardingDraftModel.findOneAndUpdate(
      { userId },
      { userId, role, data: mergedData },
      { new: true, upsert: true }
    );

    if (!draft) {
      // Très rare: on relit juste au cas où
      draft = await OnboardingDraftModel.findOne({ userId });
    }

    if (!draft) {
      throw new Error('Draft non retrouvé juste après upsert.');
    }

    return draft;
  } catch (error) {
    logMongoFallback(error);

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
  }
}

// -------- DELETE (clear) --------
export async function clearOnboardingDraft(userId: string): Promise<void> {
  try {
    await connectMongo();
    // Certains typings custom n’exposent pas deleteOne; on caste pour TS
    await (OnboardingDraftModel as any).deleteOne({ userId });
  } catch (error) {
    logMongoFallback(error);
    inMemoryDrafts.delete(userId);
  }
}

// -------- COMPLETE --------
export async function completeOnboarding(userId: string): Promise<void> {
  await updateUser(userId, { onboardingCompleted: true });
  await clearOnboardingDraft(userId);
}
