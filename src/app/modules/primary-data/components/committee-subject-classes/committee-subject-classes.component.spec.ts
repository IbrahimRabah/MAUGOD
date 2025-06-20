import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeSubjectClassesComponent } from './committee-subject-classes.component';

describe('CommitteeSubjectClassesComponent', () => {
  let component: CommitteeSubjectClassesComponent;
  let fixture: ComponentFixture<CommitteeSubjectClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommitteeSubjectClassesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommitteeSubjectClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
