import { TestBed } from '@angular/core/testing';

import { AutomaticSignService } from './automatic-sign.service';

describe('AutomaticSignService', () => {
  let service: AutomaticSignService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutomaticSignService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
