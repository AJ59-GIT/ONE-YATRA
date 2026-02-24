
import React from 'react';
import { Skeleton } from './Skeleton';

export const TravelCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 overflow-hidden">
      {/* Top Banner Tag */}
      <Skeleton className="w-20 h-4 mb-4 rounded-full" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Icon & Provider */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Skeleton variant="circle" className="h-14 w-14 shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>

        {/* Center: Timeline */}
        <div className="flex items-center gap-6 flex-1 justify-center px-4">
           <div className="text-center space-y-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-12 mx-auto" />
           </div>
           
           <div className="flex flex-col items-center w-full max-w-[120px] space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-1 w-full" />
           </div>

           <div className="text-center space-y-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-12 mx-auto" />
           </div>
        </div>

        {/* Right: Price & Button */}
        <div className="flex items-center justify-between md:flex-col md:items-end gap-3 min-w-[120px]">
           <div className="text-right space-y-2">
             <Skeleton className="h-8 w-24 ml-auto" />
             <Skeleton className="h-3 w-20 ml-auto" />
           </div>
           
           <Skeleton className="h-12 w-full md:w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
