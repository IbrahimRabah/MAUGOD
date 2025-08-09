import { TestBed } from '@angular/core/testing';

import { AccessPermissionsService } from './access-permissions.service';

describe('AccessPermissionsService', () => {
  let service: AccessPermissionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessPermissionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
