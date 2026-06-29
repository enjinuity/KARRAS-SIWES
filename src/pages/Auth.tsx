import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LogOut, ShieldCheck } from 'lucide-react';

import { useAuthStore } from '@/store/useAuthStore';

export default function Auth() {
  const navigate = useNavigate();
  const { user, status, error, register, login, logout } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isBusy = status === 'loading';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === 'register') {
      await register({ name, email, password });
    } else {
      await login({ email, password });
    }

    navigate('/');
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Authentication</p>
        <h1 className="mt-4 font-display text-5xl leading-[0.95] text-zinc-50 xl:text-6xl">
          Move from local sandbox to persistent KARRAS workspace.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
          Sign in to persist scenarios outside the current browser session. This backend phase keeps the simulation
          engine client-side for speed while preserving saved concepts in a SQLite-backed workspace store.
        </p>

        <div className="mt-8 space-y-4">
          {[
            'Register once and keep scenario work tied to your account.',
            'Sync local concepts into the backend JSON store for cross-session recovery.',
            'Keep using the same comparison and export flow after sign-in.',
          ].map((item) => (
            <div key={item} className="rounded-[24px] border border-white/10 bg-zinc-950/60 p-4 text-sm text-zinc-300">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-zinc-950/70 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Access Panel</p>
            <h2 className="mt-2 font-display text-3xl text-zinc-50">
              {user ? `Signed in as ${user.name}` : mode === 'register' ? 'Create your account' : 'Welcome back'}
            </h2>
          </div>
          <ShieldCheck className="h-6 w-6 text-cyan-200" />
        </div>

        {user ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-[28px] border border-emerald-300/20 bg-emerald-300/10 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">Session Active</p>
              <p className="mt-3 text-sm leading-6 text-zinc-200">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100"
              >
                Return to workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-400/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-rose-100"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] transition ${
                  mode === 'register' ? 'bg-white/10 text-zinc-100' : 'text-zinc-500'
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] transition ${
                  mode === 'login' ? 'bg-white/10 text-zinc-100' : 'text-zinc-500'
                }`}
              >
                Sign In
              </button>
            </div>

            <form onSubmit={(event) => void handleSubmit(event)} className="mt-8 space-y-4">
              {mode === 'register' ? (
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">Full Name</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-50 outline-none"
                    placeholder="Your name"
                    required
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">Email</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-50 outline-none"
                  placeholder="you@example.com"
                  type="email"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">Password</span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-50 outline-none"
                  placeholder="Minimum 6 characters"
                  type="password"
                  minLength={6}
                  required
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isBusy}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/20 disabled:opacity-60"
              >
                {isBusy ? 'Working...' : mode === 'register' ? 'Create account' : 'Sign in'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
