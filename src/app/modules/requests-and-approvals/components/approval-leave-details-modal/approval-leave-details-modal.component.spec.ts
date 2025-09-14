import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalLeaveDetailsModalComponent } from './approval-leave-details-modal.component';

describe('ApprovalLeaveDetailsModalComponent', () => {
  let component: ApprovalLeaveDetailsModalComponent;
  let fixture: ComponentFixture<ApprovalLeaveDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApprovalLeaveDetailsModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApprovalLeaveDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
