
import React, { useState } from 'react';
import { ShieldCheck, Globe, UserCheck, MapPin, Umbrella, Award, Info } from 'lucide-react';
import { TrustBadge } from '../types';

interface TrustIndicatorsProps {
  badges: TrustBadge[];
}

export const TrustIndicators: React.FC<TrustIndicatorsProps> = ({ badges }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  if (!badges || badges.length === 0) return null;

  const getIcon = (iconName: string) => {
      switch (iconName) {
          case 'ShieldCheck': return <ShieldCheck className="h-3 w-3" />;
          case 'Globe': return <Globe className="h-3 w-3" />;
          case 'UserCheck': return <UserCheck className="h-3 w-3" />;
          case 'MapPin': return <MapPin className="h-3 w-3" />;
          case 'Umbrella': return <Umbrella className="h-3 w-3" />;
          case 'Award': return <Award className="h-3 w-3" />;
          default: return <ShieldCheck className="h-3 w-3" />;
      }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {badges.map(badge => (
        <div key={badge.id} className="relative">
            <button
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border border-transparent hover:border-current transition-all cursor-help ${badge.color}`}
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === badge.id ? null : badge.id); }}
                onMouseEnter={() => setActiveTooltip(badge.id)}
                onMouseLeave={() => setActiveTooltip(null)}
            >
                {getIcon(badge.icon)}
                <span>{badge.label}</span>
            </button>

            {activeTooltip === badge.id && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 pointer-events-none">
                    <p className="font-bold mb-1">{badge.label}</p>
                    <p className="opacity-90 leading-tight">{badge.description}</p>
                    {badge.authority && (
                        <div className="mt-2 pt-2 border-t border-gray-700 text-[10px] text-gray-400">
                            Verified by {badge.authority}
                        </div>
                    )}
                    <div className="absolute bottom-[-4px] left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
            )}
        </div>
      ))}
    </div>
  );
};
