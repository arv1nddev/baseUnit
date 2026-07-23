import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  // If user is already logged in, go straight to dashboard
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-[var(--text-primary)] tracking-tight">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
              <span className="text-white text-xs font-black">b</span>
            </div>
            baseUnit
          </div>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-medium mb-6">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Built for small food businesses
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.1] mb-6">
            Know the true cost of{' '}
            <span className="text-[var(--color-primary)]">every dish</span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed">
            Stop guessing your margins. Track what you buy, build your recipes,
            and instantly see exactly what each dish costs — down to the gram.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all"
            >
              Get started — it&apos;s free
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="max-w-4xl mx-auto mt-24 mb-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full px-4">
          <div className="animate-slide-up bg-[var(--bg-surface)] rounded-[var(--radius-xl)] border border-[var(--border-default)] p-6 shadow-[var(--shadow-sm)]">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-teal-50 dark:bg-teal-950 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Smart unit conversion</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Buy in kilos, use in grams. baseUnit handles every conversion automatically — no mental math required.
            </p>
          </div>

          <div className="animate-slide-up bg-[var(--bg-surface)] rounded-[var(--radius-xl)] border border-[var(--border-default)] p-6 shadow-[var(--shadow-sm)]" style={{ animationDelay: '100ms' }}>
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-purple-50 dark:bg-purple-950 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Nested sub-recipes</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Build a dough, use it in a crust, put the crust in a pie. Costs cascade through every layer automatically.
            </p>
          </div>

          <div className="animate-slide-up bg-[var(--bg-surface)] rounded-[var(--radius-xl)] border border-[var(--border-default)] p-6 shadow-[var(--shadow-sm)]" style={{ animationDelay: '200ms' }}>
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-amber-50 dark:bg-amber-950 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Instant cost breakdown</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              See your total recipe cost and cost per serving the moment you add an ingredient. Price with confidence.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-xs text-[var(--text-tertiary)]">
          © {new Date().getFullYear()} baseUnit. Built for food businesses that care about margins.
        </p>
      </footer>
    </div>
  );
}
