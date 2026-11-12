import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular';

import { BuildingsService } from '../services/buildings.service';

// Building field: number badge plus name. Tapping it opens the building list.
@Component({
  selector: 'app-building-field',
  imports: [RouterLink, IonIcon],
  template: `
    <div class="cc-field-group">
      <span class="cc-label" id="building-label">Building</span>
      <a
        class="cc-row"
        routerLink="/report/building"
        aria-describedby="building-label"
        [class.cc-row--invalid]="invalid()"
        [attr.aria-invalid]="invalid()"
      >
        @if (building(); as b) {
          <span class="cc-badge">{{ b.no }}</span>
          <span>{{ b.name }}</span>
        } @else {
          <span class="placeholder">Select a building</span>
        }
        <ion-icon class="cc-row__chevron" name="chevron-forward-outline" aria-hidden="true"></ion-icon>
      </a>
    </div>
  `,
  styles: `
    .placeholder {
      color: var(--cc-muted);
    }
  `,
})
export class BuildingFieldComponent {
  buildings = inject(BuildingsService);
  buildingNo = input<number | null>(null);
  invalid = input(false);

  building = computed(() => this.buildings.find(this.buildingNo()));
}
