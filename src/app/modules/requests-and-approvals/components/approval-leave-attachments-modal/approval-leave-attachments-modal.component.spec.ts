import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalLeaveAttachmentsModalComponent } from './approval-leave-attachments-modal.component';

describe('ApprovalLeaveAttachmentsModalComponent', () => {
  let component: ApprovalLeaveAttachmentsModalComponent;
  let fixture: ComponentFixture<ApprovalLeaveAttachmentsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApprovalLeaveAttachmentsModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApprovalLeaveAttachmentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
