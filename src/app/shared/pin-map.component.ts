import type { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { Component, effect, input, output, viewChild } from '@angular/core';

import { buildings, hasCoords } from '../core/geo';
import type { Building, LatLng } from '../core/models';

import { L, addTiles, buildingIcon, pinIcon } from './leaflet';

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
  buildings = L.layerGroup();
  timer: any;

  constructor() {
    // keep the map in step with the form and the building list
    effect(() => this.update(this.pin(), this.selected(), this.located(), buildings()));
  }

  ngAfterViewInit() {
    const p = this.pin();
    this.map = L.map(this.mapElement().nativeElement).setView([p.lat, p.lng], 17);
    addTiles(this.map);
    this.buildings.addTo(this.map);

    // the draggable pin; keyboard: true lets it be focused and moved with the arrow keys
    this.pinMarker = L.marker([p.lat, p.lng], {
      icon: pinIcon(),
      draggable: true,
      keyboard: true,
      title: 'Report pin. Drag it to the exact spot.',
      zIndexOffset: 1000,
    }).addTo(this.map);
    this.pinMarker.on('dragend', () => this.pinChange.emit(this.pinMarker.getLatLng()));

    // circle showing how accurate the GPS position is
    this.accuracyCircle = L.circle([p.lat, p.lng], { radius: 0, color: '#0B5FA5', weight: 1, interactive: false });
    this.accuracyCircle.addTo(this.map);

    // tapping the map moves the pin there
    this.map.on('click', (e: L.LeafletMouseEvent) => this.pinChange.emit(e.latlng));

    this.update(p, this.selected(), this.located(), buildings());

    // fixing the loading issue (the page is still sliding in)
    this.timer = setInterval(() => this.map.invalidateSize(), 200);
  }

  update(p: LatLng, selected: number | null, located: boolean, list: Building[]) {
    if (!this.map) return; // the map is not drawn yet

    this.pinMarker.setLatLng([p.lat, p.lng]);
    this.map.panTo([p.lat, p.lng]);
    this.accuracyCircle.setLatLng([p.lat, p.lng]);
    this.accuracyCircle.setRadius(located ? Math.min(this.accuracy() ?? 0, 150) : 0);

    // numbered buildings (only the ones that have coordinates)
    this.buildings.clearLayers();
    for (const b of list.filter(hasCoords)) {
      L.marker([b.lat, b.lng], { icon: buildingIcon(b.no, b.no === selected), keyboard: true, title: b.name })
        .on('click', () => this.buildingPick.emit(b.no))
        .addTo(this.buildings);
    }
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    this.map.remove();
  }
}
