
import { TransportMode } from "../types";

export interface TrendingRoute {
  id: string;
  origin: string;
  destination: string;
  minPrice: number;
  duration: string;
  modes: TransportMode[];
  gradient: string;
}

export const getTrendingRoutes = (): TrendingRoute[] => [
  {
    id: 'tr-1',
    origin: 'Mumbai',
    destination: 'Pune',
    minPrice: 120,
    duration: '3h 00m',
    modes: ['TRAIN', 'BUS', 'CAB'],
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'tr-2',
    origin: 'New Delhi',
    destination: 'Agra',
    minPrice: 180,
    duration: '2h 15m',
    modes: ['TRAIN', 'CAB'],
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: 'tr-3',
    origin: 'Bengaluru',
    destination: 'Mysuru',
    minPrice: 90,
    duration: '2h 00m',
    modes: ['TRAIN', 'BUS'],
    gradient: 'from-emerald-500 to-green-600'
  },
  {
    id: 'tr-4',
    origin: 'New Delhi',
    destination: 'Jaipur',
    minPrice: 350,
    duration: '4h 30m',
    modes: ['BUS', 'TRAIN', 'CAB'],
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 'tr-5',
    origin: 'Chennai',
    destination: 'Bengaluru',
    minPrice: 450,
    duration: '5h 15m',
    modes: ['TRAIN', 'FLIGHT', 'BUS'],
    gradient: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'tr-6',
    origin: 'Mumbai',
    destination: 'Goa',
    minPrice: 800,
    duration: '9h 30m',
    modes: ['TRAIN', 'BUS', 'FLIGHT'],
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'tr-7',
    origin: 'Delhi',
    destination: 'Chandigarh',
    minPrice: 500,
    duration: '3h 30m',
    modes: ['BUS', 'TRAIN', 'CAB'],
    gradient: 'from-purple-500 to-fuchsia-600'
  },
  {
    id: 'tr-8',
    origin: 'Hyderabad',
    destination: 'Vijayawada',
    minPrice: 350,
    duration: '4h 45m',
    modes: ['BUS', 'TRAIN'],
    gradient: 'from-teal-500 to-emerald-500'
  }
];
