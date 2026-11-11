import { Component, computed, inject, input } from '@angular/core';
import { Haptics, NotificationType } from '@capacitor/haptics';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';

import { placeLong, stamp } from '../../core/format';
import { STATUSES, type Status } from '../../core/models';
import { ReportsService } from '../../core/reports.service';

const STEP_LABEL: Record<Status, string> = {
  New: 'Report received',
  'In review': 'Reviewed by campus services',
  'In progress': 'Repair in progress',
  Resolved: 'Resolved',
};

@Component({
  selector: 'app-report-detail',
  templateUrl: 'report-detail.page.html',
  styleUrls: ['report-detail.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonIcon, IonButton],
})
export class ReportDetailPage {
  store = inject(ReportsService);
  toastCtrl = inject(ToastController);

  id = input.required<string>(); // from the URL, /reports/:id

  report = computed(() => this.store.get(this.id()));
  place = computed(() => placeLong(this.report()!));
  // latest note from campus services
  note = computed(() => [...this.report()!.history].reverse().find((h) => h.note)?.note);

  // one row per history entry, then a "Pending" row for the next status
  timeline = computed(() => {
    const r = this.report()!;
    const rows = r.history.map((h) => ({
      label: h.note?.startsWith('Reopened') ? 'Reopened by you' : STEP_LABEL[h.status],
      when: stamp(h.at),
      done: true,
    }));
    const next = STATUSES[STATUSES.indexOf(r.status) + 1];
    if (next) rows.push({ label: STEP_LABEL[next], when: 'Pending', done: false });
    return rows;
  });

  // "Yes, it is fixed"
  async confirm() {
    await Haptics.notification({ type: NotificationType.Success }); // two quick taps, unlike a keyboard tap
    this.store.confirmFixed(this.id());
    this.showToast('Thanks for confirming. This report is closed.');
  }

  // "Not fixed, reopen"
  reopen() {
    this.store.reopen(this.id());
    this.showToast('Reopened. Campus services will take another look.');
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({ message: message, duration: 2500 });
    toast.present();
  }
}
