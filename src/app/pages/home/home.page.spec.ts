import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { provideIonicAngular } from '@ionic/angular';

import { ReportsService } from '../../services/reports.service';

import { HomePage } from './home.page';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await Preferences.clear();
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([]), provideIonicAngular(), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    await TestBed.inject(ReportsService).init();
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
  });

  it('shows the four report categories', () => {
    expect(fixture.nativeElement.querySelectorAll('.cc-tile').length).toBe(4);
  });

  it('lists the three newest seeded reports', () => {
    expect(fixture.nativeElement.querySelectorAll('app-report-card').length).toBe(3);
  });
});
