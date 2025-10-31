'use client';

import { useCallback, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import Image from 'next/image';
import { Loader2, Star, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OwnerOnboardingInput } from '@/lib/validators/onboarding';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_SIZE_LABEL = '10 Mo';

type OwnerPhoto = NonNullable<OwnerOnboardingInput['photos']>[number];

interface OwnerPhotosDropzoneProps {
  value: OwnerPhoto[];
  onChange: (photos: OwnerPhoto[]) => void;
  onBlur?: () => void;
}

interface CloudinarySignatureResponse {
  cloudName: string;
  apiKey: string;
  signature: string;
  timestamp: number;
  folder?: string;
}

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url?: string;
  url?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  original_filename?: string;
}

const extractErrorMessage = async (response: Response): Promise<string | null> => {
  try {
    const json = await response.clone().json();
    if (json && typeof json === 'object' && 'message' in json && typeof json.message === 'string') {
      const trimmed = json.message.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  } catch (jsonError) {
    console.debug('Impossible de lire le corps JSON de la réponse.', jsonError);
  }

  try {
    const text = await response.clone().text();
    const trimmed = text.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  } catch (textError) {
    console.debug('Impossible de lire le corps texte de la réponse.', textError);
  }

  return null;
};

export function OwnerPhotosDropzone({ value, onChange, onBlur }: OwnerPhotosDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photos = useMemo(
    () => (Array.isArray(value) ? value.filter(isValidOwnerPhoto) : []),
    [value],
  );

  const updatePhotos = useCallback(
    (next: OwnerPhoto[]): OwnerPhoto[] => {
      const validPhotos = next.filter(isValidOwnerPhoto);
      const normalized = normalizeHero(validPhotos);
      onChange(normalized);
      onBlur?.();
      return normalized;
    },
    [onBlur, onChange],
  );

  const handleSelectFiles = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const processFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) {
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        let nextPhotos = [...photos];
        for (const file of files) {
          if (!file.type.startsWith('image/')) {
            setError('Seules les images peuvent être téléversées.');
            continue;
          }

          if (file.size > MAX_FILE_SIZE_BYTES) {
            setError(
              `"${file.name}" dépasse la taille maximale autorisée de ${MAX_FILE_SIZE_LABEL}.`,
            );
            continue;
          }

          const signatureResponse = await fetch('/api/uploads/sign', {
            method: 'POST',
          });

          if (!signatureResponse.ok) {
            const signatureErrorMessage =
              (await extractErrorMessage(signatureResponse)) ||
              'Impossible de récupérer la signature Cloudinary.';

            console.error('Échec de la récupération de la signature Cloudinary.', {
              status: signatureResponse.status,
              statusText: signatureResponse.statusText,
            });

            throw new Error(signatureErrorMessage);
          }

          const signature: CloudinarySignatureResponse = await signatureResponse.json();

          console.debug('Signature Cloudinary récupérée avec succès.', {
            cloudName: signature.cloudName,
            folder: signature.folder,
            timestamp: signature.timestamp,
          });

          const formData = new FormData();
          formData.append('file', file);
          formData.append('api_key', signature.apiKey);
          formData.append('timestamp', signature.timestamp.toString());
          formData.append('signature', signature.signature);
          if (signature.folder) {
            formData.append('folder', signature.folder);
          }

          const uploadEndpoint = `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`;
          console.debug('Téléversement de fichier vers Cloudinary.', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadEndpoint,
          });

          const uploadResponse = await fetch(uploadEndpoint, {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            const uploadErrorMessage =
              (await extractErrorMessage(uploadResponse)) || 'Le téléversement vers Cloudinary a échoué.';

            console.error('Le téléversement vers Cloudinary a échoué.', {
              status: uploadResponse.status,
              statusText: uploadResponse.statusText,
            });

            throw new Error(uploadErrorMessage);
          }

          const payload: CloudinaryUploadResponse = await uploadResponse.json();
          console.debug('Réponse Cloudinary reçue.', {
            publicId: payload.public_id,
            width: payload.width,
            height: payload.height,
            format: payload.format,
            bytes: payload.bytes,
          });
          const secureUrl = payload.secure_url ?? payload.url;
          if (!secureUrl) {
            throw new Error('Cloudinary n\'a pas renvoyé d\'URL sécurisée.');
          }

          nextPhotos = [
            ...nextPhotos,
            {
              publicId: payload.public_id,
              url: secureUrl,
              alt: payload.original_filename ?? file.name,
              isHero: nextPhotos.length === 0 || !nextPhotos.some((photo) => photo.isHero),
              width: payload.width ?? 0,
              height: payload.height ?? 0,
              format: payload.format ?? file.type.replace('image/', ''),
              bytes: payload.bytes ?? file.size,
            },
          ].filter(isValidOwnerPhoto);

          nextPhotos = updatePhotos(nextPhotos);
        }
      } catch (uploadError) {
        console.error(uploadError);
        const message =
          uploadError instanceof Error && typeof uploadError.message === 'string'
            ? uploadError.message
            : 'Une erreur est survenue pendant le téléversement. Veuillez réessayer.';
        setError(message);
      } finally {
        setIsUploading(false);
      }
    },
    [photos, updatePhotos],
  );

  const handleInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) {
        return;
      }
      const files = Array.from(event.target.files);
      event.target.value = '';
      await processFiles(files);
    },
    [processFiles],
  );

  const handleDrop = useCallback(
    async (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(event.dataTransfer.files ?? []);
      await processFiles(droppedFiles);
    },
    [processFiles],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemovePhoto = useCallback(
    (publicId: string) => {
      const nextPhotos = photos.filter((photo) => photo.publicId !== publicId);
      updatePhotos(nextPhotos);
    },
    [photos, updatePhotos],
  );

  const handleSetHero = useCallback(
    (publicId: string) => {
      const nextPhotos = photos.map((photo) => ({
        ...photo,
        isHero: photo.publicId === publicId,
      }));
      updatePhotos(nextPhotos);
    },
    [photos, updatePhotos],
  );

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={handleSelectFiles}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSelectFiles();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/50 bg-muted/30 p-8 text-center transition-colors',
          isDragging && 'border-primary bg-primary/10',
        )}
      >
        <UploadCloud className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Glissez-déposez vos images</p>
          <p className="text-xs text-muted-foreground">
            ou cliquez pour sélectionner des fichiers (max. {MAX_FILE_SIZE_LABEL} par image)
          </p>
        </div>
        {isUploading ? (
          <Badge variant="secondary" className="mt-2 flex items-center gap-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Téléversement en cours…
          </Badge>
        ) : (
          <Button type="button" variant="outline" size="sm" className="mt-2">
            Choisir des images
          </Button>
        )}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {photos.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.publicId} className="space-y-2 rounded-lg border bg-background p-3 shadow-sm">
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
                <Image
                  src={photo.url}
                  alt={photo.alt ?? ''}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {photo.isHero ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" /> Image héros
                    </Badge>
                  ) : (
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      onClick={() => handleSetHero(photo.publicId)}
                    >
                      <Star className="h-3.5 w-3.5" /> Définir héros
                    </button>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleRemovePhoto(photo.publicId)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Supprimer</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function normalizeHero(photos: OwnerPhoto[]): OwnerPhoto[] {
  const validPhotos = photos.filter(isValidOwnerPhoto);
  if (validPhotos.length === 0) {
    return validPhotos;
  }

  const heroIndex = validPhotos.findIndex((photo) => photo.isHero);
  if (heroIndex >= 0) {
    return validPhotos.map((photo, index) => ({ ...photo, isHero: index === heroIndex }));
  }

  return validPhotos.map((photo, index) => ({ ...photo, isHero: index === 0 }));
}

function isValidOwnerPhoto(photo: unknown): photo is OwnerPhoto {
  if (!photo || typeof photo !== 'object') {
    return false;
  }

  const candidate = photo as Partial<OwnerPhoto>;
  if (typeof candidate.publicId !== 'string' || candidate.publicId.trim().length === 0) {
    return false;
  }

  if (typeof candidate.url !== 'string' || candidate.url.trim().length === 0) {
    return false;
  }

  if (typeof candidate.isHero !== 'boolean') {
    return false;
  }

  return true;
}
