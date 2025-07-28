import { TestBed } from '@angular/core/testing';

import { EmployeeHandlesBalanceService } from './employee-handles-balance.service';

describe('EmployeeHandlesBalanceService', () => {
  let service: EmployeeHandlesBalanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeHandlesBalanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
