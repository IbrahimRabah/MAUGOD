import { TestBed } from '@angular/core/testing';

import { RoleModuleRightService } from './role-module-right.service';

describe('RoleModuleRightService', () => {
  let service: RoleModuleRightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleModuleRightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
