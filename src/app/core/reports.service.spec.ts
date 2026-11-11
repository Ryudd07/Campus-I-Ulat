import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';

import { buildings } from './geo';
import { STATUSES } from './models';
import { ReportsService } from './reports.service';

// waits for the Preferences writes to finish
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

async function storedReports() {
  const { value } = await Preferences.get({ key: 'reports' });
  return value ? JSON.parse(value) : null;
}

describe('ReportsService', () => {
  let service: ReportsService;
  let http: HttpTestingController;

  beforeEach(async () => {
    // CapacitorHttp uses fetch in the browser, so fake the test API's reply
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('{}', { status: 201 }));
    await Preferences.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ReportsService);
    http = TestBed.inject(HttpTestingController);
    await service.init();
    await tick();
  });

  afterEach(() => vi.restoreAllMocks());

  it('seeds at least one report in each status on first launch', async () => {
    const seeded = await storedReports();
    for (const s of STATUSES) expect(seeded.some((r: { status: string }) => r.status === s)).toBe(true);
  });

  it('saves a submitted report, POSTs a copy without the photo, and clears the form', async () => {
    service.startReport('Safety');
    service.updateForm({ buildingNo: 29, description: 'Loose handrail on the stairs.', photo: 'data:x' });
    const report = service.submitReport();
    await tick();

    expect(report.id).toMatch(/^r_\d+$/);
    expect((await storedReports())[0].id).toBe(report.id);
    expect(service.form().description).toBe('');
    const post = vi.mocked(fetch).mock.calls.find((call) => call[1]?.method === 'POST')!;
    const body = JSON.parse(String(post[1]!.body));
    expect(body.photo).toBeUndefined();
  });

  it('keeps the report on the phone when the POST fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(fetch).mockRejectedValue(new Error('offline'));
    service.updateForm({ buildingNo: 29, description: 'No signal test.' });
    const report = service.submitReport();
    await tick();

    expect((await storedReports())[0].id).toBe(report.id);
  });

  it('GETs the building list from the bundled file when the app opens', () => {
    const request = http.expectOne('assets/neust-buildings.json');
    expect(request.request.method).toBe('GET');
    request.flush([{ no: 29, name: 'Science and Technology Bldg.', category: null, lat: null, lng: null }]);
    expect(buildings()[0].name).toBe('Science and Technology Bldg.');
  });

  it('confirming a fix sets confirmedAt and keeps the status Resolved', () => {
    service.confirmFixed('r_seed_resolved');
    const r = service.get('r_seed_resolved')!;
    expect(r.status).toBe('Resolved');
    expect(r.confirmedAt).toBeTruthy();
  });

  it('reopening moves the report to In review with a history entry', () => {
    service.reopen('r_seed_resolved');
    const r = service.get('r_seed_resolved')!;
    expect(r.status).toBe('In review');
    expect(r.reopened).toBe(true);
    expect(r.history.at(-1)!.status).toBe('In review');
  });
});
