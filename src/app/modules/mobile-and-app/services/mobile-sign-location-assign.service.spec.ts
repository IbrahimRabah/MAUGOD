import { TestBed } from '@angular/core/testing';

import { MobileSignLocationAssignService } from './mobile-sign-location-assign.service';

describe('MobileSignLocationAssignService', () => {
  let service: MobileSignLocationAssignService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MobileSignLocationAssignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
