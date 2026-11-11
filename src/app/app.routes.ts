import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Student
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/my-reports/my-reports.page').then((m) => m.MyReportsPage),
  },
  {
    path: 'reports/:id',
    loadComponent: () => import('./pages/report-detail/report-detail.page').then((m) => m.ReportDetailPage),
  },
  {
    path: 'report/new',
    loadComponent: () => import('./pages/new-report/new-report.page').then((m) => m.NewReportPage),
  },
  {
    path: 'report/building',
    loadComponent: () => import('./pages/choose-building/choose-building.page').then((m) => m.ChooseBuildingPage),
  },
  {
    path: 'report/location',
    loadComponent: () => import('./pages/location-off/location-off.page').then((m) => m.LocationOffPage),
  },
  {
    path: 'report/sent/:id',
    loadComponent: () => import('./pages/report-sent/report-sent.page').then((m) => m.ReportSentPage),
  },

  { path: '**', redirectTo: 'home' },
];
