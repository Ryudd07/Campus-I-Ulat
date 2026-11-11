import { Injectable, computed, signal } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

import { CAMPUS_CENTER, buildings } from './geo';
import type { Building, Category, Report, ReportForm } from './models';
import { seedReports } from './seed';

// Free public test API (it accepts POSTs but does not keep them)
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// The building list, published in the project's GitHub repository
const BUILDINGS_URL = 'https://raw.githubusercontent.com/Ryudd07/Campus-I-Ulat/main/src/app/core/neust-buildings.json';

// Starting values for a new report
function emptyForm(category: Category = 'Maintenance'): ReportForm {
  return {
    category: category,
    buildingNo: null,
    description: '',
    lat: CAMPUS_CENTER.lat,
    lng: CAMPUS_CENTER.lng,
    located: false,
  };
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  reports = signal<Report[]>([]); // the student's reports (saved in Preferences)
  form = signal<ReportForm>(emptyForm()); // what is filled in on New report

  // newest first
  myReports = computed(() => [...this.reports()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));

  // ---------- Preferences ----------

  // Runs once when the app opens
  async init() {
    this.loadBuildings();

    const saved = await Preferences.get({ key: 'reports' });
    if (saved.value) {
      this.reports.set(JSON.parse(saved.value));
    } else {
      // first launch: save the sample reports
      this.reports.set(seedReports());
      this.saveReports();
    }
  }

  saveReports() {
    // keep photos on the 10 newest reports only, so storage does not fill up
    const withPhoto = this.myReports().filter((r) => r.photo);
    const keep = withPhoto.slice(0, 10).map((r) => r.id);
    const list = this.reports().map((r) => (keep.includes(r.id) ? r : { ...r, photo: undefined }));
    return Preferences.set({ key: 'reports', value: JSON.stringify(list) });
  }

  get(id: string) {
    return this.reports().find((r) => r.id === id);
  }

  // ---------- New report form ----------

  // A new, empty report form with the chosen category
  startReport(category: Category) {
    this.form.set(emptyForm(category));
  }

  updateForm(changes: Partial<ReportForm>) {
    this.form.set({ ...this.form(), ...changes });
  }

  // Turns the form into a report, saves it on the phone, then sends a copy
  submitReport() {
    const f = this.form();
    const now = new Date().toISOString();
    const report: Report = {
      id: 'r_' + Date.now(),
      title: f.description.trim().split(/[.\n]/)[0].slice(0, 60),
      category: f.category,
      urgency: 'Medium',
      status: 'New',
      buildingNo: f.buildingNo!,
      room: '',
      lat: f.lat,
      lng: f.lng,
      description: f.description.trim(),
      photo: f.photo,
      createdAt: now,
      updatedAt: now,
      history: [{ status: 'New', at: now }],
    };

    this.reports.set([report, ...this.reports()]);
    this.saveReports();
    this.form.set(emptyForm());
    this.postReport(report);
    return report;
  }

  // ---------- "Is it fixed?" ----------

  // "Yes, it is fixed": the status stays Resolved
  confirmFixed(id: string) {
    this.updateReport(id, { confirmedAt: new Date().toISOString() });
  }

  // "Not fixed, reopen": back to In review
  reopen(id: string) {
    const r = this.get(id)!;
    const now = new Date().toISOString();
    this.updateReport(id, {
      status: 'In review',
      reopened: true,
      confirmedAt: undefined,
      updatedAt: now,
      history: [...r.history, { status: 'In review', at: now, note: 'Reopened: still not fixed.' }],
    });
  }

  updateReport(id: string, changes: Partial<Report>) {
    this.reports.set(this.reports().map((r) => (r.id === id ? { ...r, ...changes } : r)));
    this.saveReports();
  }

  // ---------- Network (CapacitorHttp) ----------

  // GET the latest building list. If it fails, the copy inside the app is used.
  loadBuildings() {
    CapacitorHttp.get({ url: BUILDINGS_URL })
      .then((res) => {
        // GitHub sends the file as text, so turn it into a list
        const list: Building[] = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        if (Array.isArray(list)) buildings.set(list);
        console.log('GET Buildings:', list.length);
      })
      .catch((err) => console.error('GET Error:', err));
  }

  // POST a copy of the report (without the photo, to keep the request small).
  // The report is already saved on the phone, so a failed request loses nothing.
  postReport(report: Report) {
    const copy = { ...report, photo: undefined };

    CapacitorHttp.post({ url: API_URL, headers: { 'Content-Type': 'application/json' }, data: copy })
      .then((res) => console.log('POST Response:', res.data))
      .catch((err) => console.error('POST Error:', err));
  }
}
