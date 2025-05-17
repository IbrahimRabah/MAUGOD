import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissingDaysWithNoShiftsComponent } from './missing-days-with-no-shifts.component';

describe('MissingDaysWithNoShiftsComponent', () => {
  let component: MissingDaysWithNoShiftsComponent;
  let fixture: ComponentFixture<MissingDaysWithNoShiftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MissingDaysWithNoShiftsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MissingDaysWithNoShiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
