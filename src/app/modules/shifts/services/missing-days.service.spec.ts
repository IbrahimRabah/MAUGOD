import { TestBed } from '@angular/core/testing';

import { MissingDaysService } from './missing-days.service';

describe('MissingDaysService', () => {
  let service: MissingDaysService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MissingDaysService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
