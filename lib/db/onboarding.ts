interface OnboardingDraft {
  userId: string;
  role: 'OWNER' | 'TENANT';
  data: Record<string, unknown>;
  updatedAt: Date;
}

const drafts = new Map<string, OnboardingDraft>();

export async function getOnboardingDraft(userId: string): Promise<OnboardingDraft | null> {
  return drafts.get(userId) ?? null;
}

export async function upsertOnboardingDraft(userId: string, role: 'OWNER' | 'TENANT', data: Record<string, unknown>) {
  drafts.set(userId, { userId, role, data, updatedAt: new Date() });
  return drafts.get(userId)!;
}
