import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestApprovalRouteComponent } from './request-approval-route.component';

describe('RequestApprovalRouteComponent', () => {
  let component: RequestApprovalRouteComponent;
  let fixture: ComponentFixture<RequestApprovalRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestApprovalRouteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestApprovalRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
