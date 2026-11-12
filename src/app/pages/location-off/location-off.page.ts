import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

import type { LatLng } from '../../services/models';
import { ReportsService } from '../../services/reports.service';
import { BuildingFieldComponent } from '../../shared/building-field.component';
import { PinMapComponent } from '../../shared/pin-map.component';

// Shown when the phone won't share its location: pin the spot by hand instead
@Component({
  selector: 'app-location-off',
  templateUrl: 'location-off.page.html',
  styleUrls: ['location-off.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonButton,
    PinMapComponent,
    BuildingFieldComponent,
  ],
})
export class LocationOffPage {
  store = inject(ReportsService);
  router = inject(Router);

  form = this.store.form;
  pin = computed(() => ({ lat: this.form().lat, lng: this.form().lng }));

  movePin(point: LatLng) {
    this.store.updateForm({ lat: point.lat, lng: point.lng, located: false });
  }

  pickBuilding(no: number) {
    this.store.chooseBuilding(no);
  }

  done() {
    this.router.navigateByUrl('/report/new');
  }
}
