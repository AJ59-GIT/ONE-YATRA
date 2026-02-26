
export type IdDocType = 'AADHAAR' | 'PAN' | 'PASSPORT' | 'VISA' | 'OTHER' | 'VOTER_ID' | 'DRIVING_LICENSE';

export interface ValidationResult {
  isValid: boolean;
  normalized: string;
  error?: string;
}

export const validateIdNumber = (type: IdDocType, value: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, normalized: value, error: 'ID number cannot be empty' };
  }

  let normalized = value.trim();

  switch (type) {
    case 'AADHAAR':
      // Normalize: Remove spaces and hyphens
      normalized = normalized.replace(/[\s-]/g, '');
      if (!/^[2-9][0-9]{11}$/.test(normalized)) {
        return { 
          isValid: false, 
          normalized, 
          error: 'Aadhaar must be 12 digits and cannot start with 0 or 1' 
        };
      }
      break;

    case 'PAN':
      normalized = normalized.toUpperCase().replace(/[\s-]/g, '');
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalized)) {
        return { 
          isValid: false, 
          normalized, 
          error: 'PAN must be 10 characters in format AAAAA9999A' 
        };
      }
      break;

    case 'PASSPORT':
      normalized = normalized.toUpperCase().replace(/[\s-]/g, '');
      if (!/^[A-Z][0-9]{7}$/.test(normalized)) {
        return { 
          isValid: false, 
          normalized, 
          error: 'Passport must be 1 letter followed by 7 digits' 
        };
      }
      break;

    case 'VISA':
      normalized = normalized.toUpperCase().replace(/[\s-]/g, '');
      if (!/^[A-Z0-9]{6,20}$/.test(normalized)) {
        return { 
          isValid: false, 
          normalized, 
          error: 'Visa number must be 6-20 alphanumeric characters' 
        };
      }
      break;

    case 'VOTER_ID':
      normalized = normalized.toUpperCase().replace(/[\s-]/g, '');
      // Generic Voter ID format: 3 letters followed by 7 digits (EPIC number)
      if (!/^[A-Z]{3}[0-9]{7}$/.test(normalized)) {
        return { 
          isValid: false, 
          normalized, 
          error: 'Voter ID must be in format ABC1234567' 
        };
      }
      break;

    case 'DRIVING_LICENSE':
      normalized = normalized.toUpperCase().replace(/[\s-]/g, '');
      // Generic Indian DL: 15-16 characters
      if (!/^[A-Z]{2}[0-9]{13,14}$/.test(normalized)) {
        return { 
          isValid: false, 
          normalized, 
          error: 'Driving License must start with 2-letter state code followed by 13-14 digits' 
        };
      }
      break;

    case 'OTHER':
    default:
      if (normalized.length < 4 || normalized.length > 30) {
        return { 
          isValid: false, 
          normalized, 
          error: 'ID number must be between 4 and 30 characters' 
        };
      }
      break;
  }

  return { isValid: true, normalized };
};
