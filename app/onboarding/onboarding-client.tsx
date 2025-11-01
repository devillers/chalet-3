'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type Role = 'OWNER' | 'TENANT';

type DraftData = {
  profile?: Record<string, unknown>;
  property?: {
    name?: string;
    city?: string;
    capacity?: number | string;
  };
  photos?: Array<Record<string, unknown>>;
  compliance?: {
    termsAccepted?: boolean;
  };
  pricing?: Record<string, unknown>;
  season?: Record<string, unknown>;
  review?: Record<string, unknown>;
} | null;

interface OnboardingClientProps {
  role: Role;
  openModal?: boolean;
  draft?: DraftData; // passe directement draft.data si ton API renvoie { draft: { data: {...} } }
  onClose?: () => void;
}

/* ------------------------------------------------------------------ */
/* Petits éléments d’UI                                               */
/* ------------------------------------------------------------------ */

function Line({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 py-1">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium">{value ?? '—'}</div>
    </div>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span
        className={cn(
          'inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs',
          ok
            ? 'border-emerald-600 text-emerald-700'
            : 'border-red-600 text-red-700'
        )}
        aria-hidden
      >
        {ok ? '✓' : '✕'}
      </span>
      <span className={cn(ok ? '' : 'text-red-700')}>{label}</span>
    </div>
  );
}

function HeaderStep({
  index,
  title,
  subtitle,
  active = false,
}: {
  index: number;
  title: string;
  subtitle: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        active ? 'border-primary ring-1 ring-primary/30' : 'border-border'
      )}
    >
      <div className="mb-1 flex items-center gap-2">
        <span
          className={cn(
            'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
            active ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
          )}
        >
          {index}
        </span>
        <span className="font-semibold">{title}</span>
      </div>
      <div className="text-sm text-muted-foreground">{subtitle}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                */
/* ------------------------------------------------------------------ */

export default function OnboardingClient({
  role,
  openModal = true,
  draft = null,
  onClose,
}: OnboardingClientProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(openModal);

  // Form initialisé avec le contenu du brouillon
  const form = useForm<any>({
    defaultValues: draft ?? {},
    mode: 'onChange',
    shouldUnregister: false,
  });

  /* -------------------- Ré-hydratation des photos -------------------- */
  // Si le form n’a pas encore de photos mais que le brouillon en a, on copie
  useEffect(() => {
    const current = form.getValues('photos') as unknown[] | undefined;
    const fromDraft = (draft as any)?.photos as unknown[] | undefined;

    if ((!current || current.length === 0) && Array.isArray(fromDraft) && fromDraft.length > 0) {
      form.setValue('photos', fromDraft, { shouldDirty: false, shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  /* -------------------- Sélecteurs pour l’aperçu -------------------- */
  const name = useMemo(() => {
    const v =
      (form.watch('property.name') as unknown) ??
      (draft as any)?.property?.name ??
      '';
    return (v ?? '').toString().trim();
  }, [form, draft]);

  const city = useMemo(() => {
    const v =
      (form.watch('property.city') as unknown) ??
      (draft as any)?.property?.city ??
      '';
    return (v ?? '').toString().trim();
  }, [form, draft]);

  const capacity = useMemo(() => {
    const raw =
      (form.watch('property.capacity') as unknown) ??
      (draft as any)?.property?.capacity ??
      0;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [form, draft]);

  // Photos effectives : on privilégie ce qui est dans le form, sinon fallback brouillon
  const watchedPhotos = (form.watch('photos') as unknown[]) ?? [];
  const draftPhotos = ((draft as any)?.photos as unknown[]) ?? [];
  const effectivePhotos =
    Array.isArray(watchedPhotos) && watchedPhotos.length > 0
      ? watchedPhotos
      : draftPhotos;

  const photosCount =
    Array.isArray(effectivePhotos) && effectivePhotos.length > 0
      ? effectivePhotos.length
      : 0;

  const termsAccepted = Boolean(
    (form.watch('compliance.termsAccepted') as unknown) ??
      (draft as any)?.compliance?.termsAccepted ??
      false
  );

  /* -------------------- Checklist -------------------- */
  const nameOK = name.length >= 3;
  const cityOK = city.length > 0;
  const capacityOK = capacity >= 1;
  const hasAtLeastOnePhoto = photosCount >= 1;
  const termsOK = termsAccepted;

  const publishDisabled =
    !nameOK || !cityOK || !capacityOK || !hasAtLeastOnePhoto || !termsOK;

  /* -------------------- Actions -------------------- */
  const handleSaveDraft = async () => {
    try {
      const payload = form.getValues();
      await fetch('/api/onboarding/draft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, data: payload }),
      });
    } catch (e) {
      console.error('Save draft failed', e);
    }
  };

  const handlePublish = async () => {
    if (publishDisabled) return;
    try {
      // Dernière synchro du brouillon
      const payload = form.getValues();
      await fetch('/api/onboarding/draft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, data: payload }),
      });

      // Finalisation
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) throw new Error('Failed to publish');

      setIsOpen(false);
      onClose?.();
      router.refresh();
    } catch (e) {
      console.error('Publish failed', e);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="w-full">
      {isOpen && (
        <FormProvider {...form}>
          <div className="space-y-6">
            {/* En-têtes d’étapes */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <HeaderStep index={1} title="Profil" subtitle="Vos informations personnelles" />
              <HeaderStep index={2} title="Logement" subtitle="Créez le brouillon du logement" />
              <HeaderStep index={3} title="Photos" subtitle="Téléverser vos images via Cloudinary" />
              <HeaderStep index={4} title="Saisonnalité" subtitle="Périodes disponibles" />
              <HeaderStep index={5} title="Tarifs" subtitle="Prix et frais" />
              <HeaderStep index={6} title="Conformité" subtitle="Informations légales" />
              <HeaderStep index={7} title="Revue" subtitle="Publier ou sauvegarder en brouillon" active />
            </div>

            {/* Bloc REVUE */}
            <section className="rounded-lg border bg-card p-4 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Récapitulatif & publication</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Aperçu */}
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 font-semibold">Aperçu</h3>
                  <Line label="Nom du logement" value={name || '—'} />
                  <Line label="Ville" value={city || '—'} />
                  <Line label="Capacité" value={capacity || '0'} />
                  <Line label="Photos" value={photosCount} />
                </div>

                {/* Checklist */}
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 font-semibold">Checklist publication</h3>
                  <Check ok={nameOK} label="Nom du logement (≥ 3 caractères)" />
                  <Check ok={cityOK} label="Ville" />
                  <Check ok={capacityOK} label="Capacité (≥ 1)" />
                  <Check ok={hasAtLeastOnePhoto} label="Au moins 1 photo" />
                  <Check ok={termsOK} label="Conditions générales acceptées" />
                  {!hasAtLeastOnePhoto && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Complétez les éléments manquants pour activer la publication.
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button type="button" variant="secondary" onClick={handleSaveDraft}>
                  Enregistrer en brouillon
                </Button>
                <Button type="button" disabled={publishDisabled} onClick={handlePublish}>
                  Publier
                </Button>
              </div>
            </section>

            <div className="text-sm text-muted-foreground">
              Sauvegardé {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </FormProvider>
      )}
    </div>
  );
}
