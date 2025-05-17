import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryAddOnsDeductsComponent } from './salary-add-ons-deducts.component';

describe('SalaryAddOnsDeductsComponent', () => {
  let component: SalaryAddOnsDeductsComponent;
  let fixture: ComponentFixture<SalaryAddOnsDeductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalaryAddOnsDeductsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalaryAddOnsDeductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
