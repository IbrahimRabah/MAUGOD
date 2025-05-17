import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceStatusClassificationsComponent } from './attendance-status-classifications.component';

describe('AttendanceStatusClassificationsComponent', () => {
  let component: AttendanceStatusClassificationsComponent;
  let fixture: ComponentFixture<AttendanceStatusClassificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttendanceStatusClassificationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttendanceStatusClassificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
