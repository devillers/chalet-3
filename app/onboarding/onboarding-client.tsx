'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn, type UseFormWatch } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { defaultLocale } from '@/lib/i18n';
import {
  ownerOnboardingDraftSchema,
  ownerOnboardingSchema,
  tenantOnboardingDraftSchema,
  tenantOnboardingSchema,
  type OwnerOnboardingInput,
  type TenantOnboardingInput,
} from '@/lib/validators/onboarding';
import { isPlainObject, mergeDraftInto, sanitizeDraft } from '@/lib/utils/draft';

interface OnboardingClientProps {
  role: 'OWNER' | 'TENANT';
  openModal: boolean;
  draft: Record<string, unknown> | null;
  onOpenChange?: (open: boolean) => void;
}

interface StepConfig {
  id: string;
  label: string;
  description: string;
}

const OWNER_STEPS: StepConfig[] = [
  { id: 'profile', label: 'Profil', description: 'Vos informations personnelles' },
  { id: 'property', label: 'Logement', description: 'Créez le brouillon du logement' },
  { id: 'photos', label: 'Photos', description: 'Téléverser vos images via Cloudinary' },
  { id: 'season', label: 'Saisonnalité', description: 'Configurez les périodes disponibles' },
  { id: 'pricing', label: 'Tarifs', description: 'Définissez vos prix et frais' },
  { id: 'compliance', label: 'Conformité', description: 'Informations légales' },
  { id: 'review', label: 'Revue', description: 'Publier ou sauvegarder en brouillon' },
];

const TENANT_STEPS: StepConfig[] = [
  { id: 'profile', label: 'Profil', description: 'Informations personnelles' },
  { id: 'search', label: 'Recherche', description: 'Ville cible et critères' },
  { id: 'documents', label: 'Documents', description: 'Téléversez vos justificatifs' },
  { id: 'preferences', label: 'Préférences', description: 'Personnalisez votre expérience' },
  { id: 'review', label: 'Résumé', description: 'Vérifiez et finalisez' },
];

const createOwnerDefaultValues = (): OwnerOnboardingInput => ({
  profile: { firstName: '', lastName: '', phone: '' },
  property: { title: '', city: '', capacity: 1, regNumber: '' },
  photos: [],
  season: { start: '', end: '' },
  pricing: { nightly: 0, cleaningFee: 0 },
  compliance: { acceptsTerms: false, hasInsurance: false },
  review: { status: 'draft' },
});

const createTenantDefaultValues = (): TenantOnboardingInput => ({
  profile: { firstName: '', lastName: '', phone: '' },
  search: { city: '', capacity: 1 },
  documents: [],
  preferences: { amenities: [], budget: 0 },
  review: { status: 'draft' },
});

const resolveOwnerDefaultValues = (draft: Record<string, unknown> | null): OwnerOnboardingInput => {
  const base = createOwnerDefaultValues();
  const parsedDraft = ownerOnboardingDraftSchema.safeParse(draft ?? {});
  if (!parsedDraft.success) {
    return base;
  }
  return mergeDraftInto(base, parsedDraft.data);
};

const resolveTenantDefaultValues = (draft: Record<string, unknown> | null): TenantOnboardingInput => {
  const base = createTenantDefaultValues();
  const parsedDraft = tenantOnboardingDraftSchema.safeParse(draft ?? {});
  if (!parsedDraft.success) {
    return base;
  }
  return mergeDraftInto(base, parsedDraft.data);
};

export default function OnboardingClient({ role, openModal, draft, onOpenChange }: OnboardingClientProps) {
  if (role === 'OWNER') {
    return <OwnerOnboarding openModal={openModal} draft={draft} onOpenChange={onOpenChange} />;
  }
  return <TenantOnboarding openModal={openModal} draft={draft} onOpenChange={onOpenChange} />;
}

interface OwnerProps {
  openModal: boolean;
  draft: Record<string, unknown> | null;
  onOpenChange?: (open: boolean) => void;
}

