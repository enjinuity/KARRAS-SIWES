import type { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';

import { AppHeader } from '@/components/layout/AppHeader';
import { cn } from '@/lib/utils';

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const isWorkspace = location.pathname === '/workspace';

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#030303] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_26%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:96px_96px] opacity-[0.05]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_18%,transparent_82%,rgba(255,255,255,0.02))]" />
      </div>
      {isWorkspace ? null : <AppHeader />}
      <main
        className={cn(
          'relative z-10 mx-auto',
          isWorkspace ? 'max-w-none p-0' : 'max-w-[1600px] px-5 pb-8 pt-6 lg:px-8',
        )}
      >
        {children}
      </main>
    </div>
  );
}
