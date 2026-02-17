export type ReverseGeocodeResult = {
  displayName: string;
  city?: string;
  state?: string;
  pincode?: string;
};

const CITY_KEYS = ["city", "town", "village", "hamlet", "suburb"] as const;

function pickCity(address: Record<string, any> | undefined): string | undefined {
  if (!address) return undefined;
  for (const k of CITY_KEYS) {
    const v = address[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

export function normalizePincode(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 6) return undefined;
  return digits;
}

const GOOGLE_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

/**
 * Reverse geocode using Google Maps Geocoding API (preferred when key is present).
 */
export async function reverseGeocodeGoogle(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
  if (!GOOGLE_API_KEY) return null;

  const params = new URLSearchParams({
    latlng: `${lat},${lon}`,
    key: GOOGLE_API_KEY,
    language: "en",
  });

  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`);
  if (!res.ok) return null;

  const json: any = await res.json();
  if (!json || json.status !== "OK" || !Array.isArray(json.results) || json.results.length === 0) {
    return null;
  }

  const result = json.results[0];
  const displayName = typeof result.formatted_address === "string" ? result.formatted_address : "";

  const components = Array.isArray(result.address_components) ? result.address_components : [];

  const getComponent = (types: string[]): string | undefined => {
    const comp = components.find((c: any) => Array.isArray(c.types) && c.types.some((t: string) => types.includes(t)));
    return typeof comp?.long_name === "string" ? comp.long_name : undefined;
  };

  const city =
    getComponent(["locality"]) ||
    getComponent(["administrative_area_level_2"]) ||
    getComponent(["sublocality", "sublocality_level_1"]);

  const state = getComponent(["administrative_area_level_1"]);
  const postalCode = getComponent(["postal_code"]);

  return {
    displayName: displayName || "",
    city: city,
    state: state,
    pincode: normalizePincode(postalCode),
  };
}

/**
 * Reverse geocode using OpenStreetMap Nominatim.
 * Used as a fallback when Google is not available or fails.
 */
export async function reverseGeocodeOSM(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
  const url =
    `https://nominatim.openstreetmap.org/reverse?` +
    new URLSearchParams({
      format: "jsonv2",
      lat: String(lat),
      lon: String(lon),
      addressdetails: "1",
      zoom: "18",
    }).toString();

  const res = await fetch(url, {
    headers: {
      // Being explicit helps some deployments (browser will still set UA)
      Accept: "application/json",
    },
  });

  if (!res.ok) return null;
  const json: any = await res.json();

  const displayName = typeof json?.display_name === "string" ? json.display_name : "";
  const address = json?.address as Record<string, any> | undefined;

  return {
    displayName: displayName || "",
    city: pickCity(address),
    state: typeof address?.state === "string" ? address.state : undefined,
    pincode: normalizePincode(address?.postcode),
  };
}

/**
 * Main reverse-geocode helper: prefers Google when your API key is set,
 * and automatically falls back to OpenStreetMap if needed.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
  // Try Google first (if configured)
  if (GOOGLE_API_KEY) {
    try {
      const googleResult = await reverseGeocodeGoogle(lat, lon);
      if (googleResult) return googleResult;
    } catch (e) {
      console.warn("Google reverse geocode failed, falling back to OSM", e);
    }
  }

  // Fallback to OSM
  try {
    return await reverseGeocodeOSM(lat, lon);
  } catch (e) {
    console.warn("OSM reverse geocode failed", e);
    return null;
  }
}

