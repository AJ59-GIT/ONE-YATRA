
import { useCallback } from 'react';

export const useVibration = () => {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const vibrateSuccess = () => vibrate([50, 50, 50]);
  const vibrateError = () => vibrate([50, 100, 50, 100, 50]);
  const vibrateTap = () => vibrate(15);

  return { vibrate, vibrateSuccess, vibrateError, vibrateTap };
};
