import type { ReactNode } from 'react';

export default function SigninLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900"></div>
  
  children;

}
