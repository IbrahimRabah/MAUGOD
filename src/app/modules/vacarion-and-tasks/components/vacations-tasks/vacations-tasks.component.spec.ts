import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacationsTasksComponent } from './vacations-tasks.component';

describe('VacationsTasksComponent', () => {
  let component: VacationsTasksComponent;
  let fixture: ComponentFixture<VacationsTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VacationsTasksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VacationsTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
