import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestPostPremisionsComponent } from './request-post-premisions.component';

describe('RequestPostPremisionsComponent', () => {
  let component: RequestPostPremisionsComponent;
  let fixture: ComponentFixture<RequestPostPremisionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestPostPremisionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestPostPremisionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
