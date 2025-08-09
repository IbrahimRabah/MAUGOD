import { TestBed } from '@angular/core/testing';

import { SalariesAddDeductsAssignService } from './salaries-add-deducts-assign.service';

describe('SalariesAddDeductsAssignService', () => {
  let service: SalariesAddDeductsAssignService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalariesAddDeductsAssignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
