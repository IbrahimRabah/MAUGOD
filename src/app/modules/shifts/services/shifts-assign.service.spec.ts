import { TestBed } from '@angular/core/testing';

import { ShiftsAssignService } from './shifts-assign.service';

describe('ShiftsAssignService', () => {
  let service: ShiftsAssignService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShiftsAssignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
