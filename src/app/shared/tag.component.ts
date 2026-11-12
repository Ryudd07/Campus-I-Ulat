import { Component, input } from '@angular/core';

// Status or urgency tag, e.g. "In progress" → class cc-pill--in-progress
@Component({
  selector: 'app-tag',
  template: `<span [class]="'cc-pill cc-pill--' + value().toLowerCase().replace(' ', '-')">{{ value() }}</span>`,
  host: { style: 'display: contents' },
})
export class TagComponent {
  value = input.required<string>();
}
