import * as Location from 'expo-location';

import type { DraftLocation } from '@/store/app-store';

export type LocationResult =
  | { ok: true; location: DraftLocation }
  | { ok: false; reason: 'denied' | 'blocked' | 'disabled' | 'timeout' | 'error' };

const TIMEOUT_MS = 15000;

/**
 * One-shot location for a complaint (no tracking). Coordinates are never
 * invented: any failure returns a reason instead of a position.
 */
export async function getComplaintLocation(): Promise<LocationResult> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return { ok: false, reason: perm.canAskAgain ? 'denied' : 'blocked' };

    if (!(await Location.hasServicesEnabledAsync())) return { ok: false, reason: 'disabled' };

    const position = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), TIMEOUT_MS)),
    ]);
    if (!position) return { ok: false, reason: 'timeout' };

    const { latitude, longitude, accuracy } = position.coords;
    const place = await reverseGeocode(latitude, longitude);
    return {
      ok: true,
      location: { latitude, longitude, accuracyM: accuracy != null ? Math.round(accuracy) : null, ...place },
    };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

/** Readable address from the device geocoder. Display-only; may be null. */
async function reverseGeocode(latitude: number, longitude: number) {
  try {
    const [g] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!g) return { address: null, locality: null, city: null };
    const parts = [g.name, g.street, g.district].filter((p, i, all): p is string => !!p && all.indexOf(p) === i);
    // Skip a bare house number as the first part ("12, FC Road" → "FC Road").
    const line = parts.filter((p) => !/^\d+[a-z]?$/i.test(p)).join(', ');
    const tail = [g.city, g.postalCode].filter(Boolean).join(' ');
    return {
      address: line || g.formattedAddress || null,
      locality: [g.district ?? g.subregion, tail].filter(Boolean).join(', ') || null,
      city: g.city ?? null,
    };
  } catch {
    return { address: null, locality: null, city: null };
  }
}
