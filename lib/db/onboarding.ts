// lib/db/onboarding.ts
import { randomUUID } from 'node:crypto';
import { connectMongo } from './mongoose';
import { OnboardingDraftModel, type OnboardingDraftDocument } from './models/onboarding-draft';
import { updateUser } from './users';

export type OnboardingDraft = OnboardingDraftDocument;

const inMemoryDrafts = new Map<string, OnboardingDraft>();
let hasLoggedMongoFallback = false;

const logMongoFallback = (error: unknown) => {
  if (hasLoggedMongoFallback) {
    return;
  }

  hasLoggedMongoFallback = true;

  console.warn('MongoDB non disponible, bascule vers le stockage en mémoire pour les brouillons.', {
    error,
  });
};

const mergeDraftData = (
  existingData: Record<string, unknown>,
  data: Record<string, unknown>,
): Record<string, unknown> => {
  const mergedData: Record<string, unknown> = {
    ...existingData,
    ...data,
  };

  const incomingPhotos = (data as { photos?: unknown }).photos;
  const existingPhotos = (existingData as { photos?: unknown }).photos;
  if (incomingPhotos !== undefined) {
    mergedData.photos = incomingPhotos;
  } else if (existingPhotos !== undefined) {
    mergedData.photos = existingPhotos;
  } else {
    mergedData.photos = [];
  }

  return mergedData;
};

const upsertDraftInMemory = (
  userId: string,
  role: 'OWNER' | 'TENANT',
  data: Record<string, unknown>,
): OnboardingDraft => {
  const now = new Date();
  const existingDraft = inMemoryDrafts.get(userId);
  const mergedData = mergeDraftData(existingDraft?.data ?? {}, data);

  const nextDraft: OnboardingDraft = {
    _id: existingDraft?._id ?? randomUUID(),
    userId,
    role,
    data: mergedData,
    createdAt: existingDraft?.createdAt ?? now,
    updatedAt: now,
  };

  inMemoryDrafts.set(userId, nextDraft);
  return nextDraft;
};

export async function getOnboardingDraft(userId: string): Promise<OnboardingDraft | null> {
  try {
    await connectMongo();
    console.debug('Recherche du brouillon d\'onboarding dans MongoDB.', { userId });
    return OnboardingDraftModel.findOne({ userId });
  } catch (error) {
    logMongoFallback(error);
    console.debug('Recherche du brouillon d\'onboarding dans le stockage mémoire.', { userId });
    return inMemoryDrafts.get(userId) ?? null;
  }
}

/**
 * ✅ CORRECTION: Upsert qui préserve TOUTES les données
 */
export async function upsertOnboardingDraft(
  userId: string,
  role: 'OWNER' | 'TENANT',
  data: Record<string, unknown>,
): Promise<OnboardingDraft> {
  try {
    await connectMongo();

    console.debug('Upsert du brouillon d\'onboarding dans MongoDB.', {
      userId,
      role,
      keys: Object.keys(data ?? {}),
      // ✅ Log des données critiques
      hasSeason: !!(data as any).season,
      hasPhotos: !!((data as any).photos?.length),
      hasPricing: !!(data as any).pricing,
      hasCompliance: !!(data as any).compliance,
    });

    const existingDraft = await OnboardingDraftModel.findOne({ userId });
    const existingData = (existingDraft?.data ?? {}) as Record<string, unknown>;
    const mergedData = mergeDraftData(existingData, data);

    const operation = existingDraft ? 'update' : 'create';

    const draft = await OnboardingDraftModel.findOneAndUpdate(
      { userId },
      {
        userId,
        role,
        data: mergedData,
      },
      { new: true, upsert: true },
    );

    if (!draft) {
      throw new Error('Échec de la sauvegarde du brouillon d\'onboarding.');
    }

    console.debug(
      operation === 'update' ? 'Brouillon mis à jour avec succès.' : 'Brouillon créé avec succès.',
      {
        userId,
        draftId: draft._id.toString(),
        photosCount: ((draft.data as any).photos?.length ?? 0),
      },
    );

    return draft;
  } catch (error) {
    logMongoFallback(error);

    console.debug('Sauvegarde du brouillon dans le stockage mémoire (fallback).', {
      userId,
      role,
      keys: Object.keys(data ?? {}),
    });

    return upsertDraftInMemory(userId, role, data);
  }
}

export async function clearOnboardingDraft(userId: string): Promise<void> {
  try {
    await connectMongo();
    const draft = await OnboardingDraftModel.findOne({ userId });
    if (draft) {
      console.debug('Suppression du brouillon après finalisation.', {
        userId,
        draftId: draft._id.toString(),
      });
      await OnboardingDraftModel.findByIdAndDelete(draft._id);
    }
  } catch (error) {
    logMongoFallback(error);
    if (inMemoryDrafts.delete(userId)) {
      console.debug('Suppression du brouillon en mémoire après finalisation.', { userId });
    }
  }
}

/**
 * ✅ CORRECTION: Fonction qui marque l'onboarding comme complété
 * et synchronise les données entre les collections
 */
export async function completeOnboarding(userId: string): Promise<void> {
  console.info('Marquage de l\'onboarding comme complété.', { userId });
  
  // ✅ Marquer l'utilisateur comme ayant complété l'onboarding
  await updateUser(userId, { onboardingCompleted: true });
  
  // ✅ Nettoyer le draft après finalisation
  await clearOnboardingDraft(userId);
}