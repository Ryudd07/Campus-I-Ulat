import type { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { Component, effect, inject, input, output, viewChild } from '@angular/core';
import * as L from 'leaflet'; // Importing everything from leaflet + aliasing

import { BuildingsService } from '../services/buildings.service';
import type { LatLng } from '../services/models';

// The report pin (its tip sits on the point)
const pinIcon = L.divIcon({
  className: 'cc-map-pin',
  html:
    '<svg width="36" height="46" viewBox="0 0 36 46" aria-hidden="true">' +
    '<ellipse cx="18" cy="42" rx="8" ry="3" fill="#14202B" fill-opacity="0.3"/>' +
    '<path d="M18 42C8 30 1.5 22 1.5 12.5A16.5 16.5 0 0 1 34.5 12.5C34.5 22 28 30 18 42Z" fill="#0B5FA5" stroke="#fff" stroke-width="3"/>' +
    '<circle cx="18" cy="12.5" r="6" fill="#fff"/></svg>',
  iconSize: [44, 50],
  iconAnchor: [22, 44],
});

// "Pin the location": drag the pin, tap a numbered building, or tap the map
@Component({
  selector: 'app-pin-map',
  template: `<div #map class="map" role="group" [attr.aria-label]="label()"></div>`,
  styles: `
    .map {
      height: 200px;
      border: 1px solid var(--cc-line);
      border-radius: 16px;
    }
  `,
})
export class PinMapComponent implements AfterViewInit, OnDestroy {
  buildings = inject(BuildingsService);

  pin = input.required<LatLng>();
  selected = input<number | null>(null); // selected building number
  located = input(false); // true when the pin came from Geolocation
  accuracy = input<number>();
  label = input('Map with a movable pin and numbered campus buildings');

  pinChange = output<LatLng>();
  buildingPick = output<number>();

  mapElement = viewChild.required<ElementRef>('map');
  map!: L.Map;
  pinMarker!: L.Marker;
  accuracyCircle!: L.Circle;
  buildingMarkers = L.layerGroup();
  timer: any;

  constructor() {
    // redraw when the pin, the chosen building or the building list changes
    effect(() => {
      this.pin();
      this.selected();
      this.located();
      this.buildings.list();
      this.update();
    });
  }

  ngAfterViewInit() {
    const p = this.pin();
    this.map = L.map(this.mapElement().nativeElement).setView([p.lat, p.lng], 17);

    // Adding the tiles or actual "map"
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
      keepBuffer: 0, // no tile prefetching outside the visible area
    }).addTo(this.map);

    // the draggable pin; keyboard: true lets it be focused with Tab
    this.pinMarker = L.marker([p.lat, p.lng], {
      icon: pinIcon,
      draggable: true,
      keyboard: true,
      title: 'Report pin. Drag it to the exact spot.',
      zIndexOffset: 1000,
    }).addTo(this.map);
    this.pinMarker.on('dragend', () => this.pinChange.emit(this.pinMarker.getLatLng()));

    // circle showing how accurate the GPS position is
    this.accuracyCircle = L.circle([p.lat, p.lng], { radius: 0, color: '#0B5FA5', weight: 1, interactive: false });
    this.accuracyCircle.addTo(this.map);
    this.buildingMarkers.addTo(this.map);

    // tapping the map moves the pin there
    this.map.on('click', (e: L.LeafletMouseEvent) => this.pinChange.emit(e.latlng));

    this.update();

    // fixing the loading issue (the page is still sliding in)
    this.timer = setInterval(() => this.map.invalidateSize(), 200);
  }

  update() {
    if (!this.map) return; // the map is not drawn yet
    const p = this.pin();

    this.pinMarker.setLatLng([p.lat, p.lng]);
    this.map.panTo([p.lat, p.lng]);
    this.accuracyCircle.setLatLng([p.lat, p.lng]);
    this.accuracyCircle.setRadius(this.located() ? Math.min(this.accuracy() ?? 0, 150) : 0);

    // numbered building markers
    this.buildingMarkers.clearLayers();
    for (const b of this.buildings.onMap()) {
      const icon = L.divIcon({
        className: b.no === this.selected() ? 'cc-map-building cc-map-building--on' : 'cc-map-building',
        html: '<span>' + b.no + '</span>',
        iconSize: [32, 32],
      });
      L.marker([b.lat!, b.lng!], { icon: icon, keyboard: true, title: b.name })
        .on('click', () => this.buildingPick.emit(b.no))
        .addTo(this.buildingMarkers);
    }
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    this.map.remove();
  }
}
