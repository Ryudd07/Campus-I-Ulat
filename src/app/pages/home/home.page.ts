import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';

import { CATEGORY_ICONS } from '../../core/icons';
import { CATEGORIES, type Category } from '../../core/models';
import { ReportsService } from '../../core/reports.service';
import { ReportCardComponent } from '../../shared/report-card.component';
import { TabBarComponent } from '../../shared/tab-bar.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [RouterLink, IonContent, IonIcon, ReportCardComponent, TabBarComponent],
})
export class HomePage {
  protected readonly store = inject(ReportsService);
  private readonly router = inject(Router);

  protected readonly categories = CATEGORIES.map((c) => ({ name: c, icon: CATEGORY_ICONS[c] }));
  protected readonly recent = computed(() => this.store.myReports().slice(0, 3));

  protected start(category: Category): void {
    this.store.startReport(category);
    this.router.navigateByUrl('/report/new');
  }
}
