import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonRouterLink } from '@ionic/angular';

import { placeShort } from '../../core/format';
import { ReportsService } from '../../core/reports.service';
import { TagComponent } from '../../shared/tag.component';

@Component({
  selector: 'app-report-sent',
  templateUrl: 'report-sent.page.html',
  styleUrls: ['report-sent.page.scss'],
  imports: [RouterLink, IonRouterLink, IonContent, IonIcon, IonButton, TagComponent],
})
export class ReportSentPage {
  private readonly store = inject(ReportsService);

  /** Route param, bound by withComponentInputBinding. */
  readonly id = input.required<string>();

  protected readonly report = computed(() => this.store.get(this.id()));
  protected readonly place = computed(() => {
    const r = this.report();
    return r ? [placeShort(r), r.category].filter(Boolean).join(' · ') : '';
  });
}
