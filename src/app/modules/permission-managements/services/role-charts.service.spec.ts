import { TestBed } from '@angular/core/testing';

import { RoleChartsService } from './role-charts.service';

describe('RoleChartsService', () => {
  let service: RoleChartsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleChartsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
