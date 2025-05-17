import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsAndApprovalsComponent } from './requests-and-approvals.component';

describe('RequestsAndApprovalsComponent', () => {
  let component: RequestsAndApprovalsComponent;
  let fixture: ComponentFixture<RequestsAndApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestsAndApprovalsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestsAndApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
