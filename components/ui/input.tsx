import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className = '', ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-[var(--text-primary)]"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`
          w-full px-3.5 py-2.5 rounded-[var(--radius-md)]
          bg-[var(--bg-surface)] border
          text-[var(--text-primary)] text-sm
          placeholder:text-[var(--text-tertiary)]
          transition-all duration-[var(--transition-fast)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
          ${error
            ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
            : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
          }
          ${className}
        `}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-[var(--text-tertiary)]">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-[var(--color-danger)] flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
