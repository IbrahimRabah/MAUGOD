import { TestBed } from '@angular/core/testing';

import { PostRequestService } from './post-request.service';

describe('PostRequestService', () => {
  let service: PostRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
