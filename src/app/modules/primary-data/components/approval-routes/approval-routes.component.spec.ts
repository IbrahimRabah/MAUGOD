import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalRoutesComponent } from './approval-routes.component';

describe('ApprovalRoutesComponent', () => {
  let component: ApprovalRoutesComponent;
  let fixture: ComponentFixture<ApprovalRoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApprovalRoutesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApprovalRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
