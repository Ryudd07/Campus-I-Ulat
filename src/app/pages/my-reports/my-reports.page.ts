import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonRouterLink } from '@ionic/angular';

import { ReportsService } from '../../core/reports.service';
import { ReportCardComponent } from '../../shared/report-card.component';
import { TabBarComponent } from '../../shared/tab-bar.component';

@Component({
  selector: 'app-my-reports',
  templateUrl: 'my-reports.page.html',
  styleUrls: ['my-reports.page.scss'],
  imports: [RouterLink, IonRouterLink, IonContent, IonIcon, IonButton, ReportCardComponent, TabBarComponent],
})
export class MyReportsPage {
  store = inject(ReportsService);

  tab = signal<'open' | 'resolved'>('open');

  open = computed(() => this.store.myReports().filter((r) => r.status !== 'Resolved'));
  resolved = computed(() => this.store.myReports().filter((r) => r.status === 'Resolved'));
  shown = computed(() => (this.tab() === 'open' ? this.open() : this.resolved()));
  none = computed(() => this.store.myReports().length === 0);
}
