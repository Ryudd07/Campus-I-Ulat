import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';

import { CATEGORIES, type Category } from '../../services/models';
import { ReportsService } from '../../services/reports.service';
import { ReportCardComponent } from '../../shared/report-card.component';
import { TabBarComponent } from '../../shared/tab-bar.component';

// Icon shown on each category tile
const CATEGORY_ICONS: Record<Category, string> = {
  Maintenance: 'construct-outline',
  Safety: 'shield-outline',
  'IT and network': 'wifi-outline',
  Grounds: 'leaf-outline',
};

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [RouterLink, IonContent, IonIcon, ReportCardComponent, TabBarComponent],
})
export class HomePage {
  store = inject(ReportsService);
  router = inject(Router);

  categories = CATEGORIES.map((c) => ({ name: c, icon: CATEGORY_ICONS[c] }));
  recent = computed(() => this.store.myReports().slice(0, 3)); // the 3 newest

  // A category tile was tapped: start a new report with it
  start(category: Category) {
    this.store.startReport(category);
    this.router.navigateByUrl('/report/new');
  }
}
