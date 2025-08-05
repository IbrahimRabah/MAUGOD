import { TestBed } from '@angular/core/testing';

import { SalaryAddOnsService } from './salary-add-ons.service';

describe('SalaryAddOnsService', () => {
  let service: SalaryAddOnsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalaryAddOnsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
