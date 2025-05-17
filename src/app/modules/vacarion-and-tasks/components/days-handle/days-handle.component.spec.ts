import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaysHandleComponent } from './days-handle.component';

describe('DaysHandleComponent', () => {
  let component: DaysHandleComponent;
  let fixture: ComponentFixture<DaysHandleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DaysHandleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DaysHandleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
