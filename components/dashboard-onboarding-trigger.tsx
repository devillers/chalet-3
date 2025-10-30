'use client';

import { useCallback, useEffect, useState } from 'react';

import OnboardingClient from '@/app/onboarding/onboarding-client';
import { Button, type ButtonProps } from '@/components/ui/button';

interface DashboardOnboardingTriggerProps {
  role: 'OWNER' | 'TENANT';
  draft: Record<string, unknown> | null;
  label: string;
  defaultOpen?: boolean;
  buttonVariant?: ButtonProps['variant'];
  buttonSize?: ButtonProps['size'];
  prefill?: Record<string, unknown> | null;
}

export default function DashboardOnboardingTrigger({
  role,
  draft,
  label,
  defaultOpen = false,
  buttonVariant,
  buttonSize,
  prefill,
}: DashboardOnboardingTriggerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <>
      <Button type="button" variant={buttonVariant} size={buttonSize} onClick={handleOpen}>
        {label}
      </Button>
      <OnboardingClient role={role} openModal={isOpen} draft={draft} onOpenChange={setIsOpen} prefill={prefill ?? undefined} />
    </>
  );
}
