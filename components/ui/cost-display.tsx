import React from 'react';
import { formatCurrency, formatCurrencyPrecise } from '@/lib/utils/units';

interface CostDisplayProps {
  amount: number | null | undefined;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  precise?: boolean;
  perUnit?: string;
  className?: string;
}

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export function CostDisplay({
  amount,
  label,
  size = 'md',
  precise = false,
  perUnit,
  className = '',
}: CostDisplayProps) {
  const formatted = precise ? formatCurrencyPrecise(amount) : formatCurrency(amount);

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">
          {label}
        </span>
      )}
      <span
        className={`
          font-serif font-bold tabular-nums tracking-tight
          text-[var(--color-cost)]
          ${sizeStyles[size]}
        `}
      >
        {formatted}
        {perUnit && (
          <span className="text-[var(--text-tertiary)] font-normal text-[0.6em] ml-0.5">
            /{perUnit}
          </span>
        )}
      </span>
    </div>
  );
}
