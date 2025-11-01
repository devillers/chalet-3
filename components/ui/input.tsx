// components/ui/input.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/** Nettoie la valeur contrôlée pour éviter NaN / null / undefined côté DOM */
function sanitizeValue(
  val: unknown,
  type?: string,
  isControlled?: boolean
): string | number | readonly string[] | undefined {
  if (!isControlled) return undefined; // laisser uncontrolled

  if (val === null || val === undefined) return '';

  if (typeof val === 'number') {
    return Number.isNaN(val) ? '' : val;
  }

  if (typeof val === 'string') {
    if (type === 'number') {
      if (val.trim() === '') return '';
      const n = Number(val);
      return Number.isFinite(n) ? n : '';
    }
    return val;
  }

  try {
    return String(val as any);
  } catch {
    return '';
  }
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { className, type = 'text', value, defaultValue, ...rest } = props;

  // ✅ Détection propre du mode contrôlé
  const isControlled = Object.prototype.hasOwnProperty.call(props, 'value');

  // ✅ Ne jamais passer `value` ET `defaultValue` ensemble
  const valueProps = isControlled
    ? { value: sanitizeValue(value, type, true) }
    : {};

  const defaultValueProps =
    !isControlled && defaultValue !== undefined ? { defaultValue } : {};

  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...valueProps}
      {...defaultValueProps}
      {...rest}
    />
  );
});
Input.displayName = 'Input';

export { Input };
