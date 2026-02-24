
import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface FormErrorSummaryProps {
  errors: Record<string, string>;
  title?: string;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({ 
  errors, 
  title = "There was a problem" 
}) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorList = Object.values(errors).filter(Boolean);

  useEffect(() => {
    if (errorList.length > 0) {
      summaryRef.current?.focus();
    }
  }, [errorList.length]);

  if (errorList.length === 0) return null;

  return (
    <div 
      ref={summaryRef}
      className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-red-500"
      role="alert"
      tabIndex={-1}
      aria-labelledby="error-summary-title"
    >
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" aria-hidden="true" />
        <div>
          <h3 id="error-summary-title" className="text-sm font-bold text-red-800 dark:text-red-300">
            {title}
          </h3>
          <ul className="mt-2 text-sm text-red-700 dark:text-red-400 list-disc list-inside">
            {errorList.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
