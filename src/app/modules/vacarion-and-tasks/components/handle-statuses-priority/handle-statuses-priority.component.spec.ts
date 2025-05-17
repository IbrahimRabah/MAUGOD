import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandleStatusesPriorityComponent } from './handle-statuses-priority.component';

describe('HandleStatusesPriorityComponent', () => {
  let component: HandleStatusesPriorityComponent;
  let fixture: ComponentFixture<HandleStatusesPriorityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HandleStatusesPriorityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HandleStatusesPriorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
