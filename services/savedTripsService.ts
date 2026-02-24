
import { SavedTrip, TravelOption } from "../types";

const STORAGE_KEY = 'oneyatra_saved_trips_data';

export const getSavedTrips = (): SavedTrip[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load saved trips", e);
    return [];
  }
};

export const saveTrip = (option: TravelOption, origin: string, destination: string, date: string): SavedTrip[] => {
  const current = getSavedTrips();
  
  // Check if already saved to prevent duplicates
  if (current.some(s => s.option.id === option.id)) {
    return current;
  }

  const newSavedTrip: SavedTrip = {
    id: `save-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    option,
    origin,
    destination,
    date,
    savedAt: Date.now()
  };

  const updated = [newSavedTrip, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const removeTrip = (optionId: string): SavedTrip[] => {
  const current = getSavedTrips();
  const updated = current.filter(s => s.option.id !== optionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const isTripSaved = (optionId: string): boolean => {
  const current = getSavedTrips();
  return current.some(s => s.option.id === optionId);
};
