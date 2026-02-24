
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-200 ${className}`}>
      <div className="bg-gray-50 p-6 rounded-full mb-6 relative group">
        <div className="absolute inset-0 bg-brand-100 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 opacity-50"></div>
        <Icon className="h-10 w-10 text-gray-400 group-hover:text-brand-500 relative z-10 transition-colors duration-300" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="px-8 shadow-lg shadow-brand-500/20">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
