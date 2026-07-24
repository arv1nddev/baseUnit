import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'ingredient' | 'subrecipe' | 'cost';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]',
  primary:
    'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
  ingredient:
    'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700',
  subrecipe:
    'bg-slate-200 text-slate-900 dark:bg-zinc-700 dark:text-zinc-100 border border-slate-300 dark:border-zinc-600',
  cost:
    'bg-[var(--color-cost-bg)] text-[var(--color-cost-text)]',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-[var(--radius-sm)]
        text-xs font-medium whitespace-nowrap
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
