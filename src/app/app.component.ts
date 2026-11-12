import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

import { BuildingsService } from './services/buildings.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  buildingsService = inject(BuildingsService);

  constructor() {
    this.buildingsService.load(); // GET the building list when the app opens
  }
}
