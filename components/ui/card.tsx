import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-default)]
        shadow-[var(--shadow-sm)] transition-all duration-[var(--transition-normal)]
        ${hover ? 'hover:shadow-[var(--shadow-md)] hover:border-[var(--border-strong)] cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {children}
    </div>
  );
}
