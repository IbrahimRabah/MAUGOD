import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandleStatusesEmployeeBalanceComponent } from './handle-statuses-employee-balance.component';

describe('HandleStatusesEmployeeBalanceComponent', () => {
  let component: HandleStatusesEmployeeBalanceComponent;
  let fixture: ComponentFixture<HandleStatusesEmployeeBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HandleStatusesEmployeeBalanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HandleStatusesEmployeeBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
