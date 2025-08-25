import { TestBed } from '@angular/core/testing';

import { AttendanceTimeService } from './attendance-time.service';

describe('AttendanceTimeService', () => {
  let service: AttendanceTimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttendanceTimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
