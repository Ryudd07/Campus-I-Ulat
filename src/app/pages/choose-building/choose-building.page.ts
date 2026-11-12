import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  NavController,
} from '@ionic/angular';

import { BuildingsService } from '../../services/buildings.service';
import type { Building } from '../../services/models';
import { ReportsService } from '../../services/reports.service';

const ALL = 'All categories';
const BUILDING_CATEGORIES = [
  'Administration',
  'Canteens, gyms and halls',
  'Sports and cultural',
  'Chapel, infirmary and student development',
  'Science and technology',
  'Colleges',
];

@Component({
  selector: 'app-choose-building',
  templateUrl: 'choose-building.page.html',
  styleUrls: ['choose-building.page.scss'],
  imports: [
    NgTemplateOutlet,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonIcon,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
  ],
})
export class ChooseBuildingPage {
  store = inject(ReportsService);
  buildings = inject(BuildingsService);
  nav = inject(NavController);

  ALL = ALL;
  categories = BUILDING_CATEGORIES;
  query = signal('');
  category = signal(ALL);
  selected = computed(() => this.store.form().buildingNo);

  // buildings that match the search box and the category filter
  matches = computed(() => {
    const q = this.query().toLowerCase();
    return this.buildings
      .list()
      .filter(
        (b) =>
          (this.category() === ALL || b.category === this.category()) &&
          (b.name.toLowerCase().includes(q) || String(b.no) === q),
      );
  });

  // the 3 buildings on the map nearest the pin
  closest = computed(() => {
    const pin = this.store.form();
    return this.buildings
      .onMap()
      .filter((b) => this.matches().includes(b))
      .map((b) => ({ ...b, distance: Math.round(this.buildings.distance(pin, { lat: b.lat!, lng: b.lng! })) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  });

  choose(b: Building) {
    this.store.chooseBuilding(b.no);
    this.nav.back();
  }

  // "Science and technology · 40 m away"
  subline(b: Building, distance?: number) {
    if (distance !== undefined) return (b.category ?? 'Building') + ' · ' + distance + ' m away';
    return b.category;
  }
}
