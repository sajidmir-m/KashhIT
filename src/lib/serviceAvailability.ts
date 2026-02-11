import { isValidPincode } from './pincodeLookup';

export type ServiceabilityReason = 'serviceable' | 'invalid' | 'not_in_service_area';

export interface ServiceabilityResult {
  isServiceable: boolean;
  reason: ServiceabilityReason;
  message: string;
}

/**
 * Static list of pincodes where delivery service is available.
 *
 * NOTE:
 * - 190001 (Srinagar) is included as requested.
 * - Add or remove pincodes here as your service area expands.
 */
const SERVICEABLE_PINCODES = new Set<string>([
  '190001',
  // Add more pincodes here, e.g.:
  // '190002',
  // '190003',
]);

/**
 * Check whether a given pincode is serviceable.
 *
 * This is intentionally synchronous and side‑effect free so it can be safely
 * used inside React render functions and effects.
 */
export const checkPincodeServiceability = (pincode: string): ServiceabilityResult => {
  const normalized = (pincode || '').trim();

  if (!normalized) {
    return {
      isServiceable: false,
      reason: 'invalid',
      message: 'Please enter a 6‑digit pincode.',
    };
  }

  if (!isValidPincode(normalized)) {
    return {
      isServiceable: false,
      reason: 'invalid',
      message: 'Please enter a valid 6‑digit Indian pincode.',
    };
  }

  if (!SERVICEABLE_PINCODES.has(normalized)) {
    return {
      isServiceable: false,
      reason: 'not_in_service_area',
      message: 'Sorry, service is not available in your area yet.',
    };
  }

  return {
    isServiceable: true,
    reason: 'serviceable',
    message: 'Good news! We currently deliver to this pincode.',
  };
};


