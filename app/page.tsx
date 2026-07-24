import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Scale, Layers, Calculator, Zap, ArrowRight } from 'lucide-react';

export default async function LandingPage() {
  // If user is already logged in, go straight to dashboard
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
      {/* Header */}
      <header className="px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-[var(--text-primary)] tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center shadow-sm">
              <span className="text-[var(--bg-primary)] text-sm font-black">b</span>
            </div>
            baseUnit
          </div>
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-semibold rounded-[var(--radius-md)] border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-all shadow-sm"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-12 pb-24">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] text-xs font-semibold mb-8 shadow-sm tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 text-[var(--text-primary)]" />
            Fewer bottlenecks, faster fulfillment
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.05] mb-8">
            Know the true cost of{' '}
            <span className="text-[var(--text-tertiary)]">every dish</span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Stop guessing your margins. Track what you buy, build your recipes,
            and instantly see exactly what each dish costs — down to the gram.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-[var(--bg-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all"
            >
              Get started — it&apos;s free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="max-w-5xl mx-auto mt-32 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
          <div className="animate-slide-up bg-[var(--bg-surface)] rounded-[var(--radius-xl)] border border-[var(--border-default)] p-8 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow">
            <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--bg-surface-hover)] border border-[var(--border-default)] flex items-center justify-center mb-6">
              <Scale className="w-6 h-6 text-[var(--text-primary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Smart unit conversion</h3>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed">
              Buy in kilos, use in grams. baseUnit handles every conversion automatically — no mental math required.
            </p>
          </div>

          <div className="animate-slide-up bg-[var(--bg-surface)] rounded-[var(--radius-xl)] border border-[var(--border-default)] p-8 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow" style={{ animationDelay: '100ms' }}>
            <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--bg-surface-hover)] border border-[var(--border-default)] flex items-center justify-center mb-6">
              <Layers className="w-6 h-6 text-[var(--text-primary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Nested sub-recipes</h3>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed">
              Build a dough, use it in a crust, put the crust in a pie. Costs cascade through every layer automatically.
            </p>
          </div>

          <div className="animate-slide-up bg-[var(--bg-surface)] rounded-[var(--radius-xl)] border border-[var(--border-default)] p-8 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow" style={{ animationDelay: '200ms' }}>
            <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--bg-surface-hover)] border border-[var(--border-default)] flex items-center justify-center mb-6">
              <Calculator className="w-6 h-6 text-[var(--text-primary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Instant cost breakdown</h3>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed">
              See your total recipe cost and cost per serving the moment you add an ingredient. Price with confidence.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 text-center border-t border-[var(--border-default)] bg-[var(--bg-surface)] mt-auto">
        <p className="text-sm text-[var(--text-tertiary)]">
          © {new Date().getFullYear()} baseUnit. Built for food businesses that care about margins.
        </p>
      </footer>
    </div>
  );
}
