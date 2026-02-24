
import React, { useState, useEffect } from 'react';
import { Check, Info, ZoomIn, ZoomOut } from 'lucide-react';
import { TransportMode } from '../types';
import { Button } from './Button';

interface Seat {
  id: string;
  row: number;
  col: string; // A, B, C...
  type: 'STANDARD' | 'WINDOW' | 'AISLE' | 'EXTRA_LEGROOM';
  status: 'AVAILABLE' | 'OCCUPIED' | 'SELECTED';
  price: number;
  label: string;
}

interface SeatMapProps {
  mode: TransportMode;
  passengersCount: number;
  onConfirm: (selectedSeats: Seat[]) => void;
  onSkip: () => void;
  basePrice: number;
}

export const SeatMap: React.FC<SeatMapProps> = ({ 
  mode, 
  passengersCount, 
  onConfirm, 
  onSkip,
  basePrice 
}) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
  const [scale, setScale] = useState(1);

  // Generate Mock Seat Map
  useEffect(() => {
    const generatedSeats: Seat[] = [];
    const rows = mode === 'BUS' ? 10 : mode === 'FLIGHT' ? 20 : 15;
    const config = getLayoutConfig(mode);
    
    for (let r = 1; r <= rows; r++) {
      config.cols.forEach(col => {
        const isOccupied = Math.random() < 0.3; // 30% occupied chance
        let type: Seat['type'] = 'STANDARD';
        let price = 0;

        // Determine Type & Price
        if (config.windowCols.includes(col)) {
          type = 'WINDOW';
          price = 150;
        } else if (config.aisleCols.includes(col)) {
          type = 'AISLE';
          price = 100;
        }

        if (r === 1 || r === 10 || (mode === 'FLIGHT' && r === 12)) {
          type = 'EXTRA_LEGROOM';
          price = 400;
        }

        if (mode === 'TRAIN') {
           // Simplified Train Pricing
           price = type === 'WINDOW' ? 50 : 0;
        }

        generatedSeats.push({
          id: `${r}${col}`,
          row: r,
          col,
          type,
          status: isOccupied ? 'OCCUPIED' : 'AVAILABLE',
          price,
          label: `${r}${col}`
        });
      });
    }
    setSeats(generatedSeats);
  }, [mode]);

  const getLayoutConfig = (mode: TransportMode) => {
    switch (mode) {
      case 'BUS':
        return { cols: ['A', 'B', 'C', 'D'], windowCols: ['A', 'D'], aisleCols: ['B', 'C'], gapAfter: 'B' };
      case 'TRAIN':
        return { cols: ['A', 'B', 'C', 'D', 'E'], windowCols: ['A', 'E'], aisleCols: ['C'], gapAfter: 'C' }; // 2-3 Layout
      case 'FLIGHT':
      default:
        return { cols: ['A', 'B', 'C', 'D', 'E', 'F'], windowCols: ['A', 'F'], aisleCols: ['C', 'D'], gapAfter: 'C' }; // 3-3 Layout
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'OCCUPIED') return;

    const newSelected = new Set(selectedSeatIds);
    if (newSelected.has(seat.id)) {
      newSelected.delete(seat.id);
    } else {
      if (newSelected.size < passengersCount) {
        newSelected.add(seat.id);
      } else {
        if (passengersCount === 1) {
             newSelected.clear();
             newSelected.add(seat.id);
        } else {
            return; // Max reached
        }
      }
    }
    setSelectedSeatIds(newSelected);
  };

  const handleConfirm = () => {
    const selected = seats.filter(s => selectedSeatIds.has(s.id));
    onConfirm(selected);
  };

  // Group seats by row for rendering
  const rows = Array.from(new Set(seats.map(s => s.row)));
  const layout = getLayoutConfig(mode);

  const getSeatColor = (seat: Seat, isSelected: boolean) => {
    if (seat.status === 'OCCUPIED') return 'bg-gray-300 border-gray-400 cursor-not-allowed pattern-diagonal opacity-60';
    if (isSelected) return 'bg-blue-600 border-blue-800 text-white shadow-md transform scale-105 high-contrast:bg-black high-contrast:border-white';
    if (seat.type === 'EXTRA_LEGROOM') return 'bg-purple-100 border-purple-300 text-purple-900 pattern-dots hover:bg-purple-200';
    if (seat.type === 'WINDOW') return 'bg-green-50 border-green-300 text-green-900 hover:bg-green-100';
    return 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50';
  };

  const selectedList = seats.filter(s => selectedSeatIds.has(s.id));
  const totalExtra = selectedList.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col h-full bg-slate-50 rounded-xl border border-gray-200 overflow-hidden">
      
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
         <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Select Seats
              <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full" role="status">
                {selectedSeatIds.size}/{passengersCount} Selected
              </span>
            </h2>
            <p className="text-xs text-gray-500">Tap available seats to select</p>
         </div>
         <div className="flex gap-2">
            <button onClick={() => setScale(Math.max(0.7, scale - 0.1))} className="p-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-600" aria-label="Zoom Out"><ZoomOut className="h-4 w-4"/></button>
            <button onClick={() => setScale(Math.min(1.5, scale + 0.1))} className="p-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-600" aria-label="Zoom In"><ZoomIn className="h-4 w-4"/></button>
         </div>
      </div>

      {/* Legend */}
      <div className="bg-white px-4 py-2 border-b border-gray-100 flex gap-4 text-[10px] text-gray-600 justify-center flex-wrap" aria-hidden="true">
         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-gray-300 rounded"></div> Available</div>
         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-300 border border-gray-400 rounded pattern-diagonal"></div> Occupied</div>
         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-600 rounded"></div> Selected</div>
         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div> Window (₹150)</div>
         <div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded pattern-dots"></div> XL (₹400)</div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto p-8 bg-slate-100 flex justify-center items-start custom-scrollbar relative">
         <div 
            className="transition-transform duration-200 origin-top"
            style={{ transform: `scale(${scale})` }}
            role="grid"
            aria-label="Seat Map"
         >
            {/* Front Label */}
            <div className="w-full text-center text-gray-300 font-bold uppercase tracking-[0.5em] text-xs mb-8" aria-hidden="true">
               FRONT
            </div>

            <div className="flex flex-col gap-3">
               {rows.map(row => (
                  <div key={row} className="flex gap-3 justify-center items-center" role="row">
                     <span className="w-4 text-xs font-bold text-gray-400 text-right mr-2" aria-hidden="true">{row}</span>
                     {layout.cols.map((col, idx) => {
                        const seat = seats.find(s => s.row === row && s.col === col);
                        if (!seat) return <div key={col} className="w-10 h-10"></div>;
                        
                        const isSelected = selectedSeatIds.has(seat.id);
                        const isGap = layout.gapAfter === col;
                        const labelText = `Seat ${seat.label}, ${seat.type.replace('_', ' ')}, Price ${seat.price} rupees, ${seat.status === 'OCCUPIED' ? 'Occupied' : isSelected ? 'Selected' : 'Available'}`;

                        return (
                           <React.Fragment key={seat.id}>
                              <button
                                 onClick={() => handleSeatClick(seat)}
                                 disabled={seat.status === 'OCCUPIED'}
                                 className={`
                                    w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold border transition-all relative group
                                    ${getSeatColor(seat, isSelected)}
                                 `}
                                 title={`${seat.label} - ${seat.type} - ₹${seat.price}`}
                                 aria-label={labelText}
                                 aria-pressed={isSelected}
                                 aria-disabled={seat.status === 'OCCUPIED'}
                              >
                                 {seat.status === 'OCCUPIED' ? (
                                    <span className="text-gray-500 select-none font-bold" aria-hidden="true">✕</span>
                                 ) : (
                                    <>
                                       {isSelected ? <Check className="h-5 w-5 stroke-2" aria-hidden="true" /> : (
                                           <div className="flex flex-col items-center">
                                               <span>{seat.col}</span>
                                               {/* Visual Indicators for non-color users */}
                                               {seat.type === 'WINDOW' && <span className="text-[8px] font-normal opacity-70 absolute bottom-1">W</span>}
                                               {seat.type === 'EXTRA_LEGROOM' && <span className="text-[8px] font-normal opacity-70 absolute bottom-1">XL</span>}
                                           </div>
                                       )}
                                    </>
                                 )}
                                 
                                 {/* Hover Tooltip */}
                                 <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20" aria-hidden="true">
                                    {seat.label} • ₹{seat.price}
                                    <div className="block text-gray-400 text-[9px]">{seat.type.replace('_', ' ')}</div>
                                 </div>
                              </button>
                              {isGap && <div className="w-8"></div>}
                           </React.Fragment>
                        );
                     })}
                     <span className="w-4 text-xs font-bold text-gray-400 text-left ml-2" aria-hidden="true">{row}</span>
                  </div>
               ))}
            </div>

            <div className="w-full text-center text-gray-300 font-bold uppercase tracking-[0.5em] text-xs mt-8" aria-hidden="true">
               REAR
            </div>
         </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
         <div className="flex justify-between items-end mb-4">
            <div>
               <div className="text-xs text-gray-500 mb-1">Seats Price</div>
               <div className="text-xl font-bold text-gray-900">₹{totalExtra.toLocaleString()}</div>
            </div>
            {selectedSeatIds.size < passengersCount && (
               <div className="text-xs text-orange-600 flex items-center bg-orange-50 px-2 py-1 rounded border border-orange-200" role="alert">
                  <Info className="h-3 w-3 mr-1" aria-hidden="true"/> Select {passengersCount - selectedSeatIds.size} more
               </div>
            )}
         </div>
         <div className="flex gap-3">
            <button 
               onClick={onSkip}
               className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
            >
               Skip Selection
            </button>
            <Button 
               onClick={handleConfirm}
               disabled={selectedSeatIds.size !== passengersCount}
               className="flex-[2]"
            >
               Confirm {selectedSeatIds.size} Seats
            </Button>
         </div>
      </div>
    </div>
  );
};
