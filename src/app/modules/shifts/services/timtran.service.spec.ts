import { TestBed } from '@angular/core/testing';

import { TimtranService } from './timtran.service';

describe('TimtranService', () => {
  let service: TimtranService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimtranService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
