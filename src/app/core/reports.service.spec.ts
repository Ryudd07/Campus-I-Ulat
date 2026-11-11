import { TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';

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

  beforeEach(async () => {
    // CapacitorHttp uses fetch in the browser, so fake the test API's reply
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('{}', { status: 201 }));
    await Preferences.clear();
    service = TestBed.inject(ReportsService);
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

  it('GETs the building list when the app opens', () => {
    const urls = vi.mocked(fetch).mock.calls.map((call) => String(call[0]));
    expect(urls.some((url) => url.includes('neust-buildings.json'))).toBe(true);
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
