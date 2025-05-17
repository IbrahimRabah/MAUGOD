import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceStatusesComponent } from './attendance-statuses.component';

describe('AttendanceStatusesComponent', () => {
  let component: AttendanceStatusesComponent;
  let fixture: ComponentFixture<AttendanceStatusesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttendanceStatusesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttendanceStatusesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
