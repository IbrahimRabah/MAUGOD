import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepsToApproveChangingTimeComponent } from './steps-to-approve-changing-time.component';

describe('StepsToApproveChangingTimeComponent', () => {
  let component: StepsToApproveChangingTimeComponent;
  let fixture: ComponentFixture<StepsToApproveChangingTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StepsToApproveChangingTimeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StepsToApproveChangingTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
