import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonRouterLink } from '@ionic/angular';

import { BuildingsService } from '../../services/buildings.service';
import { ReportsService } from '../../services/reports.service';
import { TagComponent } from '../../shared/tag.component';

@Component({
  selector: 'app-report-sent',
  templateUrl: 'report-sent.page.html',
  styleUrls: ['report-sent.page.scss'],
  imports: [RouterLink, IonRouterLink, IonContent, IonIcon, IonButton, TagComponent],
})
export class ReportSentPage {
  store = inject(ReportsService);
  buildings = inject(BuildingsService);

  id = input.required<string>(); // from the URL, /report/sent/:id

  report = computed(() => this.store.get(this.id()));
}
