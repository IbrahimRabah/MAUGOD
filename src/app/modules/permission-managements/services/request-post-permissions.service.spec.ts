import { TestBed } from '@angular/core/testing';

import { RequestPostPermissionsService } from './request-post-permissions.service';

describe('RequestPostPermissionsService', () => {
  let service: RequestPostPermissionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestPostPermissionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
