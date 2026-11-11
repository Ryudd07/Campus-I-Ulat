import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonFooter, IonIcon, IonRouterLinkWithHref } from '@ionic/angular';

/** Student bottom bar: Home, the raised report button, My reports. */
@Component({
  selector: 'app-tab-bar',
  imports: [IonFooter, IonIcon, RouterLink, IonRouterLinkWithHref],
  template: `
    <ion-footer class="tab-footer">
      <nav class="tab-bar" aria-label="Main">
        <a
          class="tab"
          routerLink="/home"
          routerDirection="root"
          [class.tab--active]="active() === 'home'"
          [attr.aria-current]="active() === 'home' ? 'page' : null"
        >
          <ion-icon name="home-outline" aria-hidden="true"></ion-icon>
          <span>Home</span>
        </a>
        <a class="report-btn" routerLink="/report/new" aria-label="Report an issue">
          <ion-icon name="add" aria-hidden="true"></ion-icon>
        </a>
        <a
          class="tab"
          routerLink="/reports"
          routerDirection="root"
          [class.tab--active]="active() === 'reports'"
          [attr.aria-current]="active() === 'reports' ? 'page' : null"
        >
          <ion-icon name="list-outline" aria-hidden="true"></ion-icon>
          <span>My reports</span>
        </a>
      </nav>
    </ion-footer>
  `,
  styles: `
    .tab-footer {
      box-shadow: none;
    }
    .tab-footer::before {
      display: none;
    }
    .tab-bar {
      display: flex;
      align-items: center;
      background: var(--cc-surface);
      border-top: 1px solid var(--cc-line);
      padding: 8px 0 calc(12px + var(--ion-safe-area-bottom, 0px));
    }
    .tab {
      flex: 1;
      min-height: 44px;
      padding-top: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      font-size: 13px;
      font-weight: 500;
      color: var(--cc-muted);
      text-decoration: none;
    }
    .tab ion-icon {
      font-size: 22px;
    }
    .tab--active {
      font-weight: 700;
      color: var(--cc-blue);
    }
    .tab:active {
      background: var(--cc-ground);
    }
    .report-btn {
      flex: none;
      width: 60px;
      height: 60px;
      margin-top: -28px;
      box-sizing: border-box;
      border: 4px solid var(--cc-surface);
      border-radius: 50%;
      background: var(--cc-blue);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      transition: transform 80ms ease;
    }
    .report-btn:active {
      background: var(--cc-blue-pressed);
      transform: translateY(2px);
    }
    .tab:focus-visible,
    .report-btn:focus-visible {
      outline: var(--cc-focus-ring);
      outline-offset: 2px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabBarComponent {
  readonly active = input<'home' | 'reports' | null>(null);
}
