import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileSignLocationAssignComponent } from './mobile-sign-location-assign.component';

describe('MobileSignLocationAssignComponent', () => {
  let component: MobileSignLocationAssignComponent;
  let fixture: ComponentFixture<MobileSignLocationAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MobileSignLocationAssignComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MobileSignLocationAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
