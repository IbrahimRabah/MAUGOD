import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeAttendanceTimeDirectlyComponent } from './change-attendance-time-directly.component';

describe('ChangeAttendanceTimeDirectlyComponent', () => {
  let component: ChangeAttendanceTimeDirectlyComponent;
  let fixture: ComponentFixture<ChangeAttendanceTimeDirectlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangeAttendanceTimeDirectlyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangeAttendanceTimeDirectlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
