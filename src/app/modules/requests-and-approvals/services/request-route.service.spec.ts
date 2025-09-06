import { TestBed } from '@angular/core/testing';

import { RequestRouteService } from './request-route.service';

describe('RequestRouteService', () => {
  let service: RequestRouteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestRouteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
