import { connectMongo } from './mongoose';
import { OnboardingDraftModel, type OnboardingDraftDocument } from './models/onboarding-draft';
import { updateUser } from './users';

export type OnboardingDraft = OnboardingDraftDocument;

export async function getOnboardingDraft(userId: string): Promise<OnboardingDraft | null> {
  await connectMongo();
  console.debug('Recherche du brouillon d\'onboarding dans MongoDB.', { userId });
  return OnboardingDraftModel.findOne({ userId });
}

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
  });

  const existingDraft = await OnboardingDraftModel.findOne({ userId });
  if (existingDraft) {
    console.debug('Brouillon existant trouvé, mise à jour.', {
      userId,
      draftId: existingDraft._id.toString(),
    });
    const updated = await OnboardingDraftModel.findByIdAndUpdate(
      existingDraft._id,
      { role, data },
      { new: true },
    );
    if (updated) {
      console.debug('Brouillon mis à jour avec succès.', {
        userId,
        draftId: updated._id.toString(),
      });
      return updated;
    }

    console.warn('Échec de la mise à jour du brouillon existant, nouvelle tentative via userId.', {
      userId,
      draftId: existingDraft._id.toString(),
    });

    const fallback = await OnboardingDraftModel.findOne({ userId });
    if (fallback) {
      console.debug('Brouillon récupéré après tentative de mise à jour infructueuse.', {
        userId,
        draftId: fallback._id.toString(),
      });
      return fallback;
    }
  }

  console.debug('Création d\'un nouveau brouillon.', { userId, role });
  try {
    return await OnboardingDraftModel.create({ userId, role, data });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: number }).code === 11000) {
      console.warn('Conflit de clé unique lors de la création du brouillon, récupération du document existant.', {
        userId,
        role,
      });
      const existing = await OnboardingDraftModel.findOne({ userId });
      if (existing) {
        console.debug('Brouillon existant renvoyé après conflit de clé unique.', {
          userId,
          draftId: existing._id.toString(),
        });
        return existing;
      }
    }

    throw error;
  }
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

export async function completeOnboarding(userId: string): Promise<void> {
  console.info('Marquage de l\'onboarding comme complété.', { userId });
  await updateUser(userId, { onboardingCompleted: true });
  await clearOnboardingDraft(userId);
}

