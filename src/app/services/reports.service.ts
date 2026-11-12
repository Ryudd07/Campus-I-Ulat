import { Injectable, computed, inject, signal } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

import { BuildingsService } from './buildings.service';
import type { Category, Report, ReportForm } from './models';

// Free public test API (it accepts POSTs but does not keep them)
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// Middle of the NEUST-Sumacab campus (from the building coordinates). The pin starts here on New report.
const CAMPUS_CENTER = { lat: 15.4473, lng: 120.93963 };

// Starting values for a new report
function emptyForm(category: Category = 'Maintenance'): ReportForm {
  return { category: category, buildingNo: null, description: '', ...CAMPUS_CENTER, located: false };
}

// A time some hours before now, as text (for the sample reports)
function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

// Sample reports from the design, saved on first launch.
// One in each status, because nothing in the app moves a report along.
function sampleReports(): Report[] {
  return [
    {
      id: 'r_seed_new',
      title: 'Overflowing bin by the cafeteria',
      category: 'Grounds',
      urgency: 'Low',
      status: 'New',
      buildingNo: 50,
      room: 'Main entrance',
      lat: 15.445082,
      lng: 120.939401,
      description: 'The bin at the main entrance is full and rubbish is on the ground.',
      createdAt: hoursAgo(0.3),
      updatedAt: hoursAgo(0.3),
      history: [{ status: 'New', at: hoursAgo(0.3) }],
    },
    {
      id: 'r_seed_review',
      title: 'Leaking sink',
      category: 'Maintenance',
      urgency: 'Medium',
      status: 'In review',
      buildingNo: 51,
      room: 'Room 214',
      lat: 15.444953,
      lng: 120.939146,
      description: 'The sink under the window drips constantly and the cabinet below is wet.',
      createdAt: hoursAgo(30),
      updatedAt: hoursAgo(20),
      history: [
        { status: 'New', at: hoursAgo(30) },
        { status: 'In review', at: hoursAgo(20) },
      ],
    },
    {
      id: 'r_seed_progress',
      title: 'Broken light in stairwell B',
      category: 'Maintenance',
      urgency: 'Urgent',
      status: 'In progress',
      buildingNo: 29,
      room: '2nd floor',
      lat: 15.448278,
      lng: 120.937803,
      description: 'The stairwell light keeps flickering and goes out.',
      createdAt: hoursAgo(52),
      updatedAt: hoursAgo(1),
      history: [
        { status: 'New', at: hoursAgo(52) },
        { status: 'In review', at: hoursAgo(50) },
        { status: 'In progress', at: hoursAgo(1), note: 'An electrician is booked for Thursday morning.' },
      ],
    },
    {
      id: 'r_seed_resolved',
      title: 'Wi-Fi dead zone',
      category: 'IT and network',
      urgency: 'Low',
      status: 'Resolved',
      buildingNo: 39,
      room: 'Reading room',
      lat: 15.446778,
      lng: 120.938859,
      description: 'The Wi-Fi drops every few minutes in the reading room.',
      createdAt: hoursAgo(75),
      updatedAt: hoursAgo(0.5),
      history: [
        { status: 'New', at: hoursAgo(75) },
        { status: 'In review', at: hoursAgo(73) },
        { status: 'In progress', at: hoursAgo(48) },
        {
          status: 'Resolved',
          at: hoursAgo(0.5),
          note: 'The access point was replaced. Please let us know if the signal is still weak.',
        },
      ],
    },
    {
      id: 'r_seed_closed',
      title: 'Broken door lock',
      category: 'Maintenance',
      urgency: 'Medium',
      status: 'Resolved',
      buildingNo: 3,
      room: 'Room 105',
      lat: 15.446757,
      lng: 120.940385,
      description: 'The lock on the classroom door does not catch.',
      createdAt: hoursAgo(290),
      updatedAt: hoursAgo(220),
      history: [
        { status: 'New', at: hoursAgo(290) },
        { status: 'In review', at: hoursAgo(287) },
        { status: 'In progress', at: hoursAgo(265) },
        { status: 'Resolved', at: hoursAgo(220) },
      ],
      confirmedAt: hoursAgo(200),
    },
  ];
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  buildings = inject(BuildingsService);
  reports = signal<Report[]>([]); // the student's reports (saved in Preferences)
  form = signal<ReportForm>(emptyForm()); // what is filled in on New report

  // newest first
  myReports = computed(() => [...this.reports()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));

  // ---------- Preferences ----------

  // Runs once when the app opens
  async init() {
    const saved = await Preferences.get({ key: 'reports' });
    if (saved.value) {
      this.reports.set(JSON.parse(saved.value));
    } else {
      this.reports.set(sampleReports()); // first launch
      this.saveReports();
    }
  }

  saveReports() {
    // keep photos on the 10 newest reports only, so storage does not fill up
    const keep = this.myReports()
      .filter((r) => r.photo)
      .slice(0, 10)
      .map((r) => r.id);
    const list = this.reports().map((r) => (keep.includes(r.id) ? r : { ...r, photo: undefined }));
    Preferences.set({ key: 'reports', value: JSON.stringify(list) });
  }

  get(id: string) {
    return this.reports().find((r) => r.id === id);
  }

  updateReport(id: string, changes: Partial<Report>) {
    this.reports.set(this.reports().map((r) => (r.id === id ? { ...r, ...changes } : r)));
    this.saveReports();
  }

  // ---------- New report form ----------

  startReport(category: Category) {
    this.form.set(emptyForm(category));
  }

  updateForm(changes: Partial<ReportForm>) {
    this.form.set({ ...this.form(), ...changes });
  }

  // Picks a building and moves the pin onto it (if its coordinates are known)
  chooseBuilding(no: number) {
    const b = this.buildings.find(no);
    this.updateForm({ buildingNo: no, lat: b?.lat ?? this.form().lat, lng: b?.lng ?? this.form().lng, located: false });
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
    const now = new Date().toISOString();
    const history = [
      ...this.get(id)!.history,
      { status: 'In review' as const, at: now, note: 'Reopened: still not fixed.' },
    ];
    this.updateReport(id, { status: 'In review', confirmedAt: undefined, updatedAt: now, history: history });
  }

  // ---------- Network ----------

  // POST a copy of the report (without the photo, to keep the request small).
  // The report is already saved on the phone, so a failed request loses nothing.
  postReport(report: Report) {
    CapacitorHttp.post({
      url: API_URL,
      headers: { 'Content-Type': 'application/json' },
      data: { ...report, photo: undefined },
    })
      .then((res) => console.log('POST Response:', res.data))
      .catch((err) => console.error('POST Error:', err));
  }
}
