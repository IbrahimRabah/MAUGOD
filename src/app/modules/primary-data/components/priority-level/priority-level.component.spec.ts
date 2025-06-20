import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorityLevelComponent } from './priority-level.component';

describe('PriorityLevelComponent', () => {
  let component: PriorityLevelComponent;
  let fixture: ComponentFixture<PriorityLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PriorityLevelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PriorityLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
