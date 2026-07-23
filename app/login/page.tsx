'use client';

import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center mb-4 shadow-[var(--shadow-md)]">
            <span className="text-white text-xl font-black">b</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Welcome to baseUnit
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Sign in to manage your recipes and costs
          </p>
        </div>

        {/* Sign in card */}
        <div className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] border border-[var(--border-default)] shadow-[var(--shadow-lg)] p-6">
          <button
            onClick={handleGoogleLogin}
            className="
              w-full flex items-center justify-center gap-3
              px-4 py-3 rounded-[var(--radius-md)]
              bg-[var(--bg-surface)] border border-[var(--border-default)]
              text-[var(--text-primary)] text-sm font-medium
              hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-strong)]
              hover:shadow-[var(--shadow-sm)]
              transition-all duration-[var(--transition-normal)]
              active:scale-[0.98] cursor-pointer
            "
          >
            {/* Google logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-xs text-[var(--text-tertiary)] mt-6">
          By signing in, you agree to let baseUnit calculate your recipe costs.
          We never share your data.
        </p>
      </div>
    </div>
  );
}
