import { signal } from '@angular/core';

import type { Building, LatLng } from './models';

/**
 * Map centre for NEUST Sumacab. APPROXIMATE: replace with the campus's surveyed
 * centre once the building coordinates are filled in src/assets/neust-buildings.json.
 */
export const CAMPUS_CENTER: LatLng = { lat: 15.4431, lng: 120.9388 };
export const CAMPUS_ZOOM = 17;

// The 53 campus buildings, filled by ReportsService.loadBuildings() when the app opens
export const buildings = signal<Building[]>([]);

export function hasCoords(b: Building): b is Building & { lat: number; lng: number } {
  return typeof b.lat === 'number' && typeof b.lng === 'number';
}

export function findBuilding(no: number | null | undefined): Building | undefined {
  return no == null ? undefined : buildings().find((b) => b.no === no);
}

/** Great-circle distance in metres. */
export function distanceMetres(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Rounded to 10 m for display. */
export function roundMetres(m: number): number {
  return Math.max(10, Math.round(m / 10) * 10);
}

/** The building closest to a point, among buildings that have coordinates. */
export function nearestBuilding(point: LatLng): { building: Building; metres: number } | null {
  let best: { building: Building; metres: number } | null = null;
  for (const b of buildings()) {
    if (!hasCoords(b)) continue;
    const metres = distanceMetres(point, { lat: b.lat, lng: b.lng });
    if (!best || metres < best.metres) best = { building: b, metres };
  }
  return best;
}

/** A point offset from the campus centre by metres east and north. */
export function offsetFromCenter(east: number, north: number): LatLng {
  const lat = CAMPUS_CENTER.lat + north / 111_320;
  const lng = CAMPUS_CENTER.lng + east / (111_320 * Math.cos((CAMPUS_CENTER.lat * Math.PI) / 180));
  return { lat, lng };
}
