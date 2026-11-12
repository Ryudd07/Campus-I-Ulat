import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Haptics, NotificationType } from '@capacitor/haptics';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';

import { BuildingsService } from '../../services/buildings.service';
import { CATEGORIES, type LatLng } from '../../services/models';
import { ReportsService } from '../../services/reports.service';
import { BuildingFieldComponent } from '../../shared/building-field.component';
import { PinMapComponent } from '../../shared/pin-map.component';

@Component({
  selector: 'app-new-report',
  templateUrl: 'new-report.page.html',
  styleUrls: ['new-report.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonIcon,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonSpinner,
    PinMapComponent,
    BuildingFieldComponent,
  ],
})
export class NewReportPage {
  store = inject(ReportsService);
  buildings = inject(BuildingsService);
  router = inject(Router);
  toastCtrl = inject(ToastController);

  categories = CATEGORIES;
  form = this.store.form;
  locating = signal(false);
  tried = signal(false); // errors only show after the first Submit

  pin = computed(() => ({ lat: this.form().lat, lng: this.form().lng }));
  buildingError = computed(() => this.tried() && this.form().buildingNo === null);
  descriptionError = computed(() => this.tried() && this.form().description.trim() === '');

  locLabel = computed(() => {
    const near = this.nearest(this.pin());
    if (near) return 'Location found, ' + Math.round(near.metres) + ' m from Bldg ' + near.no;
    return 'Location found';
  });

  // The closest building on the map to a point
  nearest(point: LatLng) {
    let best: { no: number; metres: number } | null = null;
    for (const b of this.buildings.onMap()) {
      const metres = this.buildings.distance(point, { lat: b.lat!, lng: b.lng! });
      if (!best || metres < best.metres) best = { no: b.no, metres: metres };
    }
    return best;
  }

  // ---------- Form fields ----------

  setCategory(value: any) {
    this.store.updateForm({ category: value });
  }

  setDescription(value: any) {
    this.store.updateForm({ description: value });
  }

  // ---------- Map ----------

  // The pin was dragged or the map was tapped
  movePin(point: LatLng) {
    const near = this.nearest(point);
    const buildingNo = near && near.metres < 80 ? near.no : this.form().buildingNo;
    this.store.updateForm({ lat: point.lat, lng: point.lng, located: false, buildingNo: buildingNo });
  }

  // A numbered building was tapped
  pickBuilding(no: number) {
    this.store.chooseBuilding(no);
  }

  // ---------- Camera ----------

  async takePhoto() {
    const photo = await Camera.takePhoto({
      quality: 50,
      targetWidth: 800,
      targetHeight: 800, // fits the photo inside 800 x 800
    });
    this.savePhoto(photo.webPath!);
  }

  async choosePhoto() {
    const photos = await Camera.chooseFromGallery({
      quality: 50,
      targetWidth: 800,
      targetHeight: 800,
    });
    this.savePhoto(photos.results[0].webPath!);
  }

  async savePhoto(webPath: string) {
    const file = await fetch(webPath).then((res) => res.blob());
    const reader = new FileReader();
    reader.onload = () => this.store.updateForm({ photo: reader.result as string });
    reader.readAsDataURL(file);
  }

  removePhoto() {
    this.store.updateForm({ photo: undefined });
  }

  // ---------- Geolocation ----------

  async locate() {
    // check the permission first
    let permission = await Geolocation.checkPermissions();
    if (permission.location === 'prompt' && Capacitor.isNativePlatform()) {
      permission = await Geolocation.requestPermissions();
    }
    if (permission.location === 'denied') {
      this.router.navigateByUrl('/report/location'); // "Location access is off" screen
      return;
    }

    this.locating.set(true);
    Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 })
      .then((position) => {
        const point = { lat: position.coords.latitude, lng: position.coords.longitude };
        const near = this.nearest(point);
        this.store.updateForm({
          lat: point.lat,
          lng: point.lng,
          accuracy: position.coords.accuracy,
          located: true,
          buildingNo: near ? near.no : this.form().buildingNo,
        });
        this.locating.set(false);
      })
      .catch(() => {
        //lets the student pin it by hand
        this.locating.set(false);
        this.showToast('Could not find your location. Drag the pin instead.');
      });
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({ message: message, duration: 2500 });
    toast.present();
  }

  // ---------- Buttons ----------

  async submit() {
    this.tried.set(true);
    if (this.buildingError() || this.descriptionError()) return;

    await Haptics.notification({ type: NotificationType.Success });
    const report = this.store.submitReport(); // saves on the phone and POSTs a copy
    this.tried.set(false);
    this.router.navigate(['/report/sent', report.id], { replaceUrl: true });
  }
}
