import { connectMongo } from './mongoose';
import { OnboardingDraftModel, type OnboardingDraftDocument } from './models/onboarding-draft';
import { updateUser } from './users';

export type OnboardingDraft = OnboardingDraftDocument;

export async function getOnboardingDraft(userId: string): Promise<OnboardingDraft | null> {
  await connectMongo();
  return OnboardingDraftModel.findOne({ userId });
}

export async function upsertOnboardingDraft(
  userId: string,
  role: 'OWNER' | 'TENANT',
  data: Record<string, unknown>,
): Promise<OnboardingDraft> {
  await connectMongo();

  const existingDraft = await OnboardingDraftModel.findOne({ userId });
  if (existingDraft) {
    const updated = await OnboardingDraftModel.findByIdAndUpdate(
      existingDraft._id,
      { role, data },
      { new: true },
    );
    if (updated) {
      return updated;
    }
  }

  return OnboardingDraftModel.create({ userId, role, data });
}

export async function clearOnboardingDraft(userId: string): Promise<void> {
  await connectMongo();
  const draft = await OnboardingDraftModel.findOne({ userId });
  if (draft) {
    await OnboardingDraftModel.findByIdAndDelete(draft._id);
  }
}

export async function completeOnboarding(userId: string): Promise<void> {
  await updateUser(userId, { onboardingCompleted: true });
  await clearOnboardingDraft(userId);
}

