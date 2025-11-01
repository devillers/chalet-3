// app/onboarding/onboarding-client.tsx

'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldPath, type UseFormReturn, type UseFormWatch } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from '@/hooks/use-toast';
import { OwnerPhotosDropzone } from './components/owner-photos-dropzone';

interface OnboardingClientProps {
  role: 'OWNER' | 'TENANT';
  openModal: boolean;
  draft: Record<string, unknown> | null;
  onOpenChange?: (open: boolean) => void;
  prefill?: Record<string, unknown>;
}

interface StepConfigBase {
  id: string;
  label: string;
  description: string;
}

interface StepConfig<TFieldValues> extends StepConfigBase {
  fields: FieldPath<TFieldValues>[];
}

const OWNER_STEPS: StepConfig<OwnerOnboardingInput>[] = [
  {
    id: 'profile',
    label: 'Profil',
    description: 'Vos informations personnelles',
    fields: ['profile.firstName', 'profile.lastName', 'profile.phone'],
  },
  {
    id: 'property',
    label: 'Logement',
    description: 'Créez le brouillon du logement',
    fields: ['property.title', 'property.city', 'property.capacity', 'property.regNumber'],
  },
  {
    id: 'photos',
    label: 'Photos',
    description: 'Téléverser vos images via Cloudinary',
    fields: ['photos'],
  },
  {
    id: 'season',
    label: 'Saisonnalité',
    description: 'Configurez les périodes disponibles',
    fields: ['season.start', 'season.end'],
  },
  {
    id: 'pricing',
    label: 'Tarifs',
    description: 'Définissez vos prix et frais',
    fields: ['pricing.nightly', 'pricing.cleaningFee'],
  },
  {
    id: 'compliance',
    label: 'Conformité',
    description: 'Informations légales',
    fields: ['compliance.hasInsurance', 'compliance.acceptsTerms'],
  },
  {
    id: 'review',
    label: 'Revue',
    description: 'Publier ou sauvegarder en brouillon',
    fields: [],
  },
];

