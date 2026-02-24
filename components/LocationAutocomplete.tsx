
import React, { useState, useEffect, useRef } from 'react';
import { Plane, Building2, MapPin, Home, Briefcase, Star } from 'lucide-react';
import { LocationSuggestion, searchLocations } from '../services/locationService';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder,
  className,
  required
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      // If empty, show defaults (e.g. saved addresses)
      if (value.length < 1) {
         setSuggestions([]); 
         return;
      }
      setIsLoading(true);
      const results = await searchLocations(value);
      setSuggestions(results);
      setIsLoading(false);
      setIsOpen(results.length > 0);
    };

    const timer = setTimeout(fetchSuggestions, 300); // 300ms Debounce
    return () => clearTimeout(timer);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        e.preventDefault();
        selectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const selectSuggestion = (s: LocationSuggestion) => {
    onChange(s.fullAddress || s.city);
    setIsOpen(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
    // Return focus to input (though it likely already has it)
    inputRef.current?.focus();
  };

  const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? <span key={i} className="font-bold text-brand-600">{part}</span> : part
        )}
      </span>
    );
  };

  const getIcon = (item: LocationSuggestion) => {
      if (item.type === 'AIRPORT') return <Plane className="h-4 w-4" aria-hidden="true" />;
      if (item.type === 'SAVED') {
          const lowerCity = item.city.toLowerCase();
          if (lowerCity.includes('home')) return <Home className="h-4 w-4" aria-hidden="true" />;
          if (lowerCity.includes('work') || lowerCity.includes('office')) return <Briefcase className="h-4 w-4" aria-hidden="true" />;
          return <Star className="h-4 w-4" aria-hidden="true" />;
      }
      return <Building2 className="h-4 w-4" aria-hidden="true" />;
  };

  const getIconBg = (item: LocationSuggestion) => {
      if (item.type === 'AIRPORT') return 'bg-blue-50 text-blue-600';
      if (item.type === 'SAVED') return 'bg-brand-50 text-brand-600';
      return 'bg-gray-100 text-gray-500';
  };

  const activeDescendantId = highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined;

  return (
    <div ref={wrapperRef} className="w-full relative group">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
             onChange(e.target.value);
             if(!isOpen && e.target.value.length >= 1) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 1 && setIsOpen(true)}
          className={className}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-activedescendant={activeDescendantId}
          aria-label={placeholder || "Location Search"}
        />
        
        {isOpen && (
           <ul 
             id="location-listbox"
             role="listbox"
             className="absolute z-50 left-0 right-0 top-[calc(100%+8px)] bg-white border border-gray-100 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-gray-50 animate-in fade-in slide-in-from-top-2 duration-200"
           >
              {suggestions.map((item, index) => (
                <li 
                  key={item.id}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  onClick={() => selectSuggestion(item)}
                  className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${index === highlightedIndex ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
                >
                   <div className={`p-2 rounded-full mr-3 shrink-0 ${getIconBg(item)}`}>
                      {getIcon(item)}
                   </div>
                   <div className="flex-grow min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate flex items-center gap-2">
                        <HighlightText text={item.city} highlight={value} />
                        {item.code && <span className="text-[10px] font-bold text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded bg-gray-50 tracking-wider">{item.code}</span>}
                        {item.type === 'SAVED' && <span className="text-[9px] bg-brand-100 text-brand-700 px-1.5 rounded uppercase font-bold">Saved</span>}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {item.state}{item.country !== 'India' ? `, ${item.country}` : ''}
                      </div>
                   </div>
                </li>
              ))}
           </ul>
        )}
    </div>
  );
};
