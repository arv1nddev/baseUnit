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
    'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  subrecipe:
    'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
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
