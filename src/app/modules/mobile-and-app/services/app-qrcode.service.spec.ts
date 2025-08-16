import { TestBed } from '@angular/core/testing';

import { AppQRCodeService } from './app-qrcode.service';

describe('AppQRCodeService', () => {
  let service: AppQRCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppQRCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
