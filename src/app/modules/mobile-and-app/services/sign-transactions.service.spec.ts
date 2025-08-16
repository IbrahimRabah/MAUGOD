import { TestBed } from '@angular/core/testing';

import { SignTransactionsService } from './sign-transactions.service';

describe('SignTransactionsService', () => {
  let service: SignTransactionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignTransactionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
