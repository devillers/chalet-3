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
  } else {
    console.debug('Création d\'un nouveau brouillon.', { userId, role });
  }

  const draft = await OnboardingDraftModel.findOneAndUpdate(
    { userId },
    { userId, role, data },
    { new: true, upsert: true },
  );

  if (!draft) {
    throw new Error('Échec de l\'enregistrement du brouillon d\'onboarding.');
  }

  console.debug(existingDraft ? 'Brouillon mis à jour avec succès.' : 'Brouillon créé avec succès.', {
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

export async function completeOnboarding(userId: string): Promise<void> {
  console.info('Marquage de l\'onboarding comme complété.', { userId });
  await updateUser(userId, { onboardingCompleted: true });
  await clearOnboardingDraft(userId);
}

