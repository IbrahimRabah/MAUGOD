import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftsAssignComponent } from './shifts-assign.component';

describe('ShiftsAssignComponent', () => {
  let component: ShiftsAssignComponent;
  let fixture: ComponentFixture<ShiftsAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShiftsAssignComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShiftsAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
