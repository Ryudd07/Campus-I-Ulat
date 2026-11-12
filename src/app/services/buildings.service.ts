import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

import type { Building, LatLng, Report } from './models';

@Injectable({ providedIn: 'root' })
export class BuildingsService {
  http = inject(HttpClient); // inject
  list = signal<Building[]>([]); // the 53 campus buildings

  // GET the building list from the file bundled in the app (works offline)
  load() {
    this.http.get<Building[]>('assets/neust-buildings.json').subscribe({
      next: (list) => this.list.set(list),
      error: (err) => console.error('GET Error:', err),
    });
  }

  find(no: number | null) {
    return this.list().find((b) => b.no === no);
  }

  // buildings whose coordinates are filled in (only these appear on the map)
  onMap() {
    return this.list().filter((b) => b.lat !== null && b.lng !== null);
  }

  // distance in metres between two points on Earth
  distance(a: LatLng, b: LatLng) {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * 6371000 * Math.asin(Math.sqrt(h));
  }

  // "Science & Tech Bldg (29), 2nd floor"
  placeLong(r: Report) {
    const b = this.find(r.buildingNo);
    const name = b ? (b.shortName ?? b.name) : 'Bldg';
    return name + ' (' + r.buildingNo + ')' + (r.room ? ', ' + r.room : '');
  }

  // "Bldg 29 · 2nd floor"
  placeShort(r: Report) {
    return 'Bldg ' + r.buildingNo + (r.room ? ' · ' + r.room : '');
  }
}
