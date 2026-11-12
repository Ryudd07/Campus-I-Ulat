import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BuildingsService } from './buildings.service';

describe('BuildingsService', () => {
  let service: BuildingsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(BuildingsService);
    http = TestBed.inject(HttpTestingController);
  });

  it('GETs the building list from the bundled file', () => {
    service.load();
    const request = http.expectOne('assets/neust-buildings.json');
    expect(request.request.method).toBe('GET');
    request.flush([
      { no: 29, name: 'Science and Technology Bldg.', category: null, lat: 15.44, lng: 120.94 },
      { no: 8, name: 'Building 8', category: null, lat: null, lng: null },
    ]);

    expect(service.find(29)!.name).toBe('Science and Technology Bldg.');
    expect(service.onMap().map((b) => b.no)).toEqual([29]); // only buildings with coordinates
  });

  it('measures the distance between two points in metres', () => {
    const metres = service.distance({ lat: 15.44, lng: 120.94 }, { lat: 15.441, lng: 120.94 });
    expect(Math.round(metres)).toBe(111);
  });
});
