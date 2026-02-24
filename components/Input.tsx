
import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, helperText, className = '', containerClassName = '', id, required, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={`mb-4 ${containerClassName}`}>
        <label htmlFor={inputId} className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && <span className="text-red-600 dark:text-red-400" aria-hidden="true">*</span>}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-3 border rounded-lg transition-colors
              focus:ring-2 focus:ring-offset-0 outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              bg-white text-gray-900
              dark:bg-slate-800 dark:text-white
              ${error 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                : success 
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-200' 
                  : 'border-gray-300 dark:border-gray-600 focus:border-brand-500 focus:ring-brand-200'
              }
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`}
            required={required}
            {...props}
          />
          {error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
          )}
          {!error && success && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-xs text-red-600 dark:text-red-400 font-bold flex items-center" role="alert">
            <span className="sr-only">Error: </span>
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
