import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftsSectionComponent } from './shifts-section.component';

describe('ShiftsSectionComponent', () => {
  let component: ShiftsSectionComponent;
  let fixture: ComponentFixture<ShiftsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShiftsSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShiftsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
