'use client';

import { useCallback, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  contactSchema,
  ContactFormData,
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_SIZE,
  AttachmentMimeType,
} from '@/lib/validators/contact';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';

interface ContactFormProps {
  locale: Locale;
  translations: any;
}

export default function ContactForm({ locale, translations }: ContactFormProps) {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      consent: false,
      attachments: [],
    },
  });

  const consentValue = watch('consent');
  const attachments = watch('attachments') || [];
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const attachmentsErrorTypeMessage =
    translations.contact?.form?.attachmentsErrorType ??
    'Only JPEG, PNG, or WebP images are allowed.';
  const attachmentsErrorSizeMessage =
    translations.contact?.form?.attachmentsErrorSize ?? 'Each image must be 10MB or less.';
  const attachmentsErrorReadMessage =
    translations.contact?.form?.attachmentsErrorRead ??
    'We were unable to process one of your files. Please try again.';

  const onSubmit = async (data: ContactFormData) => {
    setSubmitStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        reset();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  const convertFileToAttachment = useCallback(async (file: File) => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const [, data] = result.split(',');
        if (!data) {
          reject(new Error('Unable to read file'));
          return;
        }
        resolve(data);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    return {
      name: file.name,
      type: file.type,
      size: file.size,
      data: base64,
    } as ContactFormData['attachments'][number];
  }, []);

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const incomingFiles = Array.from(fileList);
      const validAttachments: ContactFormData['attachments'] = [];
      let hasError = false;

      for (const file of incomingFiles) {
        if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type as AttachmentMimeType)) {
          hasError = true;
          setError('attachments', {
            type: 'manual',
            message: attachmentsErrorTypeMessage,
          });
          continue;
        }

        if (file.size > MAX_ATTACHMENT_SIZE) {
          hasError = true;
          setError('attachments', {
            type: 'manual',
            message: attachmentsErrorSizeMessage,
          });
          continue;
        }

        try {
          const attachment = await convertFileToAttachment(file);
          validAttachments.push(attachment);
        } catch (error) {
          console.error('Attachment conversion error', error);
          hasError = true;
          setError('attachments', {
            type: 'manual',
            message: attachmentsErrorReadMessage,
          });
        }
      }

      if (validAttachments.length > 0) {
        const nextAttachments = [...attachments, ...validAttachments];
        setValue('attachments', nextAttachments, { shouldValidate: true });
        if (!hasError) {
          clearErrors('attachments');
        }
      } else if (!attachments.length && hasError) {
        // keep error set
      } else if (!hasError) {
        clearErrors('attachments');
      }
    },
    [
      attachments,
      attachmentsErrorSizeMessage,
      attachmentsErrorTypeMessage,
      attachmentsErrorReadMessage,
      clearErrors,
      convertFileToAttachment,
      setError,
      setValue,
    ]
  );

  const handleDrop = useCallback(
    async (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (event.dataTransfer.files?.length) {
        await handleFiles(event.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files?.length) {
        await handleFiles(files);
      }
      event.target.value = '';
    },
    [handleFiles]
  );

  const removeAttachment = useCallback(
    (index: number) => {
      const nextAttachments = attachments.filter((_, idx) => idx !== index);
      setValue('attachments', nextAttachments, { shouldValidate: true });
      if (nextAttachments.length === 0) {
        clearErrors('attachments');
      }
    },
    [attachments, clearErrors, setValue]
  );

  const renderConsentLabel = () => {
    const text = translations.contact.form.consent;
    const parts = text.split(/<privacy>|<\/privacy>/);

    return (
      <>
        {parts[0]}
        {parts[1] && (
          <Link
            href={`/${locale}/privacy-policy`}
            className="text-amber-500 hover:text-amber-700 text-xs font-light "
            target="_blank"
          >
            {parts[1]}
          </Link>
        )}
        {parts[2]}
      </>
    );
  };

  const attachmentsError = (errors.attachments as { message?: string } | undefined)?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 !border-t-0 pt-0" noValidate>
      <div className='p-4'>
        <Label htmlFor="name" className="text-sm font-light text-gray-700">
          {translations.contact.form.name} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          {...register('name')}
          className="mt-1"
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className='px-4'>
        <Label htmlFor="email" className="text-sm font-light text-gray-700">
          {translations.contact.form.email} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className="mt-1"
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className='px-4'>
        <Label htmlFor="phone" className="text-sm font-light text-gray-700">
          {translations.contact.form.phone}
        </Label>
        <Input id="phone" type="tel" {...register('phone')} className="mt-1" />
      </div>

      <div className='px-4'>
        <Label htmlFor="message" className="text-sm font-light text-gray-700">
          {translations.contact.form.message} <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="message"
          {...register('message')}
          rows={6}
          className="mt-1"
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <p id="message-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      <div className='px-4'>
        <Label className="text-sm font-light text-gray-700">
          {translations.contact?.form?.attachmentsTitle ?? 'Add visuals'}
        </Label>
        <div
          className={`mt-2 flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 text-center transition-colors ${
            isDragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-describedby={attachmentsError ? 'attachments-error' : undefined}
        >
          <Upload className="h-6 w-6 text-amber-500" aria-hidden="true" />
          <p className="mt-2 text-sm text-gray-600">
            {translations.contact?.form?.attachmentsDescription ??
              'Drag and drop your images here or click to browse. JPEG, PNG or WebP. 10MB max per image.'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 border-amber-500 text-amber-600 hover:bg-amber-50"
            onClick={(event) => {
              event.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {translations.contact?.form?.attachmentsButton ?? 'Choose files'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
        {attachmentsError && (
          <p id="attachments-error" className="mt-2 text-sm text-red-600" role="alert">
            {attachmentsError}
          </p>
        )}

        {attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {translations.contact?.form?.attachmentsPreviewTitle ?? 'Selected files'}
            </p>
            <ul className="space-y-2">
              {attachments.map((file, index) => {
                const sizeInMb = file.size / (1024 * 1024);
                const previewUrl = `data:${file.type};base64,${file.data}`;
                return (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                        <img
                          src={previewUrl}
                          alt={file.name}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            (event.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-700">{file.name}</p>
                        <p className="text-xs text-gray-500">{sizeInMb.toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAttachment(index)}
                      aria-label={
                        translations.contact?.form?.attachmentsRemove ?? 'Remove attachment'
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 justify-center">
        <Checkbox
          id="consent"
          checked={consentValue}
          onCheckedChange={(checked) => setValue('consent', checked as boolean)}
          aria-invalid={errors.consent ? 'true' : 'false'}
          aria-describedby={errors.consent ? 'consent-error' : undefined}
        />
        <Label
          htmlFor="consent"
          className="text-xs text-gray-500 font-normal leading-relaxed cursor-pointer"
        >
          {renderConsentLabel()} <span className="text-red-500">*</span>
        </Label>
      </div>
      {errors.consent && (
        <p id="consent-error" className="text-sm text-red-600" role="alert">
          {errors.consent.message}
        </p>
      )}

      {submitStatus === 'success' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {translations.contact.form.success}
          </AlertDescription>
        </Alert>
      )}

      {submitStatus === 'error' && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {translations.contact.form.error}
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={submitStatus === 'loading'}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
      >
        {submitStatus === 'loading' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {translations.contact.form.sending}
          </>
        ) : (
          translations.contact.form.submit
        )}
      </Button>
    </form>
  );
}