function OwnerOnboarding({ openModal, draft, onOpenChange }: OwnerProps) {
  const router = useRouter();
  const form = useForm<OwnerOnboardingInput>({
    resolver: zodResolver(ownerOnboardingSchema),
    defaultValues: resolveOwnerDefaultValues(draft),
  });
  const [isOpen, setIsOpen] = useState(openModal);
  const [currentStep, setCurrentStep] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsOpen(openModal);
  }, [openModal]);

  const handleAutoSaved = useCallback((date: Date) => setLastSaved(date), []);
  useAutoSave(form.watch, 'OWNER', handleAutoSaved);

  const step = OWNER_STEPS[currentStep];

  const next = async () => {
    const valid = await form.trigger();
    if (!valid) {
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, OWNER_STEPS.length - 1));
  };

  const previous = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handlePublish = async () => {
    setSaving(true);
    setError(null);
    const isValid = await form.trigger();
    if (!isValid) {
      setSaving(false);
      return;
    }

    const payload = { ...form.getValues(), review: { status: 'published' as const } };

    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as { redirectTo?: string; message?: string } | null;
      if (!response.ok) {
        setError(data?.message ?? 'Impossible de finaliser la publication.');
        return;
      }

      const destination = data?.redirectTo ?? `/${defaultLocale}/dashboard/owner`;
      router.push(destination);
    } catch (error_) {
      console.error('Failed to publish onboarding draft', error_);
      setError('Impossible de finaliser la publication.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setIsOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Onboarding propriétaire</DialogTitle>
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <Stepper steps={OWNER_STEPS} currentStep={currentStep} />
          <Form {...form}>
            <form className="space-y-6">
              <OwnerStepRenderer form={form} stepId={step.id} />
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {lastSaved ? `Sauvegardé ${lastSaved.toLocaleTimeString()}` : 'Sauvegarde automatique active'}
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={previous} disabled={currentStep === 0}>
                    Étape précédente
                  </Button>
                  {currentStep < OWNER_STEPS.length - 1 ? (
                    <Button type="button" onClick={next}>
                      Étape suivante
                    </Button>
                  ) : (
                    <Button type="button" onClick={handlePublish} disabled={saving}>
                      {saving ? 'Publication...' : 'Publier'}
                    </Button>
                  )}
                </div>
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TenantProps {
  openModal: boolean;
  draft: Record<string, unknown> | null;
  onOpenChange?: (open: boolean) => void;
}

function TenantOnboarding({ openModal, draft, onOpenChange }: TenantProps) {
  const router = useRouter();
  const form = useForm<TenantOnboardingInput>({
    resolver: zodResolver(tenantOnboardingSchema),
    defaultValues: resolveTenantDefaultValues(draft),
  });
  const [isOpen, setIsOpen] = useState(openModal);
  const [currentStep, setCurrentStep] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsOpen(openModal);
  }, [openModal]);

  const handleTenantAutoSaved = useCallback((date: Date) => setLastSaved(date), []);
  useAutoSave(form.watch, 'TENANT', handleTenantAutoSaved);

  const step = TENANT_STEPS[currentStep];

  const next = async () => {
    const valid = await form.trigger();
    if (!valid) {
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, TENANT_STEPS.length - 1));
  };

  const previous = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleFinalize = async () => {
    setSaving(true);
    setError(null);
    const isValid = await form.trigger();
    if (!isValid) {
      setSaving(false);
      return;
    }

    const payload = { ...form.getValues(), review: { status: 'ready' as const } };

    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as { redirectTo?: string; message?: string } | null;
      if (!response.ok) {
        setError(data?.message ?? "Impossible de finaliser l'onboarding.");
        return;
      }

      const destination = data?.redirectTo ?? `/${defaultLocale}/dashboard/tenant`;
      router.push(destination);
    } catch (error_) {
      console.error('Failed to finalise tenant onboarding', error_);
      setError("Impossible de finaliser l'onboarding.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setIsOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Onboarding locataire</DialogTitle>
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>
        <Stepper steps={TENANT_STEPS} currentStep={currentStep} />
        <Form {...form}>
          <form className="space-y-6">
            <TenantStepRenderer form={form} stepId={step.id} />
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {lastSaved ? `Sauvegardé ${lastSaved.toLocaleTimeString()}` : 'Sauvegarde automatique active'}
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={previous} disabled={currentStep === 0}>
                  Précédent
                </Button>
                {currentStep < TENANT_STEPS.length - 1 ? (
                  <Button type="button" onClick={next}>
                    Suivant
                  </Button>
                ) : (
                  <Button type="button" onClick={handleFinalize} disabled={saving}>
                    {saving ? 'Finalisation...' : 'Finaliser'}
                  </Button>
                )}
              </div>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface StepperProps {
  steps: StepConfig[];
  currentStep: number;
}

function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <div key={step.id} className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                isActive ? 'bg-primary text-primary-foreground' : isCompleted ? 'bg-muted text-foreground' : 'bg-secondary'
              }`}
            >
              {index + 1}
            </span>
            <div>
              <p className="font-medium">{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface OwnerStepRendererProps {
  form: UseFormReturn<OwnerOnboardingInput>;
  stepId: string;
}

function OwnerStepRenderer({ form, stepId }: OwnerStepRendererProps) {
  switch (stepId) {
    case 'profile':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="profile.firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Jean" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profile.lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Dupont" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profile.phone"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="+33 6 12 34 56 78" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    case 'property':
      return (
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="property.title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du logement</FormLabel>
                <FormControl>
                  <Input placeholder="Chalet Alpin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="property.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville</FormLabel>
                  <FormControl>
                    <Input placeholder="Chamonix" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="property.capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacité</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="property.regNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro d&apos;enregistrement</FormLabel>
                <FormControl>
                  <Input placeholder="742990000000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator />
          <p className="text-sm text-muted-foreground">
            Un brouillon de propriété est créé automatiquement à cette étape.
          </p>
        </div>
      );
    case 'photos':
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Les téléchargements s&apos;effectuent via Cloudinary (signature sécurisée). Ajoutez au moins une image héros.
          </p>
          <FormField
            control={form.control}
            name="photos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URLs des photos (séparées par des retours à la ligne)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="https://res.cloudinary.com/..."
                    value={(field.value ?? [])
                      .map((photo) => (typeof photo === 'string' ? photo : photo.url ?? ''))
                      .filter(Boolean)
                      .join('\n')}
                    onChange={(event) => {
                      const urls = event.target.value
                        .split('\n')
                        .map((url) => url.trim())
                        .filter(Boolean);
                      field.onChange(
                        urls.map((url, index) => ({
                          publicId: `draft-${index}`,
                          url,
                          alt: `Photo ${index + 1}`,
                          isHero: index === 0,
                          width: 0,
                          height: 0,
                          format: 'jpg',
                          bytes: 0,
                        }))
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    case 'season':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="season.start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de début</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="season.end"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de fin</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    case 'pricing':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="pricing.nightly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tarif nuitée (€)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step="1" {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pricing.cleaningFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frais de ménage (€)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step="1" {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    case 'compliance':
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="compliance.hasInsurance"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Checkbox checked={field.value ?? false} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                </FormControl>
                <div>
                  <FormLabel className="text-sm">Je possède une assurance responsabilité civile</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="compliance.acceptsTerms"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Checkbox checked={field.value ?? false} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                </FormControl>
                <div>
                  <FormLabel className="text-sm">J&apos;accepte les conditions générales</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    case 'review':
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Vérifiez les informations avant publication. Vous pouvez rester en brouillon tant que la photo héros, la ville, la
            capacité et le numéro d&apos;enregistrement ne sont pas définis.
          </p>
        </div>
      );
    default:
      return null;
  }
}

interface TenantStepRendererProps {
  form: UseFormReturn<TenantOnboardingInput>;
  stepId: string;
}

function TenantStepRenderer({ form, stepId }: TenantStepRendererProps) {
  switch (stepId) {
    case 'profile':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="profile.firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Marie" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profile.lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Durand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profile.phone"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="+33 6 98 76 54 32" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    case 'search':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="search.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville recherchée</FormLabel>
                <FormControl>
                  <Input placeholder="Megève" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="search.capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de personnes</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    case 'documents':
      return (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="documents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Liste de documents (URL)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="https://res.cloudinary.com/..."
                    value={(field.value ?? []).map((doc) => doc.url ?? '').join('\n')}
                    onChange={(event) => {
                      const docs = event.target.value
                        .split('\n')
                        .map((url, index) => ({ name: `Document ${index + 1}`, url: url.trim() }))
                        .filter((doc) => doc.url);
                      field.onChange(docs);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    case 'preferences':
      return (
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="preferences.amenities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Équipements souhaités (séparés par des virgules)</FormLabel>
                <FormControl>
                  <Input
                    value={(field.value ?? []).join(', ')}
                    onChange={(event) => field.onChange(event.target.value.split(',').map((item) => item.trim()).filter(Boolean))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="preferences.budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget mensuel (€)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step="1" {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    case 'review':
      return (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Vérifiez vos informations puis finalisez l&apos;onboarding.</p>
        </div>
      );
    default:
      return null;
  }
}

function useAutoSave<T extends OwnerOnboardingInput | TenantOnboardingInput>(
  watch: UseFormWatch<T>,
  role: 'OWNER' | 'TENANT',
  onSaved?: (date: Date) => void,
) {
  const [draft, setDraft] = useState<T | null>(null);
  const lastSerializedDraft = useRef<string | null>(null);

  useEffect(() => {
    const subscription = watch((value) => {
      setDraft(value as T);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (!draft) {
      return;
    }

    const schema = role === 'OWNER' ? ownerOnboardingDraftSchema : tenantOnboardingDraftSchema;
    const sanitized = sanitizeDraft(draft);
    const payload = isPlainObject(sanitized) ? sanitized : {};
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return;
    }

    const serialized = JSON.stringify(parsed.data);
    if (lastSerializedDraft.current === serialized) {
      return;
    }
    lastSerializedDraft.current = serialized;

    const timeout = setTimeout(() => {
      void fetch('/api/onboarding/draft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: serialized,
      })
        .then((response) => {
          if (!response.ok) {
            console.error('Échec de la sauvegarde automatique du brouillon');
            lastSerializedDraft.current = null;
            return;
          }
          onSaved?.(new Date());
        })
        .catch((error) => {
          console.error('Erreur lors de la sauvegarde automatique', error);
          lastSerializedDraft.current = null;
        });
    }, 800);
    return () => clearTimeout(timeout);
  }, [draft, role, onSaved]);
}
