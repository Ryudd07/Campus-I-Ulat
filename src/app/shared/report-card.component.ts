import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular';

import { BuildingsService } from '../services/buildings.service';
import type { Report } from '../services/models';

import { TagComponent } from './tag.component';

// Tappable report row: "home" is the short card on Home, "list" is the fuller card on My reports
@Component({
  selector: 'app-report-card',
  imports: [RouterLink, IonIcon, TagComponent],
  template: `
    <a class="cc-card" [routerLink]="['/reports', report().id]">
      <div class="cc-card__row">
        <span class="cc-card__title">{{ report().title }}</span>
        <app-tag [value]="report().status" />
      </div>

      @if (variant() === 'home') {
        <span class="cc-meta">{{ buildings.placeLong(report()) }}</span>
      } @else {
        <span class="cc-meta">{{ buildings.placeShort(report()) }} · {{ report().category }}</span>
        @if (note() && report().status !== 'Resolved') {
          <div class="cc-note">
            <ion-icon name="chatbox-outline" aria-hidden="true"></ion-icon>
            <span><strong>Campus services: </strong>{{ note() }}</span>
          </div>
        }
        @if (report().status === 'Resolved' && !report().confirmedAt) {
          <span class="cc-updated">Is it fixed? Tap to confirm</span>
        } @else if (report().status === 'Resolved') {
          <span class="cc-hint">Closed {{ ago(report().updatedAt) }}</span>
        } @else {
          <span class="cc-hint">Reported {{ ago(report().createdAt) }}</span>
        }
      }
    </a>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class ReportCardComponent {
  buildings = inject(BuildingsService);
  report = input.required<Report>();
  variant = input<'home' | 'list'>('list');

  // latest note from campus services
  note = computed(() => [...this.report().history].reverse().find((h) => h.note)?.note);

  // "today", "yesterday" or "3 days ago"
  ago(time: string) {
    const days = Math.floor((Date.now() - new Date(time).getTime()) / (24 * 60 * 60 * 1000));
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return days + ' days ago';
  }
}
