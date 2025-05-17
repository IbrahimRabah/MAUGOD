import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryAddDeductsAssignComponent } from './salary-add-deducts-assign.component';

describe('SalaryAddDeductsAssignComponent', () => {
  let component: SalaryAddDeductsAssignComponent;
  let fixture: ComponentFixture<SalaryAddDeductsAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalaryAddDeductsAssignComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalaryAddDeductsAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
