import { TestBed } from '@angular/core/testing';

import { SignLocationsService } from './sign-locations.service';

describe('SignLocationsService', () => {
  let service: SignLocationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignLocationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
