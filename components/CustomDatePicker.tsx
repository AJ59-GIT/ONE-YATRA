
import React, { useState, useEffect, useRef } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, 
  isSameDay, isToday, isBefore, startOfDay, isWeekend, parseISO 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  isFlexible: boolean;
  onFlexibleChange: (val: boolean) => void;
  minDate?: string;
  className?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  isFlexible,
  onFlexibleChange,
  minDate = new Date().toISOString().split('T')[0],
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(parseISO(value));
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const minDateObj = startOfDay(parseISO(minDate));
  const selectedDateObj = parseISO(value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    const handleEscape = (event: KeyboardEvent) => {
        if (isOpen && event.key === 'Escape') {
            setIsOpen(false);
        }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Sync internal month state when value changes externally
  useEffect(() => {
    if (value) {
      setCurrentMonth(parseISO(value));
    }
  }, [value]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (day: Date, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBefore(day, minDateObj)) return;
    
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const toggleFlexible = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFlexibleChange(!isFlexible);
  };

  // Generate calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Simulated Price Indicator Logic
  const getPriceLevel = (day: Date) => {
    const dayNum = day.getDate();
    if (dayNum % 7 === 0 || dayNum % 6 === 0) return 'high'; 
    if (dayNum % 4 === 0) return 'mid';
    return 'low';
  };

  return (
    <div ref={wrapperRef} className="relative w-full group">
      {/* Trigger Input */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer ${className} outline-none focus:ring-2 focus:ring-brand-200 rounded-md p-1 -m-1`}
        role="button"
        tabIndex={0}
        aria-label={`Select date, current is ${format(selectedDateObj, 'EEE, d MMM yyyy')}`}
        aria-expanded={isOpen}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(!isOpen);
            }
        }}
      >
        <div className="flex items-center justify-between w-full text-gray-900 font-medium">
          <span>{format(selectedDateObj, 'EEE, d MMM yyyy')}</span>
          {isFlexible && (
             <span className="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-bold ml-2 whitespace-nowrap">
               ±3 Days
             </span>
          )}
        </div>
      </div>

      {/* Dropdown Calendar */}
      {isOpen && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 top-[calc(100%+12px)] bg-white rounded-xl shadow-2xl border border-gray-100 p-4 w-[320px] animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500" aria-label="Previous Month">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="font-bold text-gray-800">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500" aria-label="Next Month">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2" aria-hidden="true">
            {weekDays.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4" role="grid">
            {days.map((day, idx) => {
              const isDisabled = isBefore(day, minDateObj);
              const isSelected = isSameDay(day, selectedDateObj);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isWknd = isWeekend(day);
              const priceLevel = getPriceLevel(day);

              return (
                <button
                  key={idx}
                  onClick={(e) => !isDisabled && handleDateClick(day, e)}
                  disabled={isDisabled}
                  aria-label={format(day, 'd MMMM yyyy')}
                  aria-selected={isSelected}
                  className={`
                    relative h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500
                    ${!isCurrentMonth ? 'text-gray-300 opacity-50' : ''}
                    ${isDisabled ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-brand-50 cursor-pointer'}
                    ${isSelected 
                        ? 'bg-brand-600 text-white font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/30' 
                        : isWknd && !isDisabled ? 'text-red-400 font-medium' : 'text-gray-700'}
                  `}
                >
                  {format(day, 'd')}
                  
                  {/* Price Indicator Dots (Only for future dates) */}
                  {!isDisabled && !isSelected && isCurrentMonth && (
                    <div className={`absolute bottom-1 w-1 h-1 rounded-full 
                      ${priceLevel === 'low' ? 'bg-green-500' : priceLevel === 'mid' ? 'bg-orange-400' : 'bg-red-400'}
                    `}></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-4 text-[10px] text-gray-400 mb-4 border-t border-gray-50 pt-3" aria-hidden="true">
             <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>Low</div>
             <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>Mid</div>
             <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>High</div>
          </div>

          {/* Footer Toggle */}
          <div 
            onClick={toggleFlexible}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') toggleFlexible(e); }}
            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
             <div className="text-xs font-semibold text-gray-700">Flexible Dates</div>
             <div className={`w-10 h-5 rounded-full p-0.5 flex transition-colors ${isFlexible ? 'bg-brand-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
             </div>
          </div>
          <div className="text-[10px] text-gray-400 text-center mt-2">
            Search ±3 days from selected date
          </div>
        </div>
      )}
    </div>
  );
};
