import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular';

import { ago, placeLong, placeShort } from '../core/format';
import type { Report } from '../core/models';

import { TagComponent } from './tag.component';

/**
 * Tappable report row.
 * - `home`: compact card on Home
 * - `list`: My reports, with the latest campus services note
 */
@Component({
  selector: 'app-report-card',
  imports: [RouterLink, IonIcon, TagComponent],
  template: `
    @let r = report();
    <a class="cc-card" [routerLink]="['/reports', r.id]">
      @if (variant() === 'home') {
        <div class="cc-card__row">
          <span class="cc-card__title">{{ r.title }}</span>
          <app-tag [value]="r.status" />
        </div>
        <span class="cc-meta">{{ place() }}</span>
      } @else {
        <div class="cc-card__row cc-card__row--top">
          <span class="cc-card__title">{{ r.title }}</span>
          <app-tag [value]="r.status" />
        </div>
        <span class="cc-meta">{{ shortPlace() }} · {{ r.category }}</span>
        @if (note() && r.status !== 'Resolved') {
          <div class="cc-note">
            <ion-icon name="chatbox-outline" aria-hidden="true"></ion-icon>
            <span><strong>Campus services: </strong>{{ note() }}</span>
          </div>
        }
        @if (r.status === 'Resolved' && !r.confirmedAt) {
          <span class="cc-updated">Is it fixed? Tap to confirm</span>
        } @else if (r.status === 'Resolved') {
          <span class="cc-hint">Closed {{ ago(r.updatedAt) }}</span>
        } @else {
          <span class="cc-hint">Reported {{ ago(r.createdAt) }}</span>
        }
      }
    </a>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportCardComponent {
  readonly report = input.required<Report>();
  readonly variant = input<'home' | 'list'>('list');

  protected readonly ago = ago;
  protected readonly place = computed(() => placeLong(this.report()));
  protected readonly shortPlace = computed(() => placeShort(this.report()));
  /** Latest note from campus services in the history. */
  protected readonly note = computed(() => [...this.report().history].reverse().find((h) => h.note)?.note);
}
