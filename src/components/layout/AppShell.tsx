import type { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';

import { AppHeader } from '@/components/layout/AppHeader';
import { cn } from '@/lib/utils';

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const isWorkspace = location.pathname === '/workspace';

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050816] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[-14rem] h-[28rem] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),transparent_55%)]" />
        <div className="absolute right-[-12rem] top-1/4 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.16),transparent_62%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:80px_80px] opacity-[0.07]" />
      </div>
      {isWorkspace ? null : <AppHeader />}
      <main
        className={cn(
          'relative z-10 mx-auto',
          isWorkspace ? 'max-w-none p-0' : 'max-w-[1600px] px-6 pb-8 pt-8 lg:px-10',
        )}
      >
        {children}
      </main>
    </div>
  );
}
