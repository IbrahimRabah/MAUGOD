import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectClassComponent } from './subject-class.component';

describe('SubjectClassComponent', () => {
  let component: SubjectClassComponent;
  let fixture: ComponentFixture<SubjectClassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubjectClassComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubjectClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
