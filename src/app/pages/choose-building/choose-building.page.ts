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

import { buildings, distanceMetres, hasCoords, roundMetres } from '../../core/geo';
import { BUILDING_CATEGORIES, type Building } from '../../core/models';
import { ReportsService } from '../../core/reports.service';

const ALL = 'All categories';

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
  nav = inject(NavController);

  ALL = ALL;
  categories = BUILDING_CATEGORIES;
  query = signal('');
  category = signal(ALL);
  selected = computed(() => this.store.form().buildingNo);

  // buildings that match the search box and the category filter
  matches = computed(() => {
    const q = this.query().toLowerCase();
    return buildings().filter(
      (b) =>
        (this.category() === ALL || b.category === this.category()) &&
        (b.name.toLowerCase().includes(q) || String(b.no) === q),
    );
  });

  // the 3 buildings nearest the pin (only buildings with coordinates)
  closest = computed(() => {
    const pin = this.store.form();
    return this.matches()
      .filter(hasCoords)
      .map((b) => ({ ...b, distance: roundMetres(distanceMetres(pin, { lat: b.lat, lng: b.lng })) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  });

  all = computed(() => this.matches());

  choose(b: Building) {
    this.store.updateForm({
      buildingNo: b.no,
      lat: b.lat ?? this.store.form().lat,
      lng: b.lng ?? this.store.form().lng,
    });
    this.nav.back();
  }

  setCategory(value: string) {
    this.category.set(value);
  }

  subline(b: Building, distance?: number) {
    return [b.category, distance ? distance + ' m away' : ''].filter(Boolean).join(' · ');
  }
}
