'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactFormData } from '@/lib/validators/contact';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      consent: false,
    },
  });

  const consentValue = watch('consent');

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

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        reset();
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    }
  };

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
