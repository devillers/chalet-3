import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export default function CTAButton({
  href,
  children,
  variant = 'primary',
  className = ''
}: CTAButtonProps) {
  const baseClasses = 'inline-flex items-center space-x-2 rounded-md px-6 py-3 text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = variant === 'primary'
    ? 'bg-blue-700 text-white hover:bg-blue-600 focus:ring-blue-700 shadow-sm'
    : 'bg-white text-blue-700 border-2 border-blue-700 hover:bg-blue-50 focus:ring-blue-700';

  return (
    <Link
      href={href}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      <span>{children}</span>
      <ArrowRight className="h-5 w-5" aria-hidden="true" />
    </Link>
  );
}
