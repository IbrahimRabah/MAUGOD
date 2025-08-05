import { TestBed } from '@angular/core/testing';

import { SalariesCalculationsService } from './salaries-calculations.service';

describe('SalariesCalculationsService', () => {
  let service: SalariesCalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalariesCalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
