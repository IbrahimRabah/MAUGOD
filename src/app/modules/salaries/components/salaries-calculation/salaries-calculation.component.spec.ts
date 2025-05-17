import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalariesCalculationComponent } from './salaries-calculation.component';

describe('SalariesCalculationComponent', () => {
  let component: SalariesCalculationComponent;
  let fixture: ComponentFixture<SalariesCalculationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalariesCalculationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalariesCalculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