const TENANT_STEPS: StepConfig<TenantOnboardingInput>[] = [
  {
    id: 'profile',
    label: 'Profil',
    description: 'Informations personnelles',
    fields: ['profile.firstName', 'profile.lastName', 'profile.phone'],
  },
  {
    id: 'search',
    label: 'Recherche',
    description: 'Ville cible et critères',
    fields: ['search.city', 'search.capacity'],
  },
  {
    id: 'documents',
    label: 'Documents',
    description: 'Téléversez vos justificatifs',
    fields: ['documents'],
  },
  {
    id: 'preferences',
    label: 'Préférences',
    description: 'Personnalisez votre expérience',
    fields: ['preferences.amenities', 'preferences.budget'],
  },
  {
    id: 'review',
    label: 'Résumé',
    description: 'Vérifiez et finalisez',
    fields: [],
  },
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

const resolveOwnerDefaultValues = (
  draft: Record<string, unknown> | null,
  prefill?: Record<string, unknown>
): OwnerOnboardingInput => {
  const base = createOwnerDefaultValues();
  // Apply prefill first (so draft can still override)
  const parsedPrefill = ownerOnboardingDraftSchema.safeParse(prefill ?? {});
  const withPrefill = parsedPrefill.success
    ? mergeDraftInto({ ...base }, parsedPrefill.data)
    : base;

  const parsedDraft = ownerOnboardingDraftSchema.safeParse(draft ?? {});
  if (!parsedDraft.success) {
    return withPrefill;
  }
  return mergeDraftInto(withPrefill, parsedDraft.data);
};

const resolveTenantDefaultValues = (
  draft: Record<string, unknown> | null
): TenantOnboardingInput => {
  const base = createTenantDefaultValues();
  const parsedDraft = tenantOnboardingDraftSchema.safeParse(draft ?? {});
  if (!parsedDraft.success) {
    return base;
  }
  return mergeDraftInto(base, parsedDraft.data);
};

export default function OnboardingClient({
  role,
  openModal,
  draft,
  onOpenChange,
  prefill,
}: OnboardingClientProps) {
  if (role === 'OWNER') {
    return (
      <OwnerOnboarding
        openModal={openModal}
        draft={draft}
        onOpenChange={onOpenChange}
        prefill={prefill}
      />
    );
  }
  return <TenantOnboarding openModal={openModal} draft={draft} onOpenChange={onOpenChange} />;
}

interface OwnerProps {
  openModal: boolean;
  draft: Record<string, unknown> | null;
  onOpenChange?: (open: boolean) => void;
  prefill?: Record<string, unknown>;
}

function OwnerOnboarding({ openModal, draft, onOpenChange, prefill }: OwnerProps) {
  const router = useRouter();

  // 1) React Hook Form
  const form = useForm<OwnerOnboardingInput>({
    resolver: zodResolver(ownerOnboardingSchema),
    defaultValues: resolveOwnerDefaultValues(draft, prefill),
  });

  // 2) États locaux
  const [currentStep, setCurrentStep] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 4) Callbacks stables
  const handleAutoSaved = useCallback((date: Date) => setLastSaved(date), []);
  const handleOpenChange = useCallback(
    (next: boolean) => {
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  // 5) Hook custom après états / callbacks
  useAutoSave(form.watch, 'OWNER', handleAutoSaved);

  // 6) Valeurs dérivées
  const step = OWNER_STEPS[currentStep];

  // 7) Navigation steps
  const next = async () => {
    const fieldsToValidate = step.fields;
    const valid = fieldsToValidate.length > 0 ? await form.trigger(fieldsToValidate) : true;
    if (!valid) return;
    setCurrentStep((prev) => Math.min(prev + 1, OWNER_STEPS.length - 1));
  };

  const previous = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // 8) Publication
  const handlePublish = async () => {
    setSaving(true);
    setError(null);

    const isValid = await form.trigger();
    if (!isValid) {
      setSaving(false);
      return;
    }

    const currentValues = form.getValues();
    if (!currentValues.photos || currentValues.photos.length === 0) {
      setSaving(false);
      setError('Ajoutez au moins une photo avant de publier.');
      return;
    }

    const payload = { ...currentValues, review: { status: 'published' as const } };

    console.log('Bouton "Publier" cliqué : enregistrement des données en base de données.', {
      payloadKeys: Object.keys(payload ?? {}),
    });

    try {
      console.debug("Tentative de publication de l'onboarding propriétaire.", {
        payloadKeys: Object.keys(payload ?? {}),
      });

      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as {
        redirectTo?: string;
        message?: string;
        property?: { slug: string };
      } | null;

      if (!response.ok) {
        console.error('La publication du brouillon a échoué.', {
          status: response.status,
          statusText: response.statusText,
          body: data,
        });
        setError(data?.message ?? 'Impossible de finaliser la publication.');
        return;
      }

      console.debug('Publication du brouillon réussie.', { redirectTo: data?.redirectTo });

      toast({
        title: 'VOTRE TABLEAU DE BORD EST BIEN PUBLIE',
        description: 'Your dashboard has been successfully published.',
      });

      handleOpenChange(false); // notifie le parent pour fermer le Dialog

      const destination = data?.redirectTo ?? `/${defaultLocale}/dashboard/owner`;
      router.push(destination);
    } catch (error_) {
      console.error('Failed to publish onboarding draft', error_);
      setError('Impossible de finaliser la publication.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={openModal} onOpenChange={handleOpenChange}>
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
                  {lastSaved
                    ? `Sauvegardé ${lastSaved.toLocaleTimeString()}`
                    : 'Sauvegarde automatique active'}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      console.log('Étape précédente — currentStep :', currentStep);
                      previous();
                    }}
                    disabled={currentStep === 0}
                  >
                    Étape précédente
                  </Button>

                  {currentStep < OWNER_STEPS.length - 1 ? (
                    <Button
                      type="button"
                      onClick={() => {
                        console.log('Étape suivante — currentStep :', currentStep);
                        next();
                      }}
                    >
                      Étape suivante
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        console.log('Publication — currentStep :', currentStep);
                        handlePublish();
                      }}
                      disabled={saving}
                    >
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

  // 1) React Hook Form
  const form = useForm<TenantOnboardingInput>({
    resolver: zodResolver(tenantOnboardingSchema),
    defaultValues: resolveTenantDefaultValues(draft),
  });

  // 2) États locaux
  const [isOpen, setIsOpen] = useState(openModal);
  const [currentStep, setCurrentStep] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3) Synchronisation prop -> état
  useEffect(() => {
    setIsOpen(openModal);
  }, [openModal]);

  // 4) Callbacks stables
  const handleTenantAutoSaved = useCallback((date: Date) => setLastSaved(date), []);
  const handleOpenChange = useCallback(
    (next: boolean) => {
      setIsOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  // 5) Hook custom après états / callbacks
  useAutoSave(form.watch, 'TENANT', handleTenantAutoSaved);

  // 6) Valeurs dérivées
  const step = TENANT_STEPS[currentStep];

  // 7) Navigation steps
  const next = async () => {
    const fieldsToValidate = step.fields;
    const valid = fieldsToValidate.length > 0 ? await form.trigger(fieldsToValidate) : true;
    if (!valid) return;
    setCurrentStep((prev) => Math.min(prev + 1, TENANT_STEPS.length - 1));
  };

  const previous = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // 8) Finalisation
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
      console.debug("Tentative de finalisation de l'onboarding locataire.", {
        payloadKeys: Object.keys(payload ?? {}),
      });

      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as {
        redirectTo?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        console.error("La finalisation de l'onboarding locataire a échoué.", {
          status: response.status,
          statusText: response.statusText,
          body: data,
        });
        setError(data?.message ?? "Impossible de finaliser l'onboarding.");
        return;
      }

      console.debug('Onboarding locataire finalisé avec succès.', { redirectTo: data?.redirectTo });

      handleOpenChange(false); // ferme le Dialog localement + notifie le parent
      const destination = data?.redirectTo ?? `/${defaultLocale}/dashboard/tenant`;
      router.push(destination);
    } catch (err) {
      console.error('Failed to finalise tenant onboarding', err);
      setError("Impossible de finaliser l'onboarding.");
    } finally {
      setSaving(false);
    }
  };

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
                {lastSaved
                  ? `Sauvegardé ${lastSaved.toLocaleTimeString()}`
                  : 'Sauvegarde automatique active'}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={previous}
                  disabled={currentStep === 0}
                >
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
  steps: StepConfigBase[];
  currentStep: number;
}

function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <div
            key={step.id}
            className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : isCompleted
                  ? 'bg-muted text-foreground'
                  : 'bg-secondary'
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
                  <Input
                    placeholder="Jean"
                    required
                    minLength={1}
                    autoComplete="given-name"
                    aria-invalid={!!form.formState.errors.profile?.firstName}
                    {...field}
                  />
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
                  <Input
                    placeholder="Dupont"
                    required
                    minLength={1}
                    autoComplete="family-name"
                    aria-invalid={!!form.formState.errors.profile?.lastName}
                    {...field}
                  />
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
                  <Input
                    placeholder="+33 6 12 34 56 78"
                    inputMode="tel"
                    minLength={6}
                    aria-invalid={!!form.formState.errors.profile?.phone}
                    {...field}
                  />
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
                  <Input
                    placeholder="Chalet Alpin"
                    required
                    minLength={3}
                    aria-invalid={!!form.formState.errors.property?.title}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="property.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez votre logement (équipements, environnement, atouts)"
                    rows={4}
                    aria-invalid={!!form.formState.errors.property?.description}
                    {...field}
                  />
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
                    <Input
                      placeholder="Chamonix"
                      required
                      minLength={2}
                      aria-invalid={!!form.formState.errors.property?.city}
                      {...field}
                    />
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
                    <Input
                      type="number"
                      required
                      min={1}
                      step={1}
                      aria-invalid={!!form.formState.errors.property?.capacity}
                      {...field}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
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
            Téléversez vos images directement sur Cloudinary. Ajoutez au moins une image héros pour
            mettre en valeur le logement.
          </p>
          <FormField
            control={form.control}
            name="photos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photos du logement</FormLabel>
                <FormControl>
                  <OwnerPhotosDropzone
                    value={field.value ?? []}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
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
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    aria-invalid={!!form.formState.errors.pricing?.nightly}
                    {...field}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
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
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    {...field}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
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
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  />
                </FormControl>
                <div>
                  <FormLabel className="text-sm">
                    Je possède une assurance responsabilité civile
                  </FormLabel>
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
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  />
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
            Vérifiez les informations avant publication. Vous pouvez rester en brouillon tant que la
            photo héros, la ville, la capacité et le numéro d&apos;enregistrement ne sont pas
            définis.
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
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
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
                    onChange={(event) =>
                      field.onChange(
                        event.target.value
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean)
                      )
                    }
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
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    {...field}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
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

// ✅ Version améliorée avec logs + validation complète + saison / photos / pricing

function useAutoSave<T extends OwnerOnboardingInput | TenantOnboardingInput>(
  watch: UseFormWatch<T>,
  role: 'OWNER' | 'TENANT',
  onSaved?: (date: Date) => void
) {
  const [draft, setDraft] = useState<T | null>(null);
  const lastSerializedDraft = useRef<string | null>(null);

  // 📌 1. Met à jour le state local du draft à chaque modification
  useEffect(() => {
    const subscription = watch((value) => {
      setDraft(value as T);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // 📌 2. Sauvegarde automatique → seulement si le brouillon a changé
  useEffect(() => {
    if (!draft) return;

    const schema = role === 'OWNER' ? ownerOnboardingDraftSchema : tenantOnboardingDraftSchema;

    // 🔹 Nettoyage (supprime les undefined, vide les strings trop longues…)
    const sanitized = sanitizeDraft(draft);
    const payload = isPlainObject(sanitized) ? sanitized : {};

    // 🔹 Validation partielle (brouillon)
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      console.warn('❌ Draft validation failed (ignored):', parsed.error.flatten());
      return;
    }

    // 🔹 Empêche les requêtes inutiles si aucun changement
    const serialized = JSON.stringify(parsed.data);
    if (lastSerializedDraft.current === serialized) return;
    lastSerializedDraft.current = serialized;

    // 🕒 Déclenchement différé (debounce)
    const timeout = setTimeout(() => {
      console.debug('💾 Auto-save draft triggered.', {
        role,
        payloadKeys: Object.keys(parsed.data ?? {}),
        hasSeason: !!(parsed.data as any).season,
        hasPhotos: !!(parsed.data as any).photos?.length,
        photosCount: (parsed.data as any).photos?.length ?? 0,
        hasPricing: !!(parsed.data as any).pricing,
      });

      void fetch('/api/onboarding/draft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: serialized,
      })
        .then((response) => {
          if (!response.ok) {
            console.error('❌ Auto-save failed', {
              status: response.status,
              statusText: response.statusText,
            });
            lastSerializedDraft.current = null; // ➝ permet de relancer au prochain changement
            return;
          }
          console.debug('✅ Draft auto-saved.');
          onSaved?.(new Date());
        })
        .catch((error) => {
          console.error('❌ Auto-save fetch error:', error);
          lastSerializedDraft.current = null;
        });
    }, 800); // ✅ délai 800ms cohérent avec ton design UX

    return () => clearTimeout(timeout);
  }, [draft, role, onSaved]);
}
