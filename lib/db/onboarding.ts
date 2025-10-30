import { updateUser } from './users';

export interface OnboardingDraft {
  userId: string;
  role: 'OWNER' | 'TENANT';
  data: Record<string, unknown>;
  updatedAt: Date;
}

const drafts = new Map<string, OnboardingDraft>();

export async function getOnboardingDraft(userId: string): Promise<OnboardingDraft | null> {
  return drafts.get(userId) ?? null;
}

export async function upsertOnboardingDraft(
  userId: string,
  role: 'OWNER' | 'TENANT',
  data: Record<string, unknown>,
): Promise<OnboardingDraft> {
  const draft: OnboardingDraft = { userId, role, data, updatedAt: new Date() };
  drafts.set(userId, draft);
  return draft;
}

export async function clearOnboardingDraft(userId: string): Promise<void> {
  drafts.delete(userId);
}

export async function completeOnboarding(userId: string): Promise<void> {
  await updateUser(userId, { onboardingCompleted: true });
  drafts.delete(userId);
}
