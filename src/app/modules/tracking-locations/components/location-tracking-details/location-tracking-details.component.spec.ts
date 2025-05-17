import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationTrackingDetailsComponent } from './location-tracking-details.component';

describe('LocationTrackingDetailsComponent', () => {
  let component: LocationTrackingDetailsComponent;
  let fixture: ComponentFixture<LocationTrackingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LocationTrackingDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LocationTrackingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
