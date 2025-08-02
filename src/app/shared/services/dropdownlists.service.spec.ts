import { TestBed } from '@angular/core/testing';

import { DropdownlistsService } from './dropdownlists.service';

describe('DropdownlistsService', () => {
  let service: DropdownlistsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropdownlistsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
