import React from 'react';
import { Plane, Bus, Train, Car } from 'lucide-react';
import { TransportMode } from '../types';

interface TransportIconProps {
  mode: TransportMode;
  className?: string;
}

export const TransportIcon: React.FC<TransportIconProps> = ({ mode, className = "h-5 w-5" }) => {
  switch (mode) {
    case 'FLIGHT':
      return <Plane className={className} />;
    case 'BUS':
      return <Bus className={className} />;
    case 'TRAIN':
      return <Train className={className} />;
    case 'CAB':
      return <Car className={className} />;
    default:
      return <Car className={className} />;
  }
};