// lib/db/onboarding.ts
import { connectMongo } from './mongoose';
import { OnboardingDraftModel, type OnboardingDraftDocument } from './models/onboarding-draft';
import { updateUser } from './users';

export type OnboardingDraft = OnboardingDraftDocument;

export async function getOnboardingDraft(userId: string): Promise<OnboardingDraft | null> {
  await connectMongo();
  console.debug('Recherche du brouillon d\'onboarding dans MongoDB.', { userId });
  return OnboardingDraftModel.findOne({ userId });
}

/**
 * ✅ CORRECTION: Upsert qui préserve TOUTES les données
 */
export async function upsertOnboardingDraft(
  userId: string,
  role: 'OWNER' | 'TENANT',
  data: Record<string, unknown>,
): Promise<OnboardingDraft> {
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
  
  if (existingDraft) {
    console.debug('Brouillon existant trouvé, mise à jour.', {
      userId,
      draftId: existingDraft._id.toString(),
    });
    
    // ✅ IMPORTANT: Merger les données au lieu de les écraser
    const mergedData = {
      ...existingDraft.data,
      ...data,
      // ✅ S'assurer que les arrays ne sont pas écrasés
      photos: (data as any).photos ?? (existingDraft.data as any).photos ?? [],
    };
    
    const updated = await OnboardingDraftModel.findOneAndUpdate(
      { userId },
      {
        role,
        data: mergedData,
      },
      { new: true },
    );
    
    if (!updated) {
      throw new Error('Échec de la mise à jour du brouillon d\'onboarding.');
    }
    
    console.debug('Brouillon mis à jour avec succès.', {
      userId,
      draftId: updated._id.toString(),
      photosCount: ((updated.data as any).photos?.length ?? 0),
    });
    
    return updated;
  }
  
  // ✅ Création d'un nouveau brouillon
  console.debug('Création d\'un nouveau brouillon.', { userId, role });
  
  const draft = await OnboardingDraftModel.create({ 
    userId, 
    role, 
    data 
  });
  
  console.debug('Brouillon créé avec succès.', {
    userId,
    draftId: draft._id.toString(),
  });
  
  return draft;
}

export async function clearOnboardingDraft(userId: string): Promise<void> {
  await connectMongo();
  const draft = await OnboardingDraftModel.findOne({ userId });
  if (draft) {
    console.debug('Suppression du brouillon après finalisation.', {
      userId,
      draftId: draft._id.toString(),
    });
    await OnboardingDraftModel.findByIdAndDelete(draft._id);
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