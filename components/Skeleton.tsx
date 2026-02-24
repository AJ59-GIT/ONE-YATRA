
import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const baseClasses = "skeleton animate-shimmer";
  
  let variantClasses = "rounded"; // Default rect
  if (variant === 'circle') variantClasses = "rounded-full";
  if (variant === 'text') variantClasses = "rounded h-4 w-3/4";

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`} aria-hidden="true" />
  );
};
