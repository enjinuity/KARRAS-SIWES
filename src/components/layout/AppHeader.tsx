import { Link, NavLink } from 'react-router-dom';
import { Activity, ArrowRightLeft, BookOpenText, Cloud, FileText, LayoutGrid, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

const navigation = [
  { to: '/', label: 'Home', icon: Activity },
  { to: '/workspace', label: 'Workspace', icon: LayoutGrid },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/compare', label: 'Compare', icon: ArrowRightLeft },
  { to: '/methodology', label: 'Methodology', icon: BookOpenText },
];

export function AppHeader() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-[#030303]/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-5 py-4 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <Link to="/" className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.03]">
            <span className="font-display text-2xl text-white">K</span>
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg uppercase tracking-[0.24em] text-zinc-100">KARRAS</p>
            <p className="hidden text-xs uppercase tracking-[0.22em] text-zinc-600 sm:block">Systems Workspace</p>
          </div>
        </Link>

        <div className="flex w-full flex-col gap-3 xl:w-auto xl:flex-row xl:items-center">
          {user ? (
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-300 xl:flex">
              <Cloud className="h-4 w-4 text-zinc-500" />
              {user.name}
            </div>
          ) : (
            <Link
              to="/auth"
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-300 transition hover:text-zinc-100 xl:flex"
            >
              <ShieldCheck className="h-4 w-4" />
              Access
            </Link>
          )}
          <nav className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.02] p-1">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm text-zinc-500 transition hover:text-zinc-100',
                    'flex items-center gap-2',
                    isActive && 'bg-white/8 text-zinc-100',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
