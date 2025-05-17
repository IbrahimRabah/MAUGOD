import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplyeesStatusesComponent } from './emplyees-statuses.component';

describe('EmplyeesStatusesComponent', () => {
  let component: EmplyeesStatusesComponent;
  let fixture: ComponentFixture<EmplyeesStatusesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmplyeesStatusesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmplyeesStatusesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
