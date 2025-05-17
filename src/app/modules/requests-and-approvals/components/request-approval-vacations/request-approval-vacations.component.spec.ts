import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestApprovalVacationsComponent } from './request-approval-vacations.component';

describe('RequestApprovalVacationsComponent', () => {
  let component: RequestApprovalVacationsComponent;
  let fixture: ComponentFixture<RequestApprovalVacationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestApprovalVacationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestApprovalVacationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
