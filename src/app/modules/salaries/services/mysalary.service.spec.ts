import { TestBed } from '@angular/core/testing';

import { MysalaryService } from './mysalary.service';

describe('MysalaryService', () => {
  let service: MysalaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MysalaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
