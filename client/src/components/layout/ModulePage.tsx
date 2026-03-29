import AppShell from '@/components/layout/AppShell';
import type { ReactNode } from 'react';

interface ModulePageProps {
  title: string;
  children: ReactNode;
}

export default function ModulePage({ title, children }: ModulePageProps) {
  return (
    <AppShell title={title} showBack>
      <div className="mt-4">{children}</div>
    </AppShell>
  );
}
