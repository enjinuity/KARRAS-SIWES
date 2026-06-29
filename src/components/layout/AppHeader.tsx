import { Link, NavLink } from 'react-router-dom';
import { Activity, ArrowRightLeft, Binary, BookOpenText, Cloud, FileText, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

const navigation = [
  { to: '/', label: 'Home', icon: Activity },
  { to: '/workspace', label: 'Workspace', icon: Binary },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/compare', label: 'Compare', icon: ArrowRightLeft },
  { to: '/methodology', label: 'Methodology', icon: BookOpenText },
];

export function AppHeader() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050816]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-6 py-4 lg:px-10 xl:flex-row xl:items-center xl:justify-between">
        <Link to="/" className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,0.16)]">
            <Activity className="h-5 w-5 text-cyan-200" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg uppercase tracking-[0.3em] text-zinc-100">KARRAS</p>
            <p className="hidden text-xs uppercase tracking-[0.24em] text-zinc-500 sm:block">
              Infrastructure Decision Support
            </p>
          </div>
        </Link>

        <div className="flex w-full flex-col gap-3 xl:w-auto xl:flex-row xl:items-center">
          {user ? (
            <div className="hidden items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-emerald-100 xl:flex">
              <Cloud className="h-4 w-4" />
              {user.name}
            </div>
          ) : (
            <Link
              to="/auth"
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-300 transition hover:text-zinc-100 xl:flex"
            >
              <ShieldCheck className="h-4 w-4" />
              Sign In
            </Link>
          )}
          <nav className="flex max-w-full items-center gap-2 overflow-x-auto rounded-full border border-white/10 bg-white/5 p-1">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm text-zinc-400 transition hover:text-zinc-100',
                    'flex items-center gap-2',
                    isActive && 'bg-white/10 text-zinc-100 shadow-[0_10px_30px_rgba(15,23,42,0.45)]',
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
