import { provideHttpClient } from '@angular/common/http';
import { inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  PreloadAllModules,
  RouteReuseStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  add,
  alertCircleOutline,
  cameraOutline,
  chatboxOutline,
  checkmark,
  chevronBackOutline,
  chevronDownOutline,
  chevronForwardOutline,
  clipboardOutline,
  closeCircle,
  constructOutline,
  homeOutline,
  leafOutline,
  listOutline,
  locateOutline,
  searchOutline,
  shieldOutline,
  wifiOutline,
} from 'ionicons/icons';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { ReportsService } from './app/services/reports.service';

// Every icon the app uses, registered once
addIcons({
  add,
  'alert-circle-outline': alertCircleOutline,
  'camera-outline': cameraOutline,
  'chatbox-outline': chatboxOutline,
  checkmark,
  'chevron-back-outline': chevronBackOutline,
  'chevron-down-outline': chevronDownOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'clipboard-outline': clipboardOutline,
  'close-circle': closeCircle,
  'construct-outline': constructOutline,
  'home-outline': homeOutline,
  'leaf-outline': leafOutline,
  'list-outline': listOutline,
  'locate-outline': locateOutline,
  'search-outline': searchOutline,
  'shield-outline': shieldOutline,
  'wifi-outline': wifiOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'md' }),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    provideHttpClient(), // add this (for the building list GET)
    // Load the saved reports from Preferences before any screen shows
    provideAppInitializer(() => inject(ReportsService).init()),
  ],
});
