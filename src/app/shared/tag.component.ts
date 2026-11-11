import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { statusClass } from '../core/format';
import type { Status, Urgency } from '../core/models';

/** Status or urgency tag. Reference only, never tappable. */
@Component({
  selector: 'app-tag',
  template: `<span class="cc-pill" [class]="'cc-pill cc-pill--' + modifier()">{{ value() }}</span>`,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagComponent {
  readonly value = input.required<Status | Urgency | string>();
  readonly modifier = computed(() => statusClass(this.value()));
}
