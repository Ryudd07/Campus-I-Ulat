import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular';

import type { Building } from '../core/models';

/** Building field: number badge plus name. Opens the building list. */
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
        } @else if (number() !== null) {
          <span class="cc-badge">{{ number() }}</span>
          <span>Building {{ number() }}</span>
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuildingFieldComponent {
  readonly building = input<Building | undefined>();
  readonly number = input<number | null>(null);
  readonly invalid = input(false);
}
