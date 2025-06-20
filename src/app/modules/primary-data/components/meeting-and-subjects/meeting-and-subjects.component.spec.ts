import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingAndSubjectsComponent } from './meeting-and-subjects.component';

describe('MeetingAndSubjectsComponent', () => {
  let component: MeetingAndSubjectsComponent;
  let fixture: ComponentFixture<MeetingAndSubjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MeetingAndSubjectsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeetingAndSubjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
